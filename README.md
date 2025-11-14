# Freelance Marketplace Server

Backend API for the Freelance Marketplace (Assignment B12-A10).

## Setup

Install dependencies:

```bash
npm install
npm run dev
```

## API Endpoints

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/latest` - Get latest jobs for homepage
- `GET /api/jobs/:id` - Get single job
- `GET /api/jobs/my-jobs/:email` - Get jobs by user
- `POST /api/jobs` - Add new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Accepted Jobs

- `POST /api/jobs/accept` - Accept a job
- `GET /api/jobs/accepted/:email` - Get accepted jobs
- `DELETE /api/jobs/accepted/:id` - Remove accepted job

## Request Examples

### Add Job

```json
POST /api/jobs
{
  "title": "Build React Website",
  "postedBy": "John Doe",
  "category": "Web Development",
  "summary": "Description here",
  "coverImage": "https://example.com/image.jpg",
  "userEmail": "user@example.com"
}
```

### Update Job

```json
PUT /api/jobs/:id
{
  "userEmail": "user@example.com",
  "title": "Updated Title",
  "summary": "Updated description"
}
```

### Accept Job

```json
POST /api/jobs/accept
{
  "jobId": "123abc",
  "userEmail": "user@example.com",
  "userName": "John Doe"
}
```

## Notes

- Users can only update/delete their own jobs
- Users cannot accept their own job postings
- All responses return JSON with success status
