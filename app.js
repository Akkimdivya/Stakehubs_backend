const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const logger = require('./config/logger');

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.use('/api', userRoutes);
app.use('/api', orderRoutes);

app.use((err, req, res, next) => {
    logger.error(err.stack || err.message);
    res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
