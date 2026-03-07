require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const studentRoutes = require('./routes/students');

// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.get('', (req, res) => {
    res.status(200).json({ message: 'Server is running!' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

app.use('/api/students', studentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
