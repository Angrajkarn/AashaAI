#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 AashaAI AWS Enterprise Deployment Script"
echo "=========================================================="

# Ensure AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "ERROR: AWS CLI is not installed. Please install it first."
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
REGION=${REGION:-us-east-1}

ENVIRONMENT_NAME="aasha-ai-prod"

echo "Using AWS Account: $ACCOUNT_ID in Region: $REGION"

read -s -p "Enter a secure master password for the PostgreSQL Database (min 8 chars): " DB_PASSWORD
echo ""

echo "----------------------------------------------------------"
echo "1. Provisioning AWS Infrastructure via CloudFormation..."
echo "----------------------------------------------------------"
aws cloudformation deploy \
    --template-file ./infrastructure/aws/aws-infrastructure.yaml \
    --stack-name $ENVIRONMENT_NAME \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides DatabasePassword=$DB_PASSWORD \
    || echo "Stack already exists or failed to update. Proceeding..."

echo "----------------------------------------------------------"
echo "2. Building & Pushing Docker Images to Amazon ECR..."
echo "----------------------------------------------------------"

# Authenticate Docker client to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Backend
echo "Building Backend Image..."
docker build -t $ENVIRONMENT_NAME-backend -f backend/Dockerfile .
docker tag $ENVIRONMENT_NAME-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ENVIRONMENT_NAME-backend:latest
echo "Pushing Backend Image..."
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ENVIRONMENT_NAME-backend:latest

# Frontend
echo "Building Frontend Image..."
docker build -t $ENVIRONMENT_NAME-frontend -f frontend/Dockerfile ./frontend
docker tag $ENVIRONMENT_NAME-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ENVIRONMENT_NAME-frontend:latest
echo "Pushing Frontend Image..."
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ENVIRONMENT_NAME-frontend:latest

echo "----------------------------------------------------------"
echo "3. Forcing New ECS Deployment..."
echo "----------------------------------------------------------"
aws ecs update-service \
    --cluster $ENVIRONMENT_NAME-cluster \
    --service $ENVIRONMENT_NAME-service \
    --force-new-deployment > /dev/null

echo "=========================================================="
echo "✅ Deployment Triggered Successfully!"
echo "It may take 2-4 minutes for the new containers to reach RUNNING state."
echo ""
ALB_URL=$(aws cloudformation describe-stacks --stack-name $ENVIRONMENT_NAME --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" --output text)
echo "🌐 Your Enterprise AashaAI Link: $ALB_URL"
echo "=========================================================="
