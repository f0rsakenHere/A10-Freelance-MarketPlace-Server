# Freelance Marketplace Backend API

Backend API for the Freelance Marketplace assignment (B12-A10).

## 🚀 Server Status

**✅ Server is running successfully on port 5000**

- MongoDB: Connected
- Environment: Development
- API Base URL: `http://localhost:5000`

---

## 📁 Project Structure

```
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   └── job.model.js         # Job model with all CRUD operations
├── routes/
│   └── job.routes.js        # All API route handlers
├── .env                     # Environment variables (not in git)
├── .gitignore              # Git ignore file
├── index.js                # Main server file
└── package.json            # Dependencies and scripts
```

---

## 🔧 Environment Variables (.env)

```env
MONGODB_URI=mongodb+srv://marketDB:np8cvagyTP3lBpwF@cluster0.vncyh4i.mongodb.net/freelanceMarketplace?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=freelanceMarketplace
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start
```

---

## 🛣️ API Endpoints

### Base Routes

#### 1. **Root Endpoint**

```http
GET /
```

**Response:**

```json
{
  "success": true,
  "message": "Freelance Marketplace API is running!",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

#### 2. **Health Check**

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-13T...",
  "uptime": 123.45
}
```

---

### Job Endpoints

#### 3. **Get All Jobs** (with sorting)

```http
GET /api/jobs?sortBy=postedDate&sortOrder=desc
```

**Query Parameters:**

- `sortBy` (optional): `postedDate` (default), `title`, `category`
- `sortOrder` (optional): `desc` (default), `asc`

**Response:**

```json
{
  "success": true,
  "count": 10,
  "data": [ ...jobs ]
}
```

#### 4. **Get Latest Jobs** (for homepage)

```http
GET /api/jobs/latest?limit=6
```

**Query Parameters:**

- `limit` (optional): Number of jobs (default: 6)

**Response:**

```json
{
  "success": true,
  "count": 6,
  "data": [ ...latest jobs ]
}
```

#### 5. **Get Jobs by Category**

```http
GET /api/jobs/category/:category
```

**Example:** `/api/jobs/category/Web Development`

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [ ...jobs in category ]
}
```

#### 6. **Get Single Job**

```http
GET /api/jobs/:id
```

**Response:**

```json
{
  "success": true,
  "data": { ...job details }
}
```

#### 7. **Get My Added Jobs**

```http
GET /api/jobs/my-jobs/:email
```

**Example:** `/api/jobs/my-jobs/user@example.com`

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [ ...user's jobs ]
}
```

#### 8. **Add New Job**

```http
POST /api/jobs
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Build a React Website",
  "postedBy": "John Doe",
  "category": "Web Development",
  "summary": "Need a modern React website with...",
  "coverImage": "https://i.ibb.co/image.jpg",
  "userEmail": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job added successfully",
  "data": {
    "insertedId": "6543..."
  }
}
```

#### 9. **Update Job**

```http
PUT /api/jobs/:id
Content-Type: application/json
```

**Request Body:**

```json
{
  "userEmail": "john@example.com",
  "title": "Updated Title",
  "category": "Digital Marketing",
  "summary": "Updated description",
  "coverImage": "https://i.ibb.co/newimage.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "modifiedCount": 1
  }
}
```

**Note:** Only the job owner can update their job

#### 10. **Delete Job**

```http
DELETE /api/jobs/:id
Content-Type: application/json
```

**Request Body:**

```json
{
  "userEmail": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job deleted successfully",
  "data": {
    "deletedCount": 1
  }
}
```

**Note:** Only the job owner can delete their job

---

### Accepted Jobs Endpoints

#### 11. **Accept a Job**

```http
POST /api/jobs/accept
Content-Type: application/json
```

**Request Body:**

```json
{
  "jobId": "6543...",
  "userEmail": "jane@example.com",
  "userName": "Jane Smith"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job accepted successfully",
  "data": {
    "insertedId": "6544..."
  }
}
```

**Note:**

- Users cannot accept their own jobs
- Users cannot accept the same job twice

#### 12. **Get My Accepted Tasks**

```http
GET /api/jobs/accepted/:email
```

