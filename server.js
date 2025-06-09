const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Enable CORS with more robust handling
const corsMiddleware = (req, res, next) => {
    // Allow requests from any origin (for development purposes)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Allow the following HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Allow the following headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        // Set status code 204 (No Content) for preflight requests
        res.status(204).send();
        return;
    }
    next();
};

app.use(corsMiddleware);

// Handle login requests
app.post('/user/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'zsb' && password === '123') {
        // Login successful, return token and user data
        const token = 'mock_token_123456';
        const userData = {
            id: 1,
            username: 'zsb',
            password: '123',
            emailAddress: 'zsb@example.com',
            telephone: '123456789',
            createTime: '2025-06-09',
            updateTime: '2025-06-09'
        };
        res.json({
            code: 0,
            message: 'Login successfully!',
            token,
            data: userData
        });
    } else {
        // Login failed
        res.status(401).json({
            code: 1,
            message: 'Invalid username or password'
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
