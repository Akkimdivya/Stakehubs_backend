# Order Management Backend
{
  "username": "user1",
  "password": "password123"
}
## Overview

This is a Node.js backend application for managing orders, including functionalities for user authentication, creating orders, and handling order matching. The backend uses Express for routing, SQLite for the database, and JWT for authentication.

## Features

- User Registration and Authentication
- Order Creation and Matching
- Viewing Pending and Completed Orders
- SQLite Database for storage
Install dependencies:
npm install
Set up the environment variables:

Create a .env file in the root directory.
Add the following content:
makefile
Copy code
JWT_SECRET_KEY=your_jwt_secret
PORT=3000
Initialize the SQLite database:

node createSchema.js
Start the server:

node server.js
The server will start on the port specified in the .env file (default is 3000).

API Endpoints
1. User Registration
Endpoint: POST /api/register
Request Body:
{
  "username": "yourusername",
  "password": "yourpassword"
}
Response:
{
  "message": "User registered successfully"
}
2. User Login
Endpoint: POST /api/login
Request Body:
{
  "username": "yourusername",
  "password": "yourpassword"
}
Response:
{
  "token": "your.jwt.token"
}
3. Create Order
Endpoint: POST /api/order
Headers:
{
  "Authorization": "Bearer your.jwt.token"
}
Request Body:
{
  "buyer_qty": 100,
  "buyer_price": 98.5,
  "seller_price": 100.0,
  "seller_qty": 50
}
Response:
{
  "message": "Order processed successfully"
}
4. Get All Orders
Endpoint: GET /api/orders
Headers:
{
  "Authorization": "Bearer your.jwt.token"
}
# Response:
{
  "pendingOrders": [...],
  "completedOrders": [...]
}