**Example:** `/api/jobs/accepted/jane@example.com`

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6544...",
      "jobId": "6543...",
      "jobTitle": "Build a React Website",
      "jobCategory": "Web Development",
      "jobSummary": "...",
      "jobCoverImage": "https://...",
      "jobPostedBy": "John Doe",
      "jobOwnerEmail": "john@example.com",
      "acceptedByEmail": "jane@example.com",
      "acceptedByName": "Jane Smith",
      "acceptedDate": "2025-11-13T...",
      "status": "accepted"
    }
  ]
}
```

#### 13. **Remove Accepted Job** (Done/Cancel)

```http
DELETE /api/jobs/accepted/:id
Content-Type: application/json
```

**Request Body:**

```json
{
  "userEmail": "jane@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Accepted job removed successfully",
  "data": {
    "deletedCount": 1
  }
}
```

---

### Statistics Endpoint (Optional)

#### 14. **Get Statistics**

```http
GET /api/jobs/stats/all
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalJobs": 25,
    "totalAcceptedJobs": 10,
    "categoryCounts": [
      { "_id": "Web Development", "count": 15 },
      { "_id": "Digital Marketing", "count": 7 },
      { "_id": "Graphics Design", "count": 3 }
    ]
  }
}
```

---

## 📊 Database Collections

### `jobs` Collection

```javascript
{
  _id: ObjectId,
  title: String,
  postedBy: String,
  category: String,
  summary: String,
  coverImage: String,
  userEmail: String,
  postedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### `acceptedJobs` Collection

```javascript
{
  _id: ObjectId,
  jobId: String,
  jobTitle: String,
  jobCategory: String,
  jobSummary: String,
  jobCoverImage: String,
  jobPostedBy: String,
  jobOwnerEmail: String,
  acceptedByEmail: String,
  acceptedByName: String,
  acceptedDate: Date,
  status: String
}
```

---

## 🔒 Security Features

✅ Environment variables for sensitive data  
✅ CORS configured for frontend origins  
✅ User authorization for update/delete operations  
✅ Input validation for all endpoints  
✅ Proper error handling with status codes  
✅ Database indexes for performance

---

## ✅ Assignment Requirements Checklist

### Required Endpoints (All Implemented)

- ✅ `/api/jobs` - GET all jobs (with sorting)
- ✅ `/api/jobs/latest` - GET latest 6 jobs
- ✅ `/api/jobs/:id` - GET single job
- ✅ `/api/jobs` - POST new job
- ✅ `/api/jobs/:id` - PUT update job
- ✅ `/api/jobs/:id` - DELETE job
- ✅ `/api/jobs/my-jobs/:email` - GET user's jobs
- ✅ `/api/jobs/accept` - POST accept job
- ✅ `/api/jobs/accepted/:email` - GET accepted jobs
- ✅ `/api/jobs/accepted/:id` - DELETE accepted job

### Features Implemented

- ✅ MongoDB connection with error handling
- ✅ CRUD operations for jobs
- ✅ User authorization (can't edit/delete others' jobs)
- ✅ Accept job functionality
- ✅ Prevent accepting own jobs
- ✅ Sort by posted date (Challenge #1)
- ✅ Proper error responses with status codes
- ✅ Environment variables (.env)
- ✅ Graceful server shutdown

---

## 🧪 Testing the API

You can test the API using:

1. **Postman** - Import the endpoints above
2. **Thunder Client** (VS Code extension)
3. **cURL** commands
4. Your React frontend

### Example Test with cURL:

```bash
# Get all jobs
curl http://localhost:5000/api/jobs

# Add a job
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "postedBy": "Test User",
    "category": "Web Development",
    "summary": "This is a test job",
    "coverImage": "https://i.ibb.co/test.jpg",
    "userEmail": "test@example.com"
  }'
```

---

## 📝 Next Steps for Frontend Integration

1. **Install Axios or TanStack Query** in your React app
2. **Create API service file** with base URL: `http://localhost:5000/api`
3. **Implement authentication context** (Firebase)
4. **Pass userEmail from Firebase Auth** to API endpoints
5. **Test all CRUD operations** from your UI

---

## 🚀 Deployment Checklist

### For Vercel:

1. Update `vercel.json` configuration
2. Add environment variables in Vercel dashboard
3. Update `CLIENT_URL` in production `.env`

### Environment Variables to Add:

```
MONGODB_URI=your_production_uri
DB_NAME=freelanceMarketplace
NODE_ENV=production
CLIENT_URL=your_frontend_url
```

---

## 👨‍💻 Developer Notes

- Server runs on port **5000** by default
- All dates are stored as JavaScript `Date` objects
- MongoDB automatically creates collections on first insert
- Indexes are created automatically on server start
- All endpoints return JSON responses
- CORS is configured for localhost:5173, 5174, and 3000

---

**✅ Backend is 100% complete and ready for frontend integration!**
