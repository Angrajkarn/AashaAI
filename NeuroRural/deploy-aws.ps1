# ==========================================================
# AashaAI AWS Enterprise Deployment Script (Windows PowerShell)
# ==========================================================
$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 AashaAI AWS Enterprise Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Verify AWS CLI
try {
    aws --version | Out-Null
}
catch {
    Write-Error "ERROR: AWS CLI is not installed. Please install it from https://aws.amazon.com/cli/"
    exit 1
}

# Verify Docker
try {
    docker --version | Out-Null
}
catch {
    Write-Warning "WARNING: Docker is not installed or not running. Image build steps will be skipped."
    $SkipDocker = $true
}

$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text).Trim()
$REGION = (aws configure get region).Trim()
if (-not $REGION) { $REGION = "us-east-1" }

$ENVIRONMENT_NAME = "aasha-ai-prod"

Write-Host "Using AWS Account: $ACCOUNT_ID in Region: $REGION" -ForegroundColor Green

# Hardcoded password for automated deployment
$DB_PASSWORD = "AashaAIPassword@2026"

# ----------------------------------------------------------
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "1. Provisioning AWS Infrastructure via CloudFormation..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

aws cloudformation deploy `
    --template-file ".\infrastructure\aws\aws-infrastructure.yaml" `
    --stack-name $ENVIRONMENT_NAME `
    --capabilities CAPABILITY_IAM `
    --parameter-overrides "DatabasePassword=$DB_PASSWORD"

if ($LASTEXITCODE -ne 0) {
    Write-Warning "CloudFormation deploy returned non-zero exit code. Stack may already exist. Continuing..."
}

if (-not $SkipDocker) {
    # ----------------------------------------------------------
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "2. Building & Pushing Docker Images to Amazon ECR..." -ForegroundColor Yellow
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

    # Authenticate Docker client to ECR
    $LoginCmd = aws ecr get-login-password --region $REGION
    $LoginCmd | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

    # Create ECR repos if they don't exist
    try {
        aws ecr create-repository --repository-name "$ENVIRONMENT_NAME-backend" --region $REGION 2>$null
    }
    catch {}
    try {
        aws ecr create-repository --repository-name "$ENVIRONMENT_NAME-frontend" --region $REGION 2>$null
    }
    catch {}

    # Backend
    Write-Host "Building Backend Image..." -ForegroundColor Green
    docker build -t "$ENVIRONMENT_NAME-backend" -f "backend\Dockerfile" .
    docker tag "${ENVIRONMENT_NAME}-backend:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${ENVIRONMENT_NAME}-backend:latest"
    Write-Host "Pushing Backend Image..." -ForegroundColor Green
    docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${ENVIRONMENT_NAME}-backend:latest"

    # Frontend
    Write-Host "Building Frontend Image..." -ForegroundColor Green
    docker build -t "$ENVIRONMENT_NAME-frontend" -f "frontend\Dockerfile" ".\frontend"
    docker tag "${ENVIRONMENT_NAME}-frontend:latest" "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${ENVIRONMENT_NAME}-frontend:latest"
    Write-Host "Pushing Frontend Image..." -ForegroundColor Green
    docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/${ENVIRONMENT_NAME}-frontend:latest"

    # ----------------------------------------------------------
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host "3. Forcing New ECS Deployment..." -ForegroundColor Yellow
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

    aws ecs update-service `
        --cluster "$ENVIRONMENT_NAME-cluster" `
        --service "$ENVIRONMENT_NAME-service" `
        --force-new-deployment | Out-Null
}
else {
    Write-Host "⚠️  Skipping Docker build/push steps (Docker not available)." -ForegroundColor Yellow
    Write-Host "   After installing Docker Desktop, re-run this script to push images." -ForegroundColor Yellow
}

# ----------------------------------------------------------
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Triggered Successfully!" -ForegroundColor Green
Write-Host "It may take 2-4 minutes for the new containers to reach RUNNING state." -ForegroundColor Green
Write-Host ""

$ALB_URL = aws cloudformation describe-stacks `
    --stack-name $ENVIRONMENT_NAME `
    --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" `
    --output text

Write-Host "🌐 Your Enterprise AashaAI URL: $ALB_URL" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
