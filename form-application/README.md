# Form Application — React + Express + Amazon S3 + Amazon RDS (MySQL)

A starter full-stack application with a form for name, age, and file upload.

## What it does
- React frontend submits `name`, `age`, and one file.
- Express backend validates the form and uploads the file to Amazon S3.
- Backend stores the form fields and the S3 object key in Amazon RDS for MySQL.
- The actual file is stored in S3; the database stores its key, not the file itself.

## Requirements
- Node.js 20+ (Node.js 22 LTS recommended)
- npm
- An AWS account
- An S3 bucket and an RDS MySQL database (these can be created later)

## 1. Run locally before connecting AWS

### Backend
```bash
cd backend
cp .env.example .env
npm install
```

Edit `backend/.env` with your AWS region, S3 bucket, and database connection details.

Create the database table using `backend/sql/schema.sql`.

Start the backend:
```bash
npm run dev
```

### Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually http://localhost:5173).

## 2. AWS setup notes

### S3
Create a private S3 bucket in your chosen AWS region. Keep Block Public Access enabled.
The backend uploads objects under the `uploads/` prefix.

### RDS
Create an Amazon RDS for MySQL database. Create a database named `form_app`, then run
`backend/sql/schema.sql` against it.

For local development, your RDS security group must allow inbound MySQL (TCP 3306)
from your current public IP only. Do not expose MySQL to `0.0.0.0/0`.
For production, prefer private RDS networking and access from the application server only.

### AWS credentials
For local development, configure credentials using the AWS CLI (`aws configure`) or an
AWS named profile. The AWS SDK uses the standard credential provider chain.
Do not paste AWS access keys into source code or commit them to GitHub.

For EC2 deployment, attach an IAM role to the EC2 instance with least-privilege
permissions for `s3:PutObject` on this bucket's `uploads/*` prefix. Prefer the role
instead of long-lived access keys.

### Environment variables
Copy `.env.example` to `.env` and fill in real values. Never commit `.env`.
The `.gitignore` files already exclude environment files and dependencies.

## 3. GitHub
From the project root:
```bash
git init
git add .
git commit -m "Initial full-stack form application"
```
Create an empty GitHub repository, then follow GitHub's instructions to add its remote
and push. Do not commit `.env`, AWS credentials, private keys, or `node_modules`.

## API
- `GET /api/health` — health check
- `POST /api/submissions` — multipart form with `name`, `age`, and `file`
- `GET /api/submissions` — list saved form submissions (does not expose public file URLs)

## Important
This is a learning starter, not a production-hardened upload service. Before production,
add authentication/authorization, rate limiting, malware scanning as appropriate, stronger
file-content validation, logging/monitoring, and a deliberate file-download authorization
flow. The current backend restricts extensions and MIME types and limits file size, but
client-supplied MIME types are not a security guarantee.
