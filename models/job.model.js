const { ObjectId } = require("mongodb");

class JobModel {
  constructor(db) {
    this.collection = db.collection("jobs");
    this.acceptedJobsCollection = db.collection("acceptedJobs");
  }

  async createIndexes() {
    try {
      await this.collection.createIndex({ userEmail: 1 });
      await this.collection.createIndex({ category: 1 });
      await this.collection.createIndex({ postedDate: -1 });
      console.log("Database indexes created");
    } catch (error) {
      console.error("Index creation error:", error);
    }
  }

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

  async getAllJobs(sortBy = "postedDate", sortOrder = -1) {
    const sort = {};
    sort[sortBy] = sortOrder;

    const jobs = await this.collection.find({}).sort(sort).toArray();

    return jobs;
  }

  async getLatestJobs(limit = 6) {
    const jobs = await this.collection
      .find({})
      .sort({ postedDate: -1 })
      .limit(limit)
      .toArray();

    return jobs;
  }

  async getJobsByCategory(category) {
    const jobs = await this.collection
      .find({ category })
      .sort({ postedDate: -1 })
      .toArray();

    return jobs;
  }

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

  async updateJob(id, userEmail, updateData) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid job ID format");
    }

    const existingJob = await this.getJobById(id);

    if (existingJob.userEmail !== userEmail) {
      throw new Error("Unauthorized: You can only update your own jobs");
    }

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

  async deleteJob(id, userEmail) {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid job ID format");
    }

    const job = await this.getJobById(id);

    if (job.userEmail !== userEmail) {
      throw new Error("Unauthorized: You can only delete your own jobs");
    }

    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    await this.acceptedJobsCollection.deleteMany({ jobId: id });

    return result;
  }

  async acceptJob(jobId, userEmail, userName) {
    if (!ObjectId.isValid(jobId)) {
      throw new Error("Invalid job ID format");
    }

    const job = await this.getJobById(jobId);

    if (job.userEmail === userEmail) {
      throw new Error("You cannot accept your own job posting");
    }

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
