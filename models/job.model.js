const { ObjectId } = require("mongodb");

class JobModel {
  constructor(db) {
    this.collection = db.collection("jobs");
    this.acceptedJobsCollection = db.collection("acceptedJobs");
  }

  // Create indexes for better performance
  async createIndexes() {
    try {
      await this.collection.createIndex({ userEmail: 1 });
      await this.collection.createIndex({ category: 1 });
      await this.collection.createIndex({ postedDate: -1 });
      console.log("✅ Database indexes created");
    } catch (error) {
      console.error("Index creation error:", error);
    }
  }

  // Validate job data
  validateJob(jobData) {
    const required = [
      "title",
      "postedBy",
      "category",
      "summary",
      "coverImage",
      "userEmail",
    ];
    const missing = required.filter((field) => !jobData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    return true;
  }

  // Add a new job
  async addJob(jobData) {
    this.validateJob(jobData);

    const job = {
      ...jobData,
      postedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(job);
    return result;
  }

  // Get all jobs with optional sorting
  async getAllJobs(sortBy = "postedDate", sortOrder = -1) {
    const sort = {};
    sort[sortBy] = sortOrder;

    const jobs = await this.collection.find({}).sort(sort).toArray();

    return jobs;
  }

  // Get latest N jobs for homepage
  async getLatestJobs(limit = 6) {
    const jobs = await this.collection
      .find({})
      .sort({ postedDate: -1 })
      .limit(limit)
      .toArray();

    return jobs;
  }

  // Get jobs by category
  async getJobsByCategory(category) {
    const jobs = await this.collection
      .find({ category })
      .sort({ postedDate: -1 })
      .toArray();

    return jobs;
  }

  // Get single job by ID
  async getJobById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid job ID format");
    }

    const job = await this.collection.findOne({ _id: new ObjectId(id) });

    if (!job) {
      throw new Error("Job not found");
    }

    return job;
  }

  // Get jobs added by specific user
  async getJobsByUser(userEmail) {
    if (!userEmail) {
      throw new Error("User email is required");
    }

    const jobs = await this.collection
      .find({ userEmail })
      .sort({ postedDate: -1 })
      .toArray();

    return jobs;
  }

  // Update job (only by owner)
  async updateJob(id, userEmail, updateData) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid job ID format");
    }

    // First, verify ownership
    const existingJob = await this.getJobById(id);

    if (existingJob.userEmail !== userEmail) {
      throw new Error("Unauthorized: You can only update your own jobs");
    }

    // Remove fields that shouldn't be updated
    const {
      _id,
      postedDate,
      userEmail: email,
      createdAt,
      ...allowedUpdates
    } = updateData;

    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error("Job not found");
    }

    return result;
  }

  // Delete job (only by owner)
  async deleteJob(id, userEmail) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid job ID format");
    }

    // Verify ownership before delete
    const job = await this.getJobById(id);

    if (job.userEmail !== userEmail) {
      throw new Error("Unauthorized: You can only delete your own jobs");
    }

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });

    // Also delete from accepted jobs if any
    await this.acceptedJobsCollection.deleteMany({ jobId: id });

    return result;
  }

  // Accept a job
  async acceptJob(jobId, userEmail, userName) {
    if (!ObjectId.isValid(jobId)) {
      throw new Error("Invalid job ID format");
    }

    const job = await this.getJobById(jobId);

    // Don't allow accepting own jobs
    if (job.userEmail === userEmail) {
      throw new Error("You cannot accept your own job posting");
    }

    // Check if already accepted by this user
    const existingAcceptance = await this.acceptedJobsCollection.findOne({
      jobId: jobId,
      acceptedByEmail: userEmail,
    });

    if (existingAcceptance) {
      throw new Error("You have already accepted this job");
    }

    const acceptedJob = {
      jobId: jobId,
      jobTitle: job.title,
      jobCategory: job.category,
      jobSummary: job.summary,
      jobCoverImage: job.coverImage,
      jobPostedBy: job.postedBy,
      jobOwnerEmail: job.userEmail,
      acceptedByEmail: userEmail,
      acceptedByName: userName,
      acceptedDate: new Date(),
      status: "accepted",
    };

    const result = await this.acceptedJobsCollection.insertOne(acceptedJob);
    return result;
  }

  // Get accepted jobs by user
  async getAcceptedJobsByUser(userEmail) {
    if (!userEmail) {
      throw new Error("User email is required");
    }

    const acceptedJobs = await this.acceptedJobsCollection
      .find({ acceptedByEmail: userEmail })
      .sort({ acceptedDate: -1 })
      .toArray();

    return acceptedJobs;
  }

  // Remove accepted job (mark as done or cancel)
  async removeAcceptedJob(acceptedJobId, userEmail) {
    if (!ObjectId.isValid(acceptedJobId)) {
      throw new Error("Invalid accepted job ID format");
    }

    const result = await this.acceptedJobsCollection.deleteOne({
      _id: new ObjectId(acceptedJobId),
      acceptedByEmail: userEmail,
    });

    if (result.deletedCount === 0) {
      throw new Error("Accepted job not found or unauthorized");
    }

    return result;
  }

  // Get statistics (optional - useful for admin/analytics)
  async getStats() {
    const totalJobs = await this.collection.countDocuments();
    const totalAcceptedJobs =
      await this.acceptedJobsCollection.countDocuments();

    const categoryCounts = await this.collection
      .aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    return {
      totalJobs,
      totalAcceptedJobs,
      categoryCounts,
    };
  }
}

module.exports = JobModel;
