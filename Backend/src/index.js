require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const studentRoutes = require("./routes/students");
const schoolRoutes = require("./routes/schools");

// Middleware
app.use(cors());
app.use(express.json());


// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Student API Server",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      schools: {
        getAll: "GET /api/schools",
        listByDistance:
          "GET /api/schools/listSchools?latitude=<lat>&longitude=<lon>",
        getById: "GET /api/schools/:id",
        add: "POST /api/schools/addSchool",
        update: "PUT /api/schools/:id",
        delete: "DELETE /api/schools/:id",
      },
      students: {
        getAll: "GET /api/students",
        getById: "GET /api/students/:id",
        add: "POST /api/students",
        update: "PUT /api/students/:id",
        delete: "DELETE /api/students/:id",
      },
    },
  });
});


// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});


// Routes
app.use("/api/students", studentRoutes);
app.use("/api/schools", schoolRoutes);


// Start server after DB connection test
async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("✓ Database connected successfully!");
    connection.release();

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;