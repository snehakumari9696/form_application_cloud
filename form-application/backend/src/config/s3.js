const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  // Credentials are loaded from the AWS SDK default credential provider chain.
  // Use an IAM role on EC2; use AWS CLI credentials for local development.
});

module.exports = s3;
