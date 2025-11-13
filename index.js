require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./config/database");
const jobRoutes = require("./routes/job.routes");
const JobModel = require("./models/job.model");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Freelance Marketplace API is running!",
    version: "1.0.0",
    endpoints: {
      jobs: "/api/jobs",
      latestJobs: "/api/jobs/latest",
      myJobs: "/api/jobs/my-jobs/:email",
      acceptJob: "/api/jobs/accept",
      acceptedJobs: "/api/jobs/accepted/:email",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use("/api/jobs", jobRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    const db = await connectDB();

    // Create indexes
    const jobModel = new JobModel(db);
    await jobModel.createIndexes();

    // Start Express server
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 API URL: http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await closeDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  await closeDB();
  process.exit(0);
});

// Start the server
startServer();
