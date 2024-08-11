const express = require('express');
const db = require('../config/db');
const Joi = require('joi');
const authenticateToken = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Order schema
const orderSchema = Joi.object({
    buyer_qty: Joi.number().integer().min(1).required(),
    buyer_price: Joi.number().positive().required(),
    seller_price: Joi.number().positive().required(),
    seller_qty: Joi.number().integer().min(1).required()
});

// Create order and match
router.post('/order', authenticateToken, (req, res) => {
    const { error } = orderSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { buyer_qty, buyer_price, seller_price, seller_qty } = req.body;

    db.serialize(() => {
        // Start an immediate transaction
        db.run("BEGIN IMMEDIATE TRANSACTION", (err) => {
            if (err) {
                logger.error("Error starting transaction: " + err.message);
                return res.status(500).json({ message: "Error starting transaction" });
            }

            db.all(`SELECT * FROM PendingOrderTable WHERE seller_price <= ? ORDER BY seller_price ASC`, [buyer_price], (err, rows) => {
                if (err) {
                    db.run("ROLLBACK");
                    logger.error("Error fetching pending orders: " + err.message);
                    return res.status(500).json({ message: "Internal server error" });
                }

                let remainingBuyerQty = buyer_qty;

                for (const order of rows) {
                    if (remainingBuyerQty <= 0) break;

                    const qtyToMatch = Math.min(remainingBuyerQty, order.seller_qty);
                    const matchedPrice = order.seller_price;

                    db.run(`INSERT INTO CompletedOrderTable (price, qty) VALUES (?, ?)`, [matchedPrice, qtyToMatch]);

                    if (order.seller_qty > qtyToMatch) {
                        db.run(`UPDATE PendingOrderTable SET seller_qty = seller_qty - ? WHERE id = ?`, [qtyToMatch, order.id]);
                    } else {
                        db.run(`DELETE FROM PendingOrderTable WHERE id = ?`, [order.id]);
                    }

                    remainingBuyerQty -= qtyToMatch;
                }

                if (remainingBuyerQty > 0) {
                    db.run(`INSERT INTO PendingOrderTable (buyer_qty, buyer_price, seller_price, seller_qty) VALUES (?, ?, ?, ?)`, 
                        [remainingBuyerQty, buyer_price, seller_price, seller_qty]);
                }

                db.run("COMMIT", (err) => {
                    if (err) {
                        logger.error("Transaction commit failed: " + err.message);
                        return res.status(500).json({ message: "Transaction commit failed" });
                    }
                    res.status(201).json({ message: "Order processed successfully" });
                });
            });
        });
    });
});

// Get all orders
router.get('/orders', authenticateToken, (req, res) => {
    db.serialize(() => {
        db.all(`SELECT * FROM PendingOrderTable`, (err, pendingOrders) => {
            if (err) {
                logger.error("Error fetching pending orders: " + err.message);
                return res.status(500).json({ message: "Internal server error" });
            }

            db.all(`SELECT * FROM CompletedOrderTable`, (err, completedOrders) => {
                if (err) {
                    logger.error("Error fetching completed orders: " + err.message);
                    return res.status(500).json({ message: "Internal server error" });
                }

                res.status(200).json({ pendingOrders, completedOrders });
            });
        });
    });
});

module.exports = router;
