#!/bin/bash

# GIKLASS Docker Deployment Script
# Usage: ./deploy.sh <dockerhub-username> <image-tag>

set -e

DOCKER_USERNAME=${1:-"your-docker-username"}
IMAGE_TAG=${2:-"latest"}
IMAGE_NAME="giklass"

echo "🚀 GIKLASS Docker Deployment Script"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Step 1: Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your actual credentials before continuing"
    exit 1
fi

# Step 2: Build the image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .
docker tag $IMAGE_NAME:$IMAGE_TAG $IMAGE_NAME:latest

echo "✅ Image built successfully!"
echo ""

# Step 3: Test locally
echo "🧪 Testing image locally with docker-compose..."
docker-compose up -d
sleep 5

# Check if container is running
if docker ps | grep -q giklass; then
    echo "✅ Container is running!"
    echo "📍 Testing endpoint: http://localhost:3000"
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Application is accessible!"
    else
        echo "⚠️  Application not responding yet, might need more time..."
    fi
else
    echo "❌ Container failed to start"
    docker-compose logs
    exit 1
fi

# Step 4: Ask to continue with Docker Hub push
echo ""
echo "Local test completed. Ready to push to Docker Hub?"
read -p "Continue with Docker Hub push? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Stopping local containers..."
    docker-compose down
    exit 0
fi

# Step 5: Login to Docker Hub
echo ""
echo "🔐 Logging in to Docker Hub..."
docker login

# Step 6: Tag and push
echo "📤 Tagging image for Docker Hub..."
docker tag $IMAGE_NAME:latest $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG
docker tag $IMAGE_NAME:latest $DOCKER_USERNAME/$IMAGE_NAME:latest

echo "📤 Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG
docker push $DOCKER_USERNAME/$IMAGE_NAME:latest

echo ""
echo "✅ Successfully pushed to Docker Hub!"
echo "📍 Image: $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
echo ""

# Step 7: Show EC2 deployment command
echo "🚀 Next step: Deploy to AWS EC2"
echo ""
echo "On your EC2 instance, run:"
echo "docker pull $DOCKER_USERNAME/$IMAGE_NAME:latest"
echo "docker run -d \\"
echo "  --name giklass \\"
echo "  -p 3000:3000 \\"
echo "  -e NODE_ENV=production \\"
echo "  -e GEMINI_API_KEY=your_key \\"
echo "  -e JWT_SECRET=your_secret \\"
echo "  $DOCKER_USERNAME/$IMAGE_NAME:latest"
echo ""

# Cleanup
echo "🧹 Cleaning up local containers..."
docker-compose down

echo ""
echo "✅ Deployment script completed!"
echo "📖 For more details, see DOCKER_DEPLOYMENT.md"
