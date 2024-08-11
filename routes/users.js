const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const Joi = require('joi');
const logger = require('../config/logger');

const router = express.Router();

// Registration schema
const registrationSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
});

// Register user
router.post('/register', (req, res) => {
    const { error } = registrationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `INSERT INTO Users (username, password) VALUES (?, ?)`;
    db.run(query, [username, hashedPassword], function(err) {
        if (err) {
            logger.error("Error registering user: " + err.message);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.status(201).json({ message: "User registered successfully" });
    });
});

// Login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM Users WHERE username = ?`;
    db.get(query, [username], (err, user) => {
        if (err) {
            logger.error("Error fetching user: " + err.message);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });
    });
});

module.exports = router;
