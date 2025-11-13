const express = require("express");
const router = express.Router();
const { getDB } = require("../config/database");
const JobModel = require("../models/job.model");

// Middleware to get job model instance
const getJobModel = (req, res, next) => {
  try {
    const db = getDB();
    req.jobModel = new JobModel(db);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection error",
      error: error.message,
    });
  }
};

// Apply middleware to all routes
router.use(getJobModel);

// ==================== JOB ROUTES ====================

// Get latest 6 jobs (for homepage)
router.get("/latest", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const jobs = await req.jobModel.getLatestJobs(limit);

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest jobs",
      error: error.message,
    });
  }
});

// Get all jobs with optional sorting
router.get("/", async (req, res) => {
  try {
    const { sortBy = "postedDate", sortOrder = "desc" } = req.query;
    const order = sortOrder === "asc" ? 1 : -1;

    const jobs = await req.jobModel.getAllJobs(sortBy, order);

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
});

// Get jobs by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const jobs = await req.jobModel.getJobsByCategory(category);

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs by category",
      error: error.message,
    });
  }
});

// Get jobs by user email (My Added Jobs)
router.get("/my-jobs/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const jobs = await req.jobModel.getJobsByUser(email);

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user jobs",
      error: error.message,
    });
  }
});

// Get single job by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await req.jobModel.getJobById(id);

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid")
      ? 400
      : error.message.includes("not found")
      ? 404
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
});

// Add new job
router.post("/", async (req, res) => {
  try {
    const jobData = req.body;
    const result = await req.jobModel.addJob(jobData);

    res.status(201).json({
      success: true,
      message: "Job added successfully",
      data: {
        insertedId: result.insertedId,
      },
    });
  } catch (error) {
    const statusCode = error.message.includes("Missing") ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: "Failed to add job",
      error: error.message,
    });
  }
});

// Update job
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, ...updateData } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required for authorization",
      });
    }

    const result = await req.jobModel.updateJob(id, userEmail, updateData);

    res.json({
      success: true,
      message: "Job updated successfully",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid")
      ? 400
      : error.message.includes("Unauthorized")
      ? 403
      : error.message.includes("not found")
      ? 404
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete job
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required for authorization",
      });
    }

    const result = await req.jobModel.deleteJob(id, userEmail);

    res.json({
      success: true,
      message: "Job deleted successfully",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid")
      ? 400
      : error.message.includes("Unauthorized")
      ? 403
      : error.message.includes("not found")
      ? 404
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== ACCEPTED JOBS ROUTES ====================

// Accept a job
router.post("/accept", async (req, res) => {
  try {
    const { jobId, userEmail, userName } = req.body;

    if (!jobId || !userEmail || !userName) {
      return res.status(400).json({
        success: false,
        message: "jobId, userEmail, and userName are required",
      });
    }

    const result = await req.jobModel.acceptJob(jobId, userEmail, userName);

    res.status(201).json({
      success: true,
      message: "Job accepted successfully",
      data: {
        insertedId: result.insertedId,
      },
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid")
      ? 400
      : error.message.includes("cannot accept")
      ? 403
      : error.message.includes("already accepted")
      ? 409
      : error.message.includes("not found")
      ? 404
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
});

// Get accepted jobs by user
router.get("/accepted/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const acceptedJobs = await req.jobModel.getAcceptedJobsByUser(email);

    res.json({
      success: true,
      count: acceptedJobs.length,
      data: acceptedJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch accepted jobs",
      error: error.message,
    });
  }
});

// Remove accepted job (Done/Cancel)
router.delete("/accepted/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required for authorization",
      });
    }

    const result = await req.jobModel.removeAcceptedJob(id, userEmail);

    res.json({
      success: true,
      message: "Accepted job removed successfully",
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    const statusCode = error.message.includes("Invalid")
      ? 400
      : error.message.includes("not found")
      ? 404
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== STATS ROUTE (Optional) ====================

// Get statistics
router.get("/stats/all", async (req, res) => {
  try {
    const stats = await req.jobModel.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

module.exports = router;
