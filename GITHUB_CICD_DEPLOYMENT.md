# GIKLASS - GitHub → CI/CD → Docker Hub → EC2 Complete Guide

## 📋 Complete Workflow Overview

```
1. GitHub Push
   ↓
2. GitHub Actions CI/CD (yml file)
   ↓
3. Build Docker Image
   ↓
4. Push to Docker Hub
   ↓
5. Deploy to EC2
   ↓
6. Run on Public IP ✅
```

---

## 🚀 STEP 1: Prepare GitHub Repository

### 1.1 Initialize Git (if not already done)
```bash
cd GIKLASS
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### 1.2 Create .gitignore (already exists, verify it has)
```bash
cat .gitignore
# Should contain: node_modules/, dist/, .env, .env.local
```

### 1.3 Add all files to Git
```bash
git add .
git status  # Review what will be committed
```

### 1.4 Commit initial code
```bash
git commit -m "Initial GIKLASS project setup with Docker configuration"
```

### 1.5 Create GitHub Repository
1. Go to https://github.com/new
2. Create repository name: `GIKLASS` (or your choice)
3. **DO NOT** initialize with README (you already have files)
4. Click "Create repository"
5. Copy the commands GitHub shows you

### 1.6 Add Remote and Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/GIKLASS.git
git branch -M main
git push -u origin main
```

---

## 🔐 STEP 2: Set Up GitHub Secrets (for CI/CD)

These secrets allow GitHub Actions to authenticate with Docker Hub and AWS.

### 2.1 In GitHub Web Interface:
1. Go to: **Your Repo → Settings → Secrets and variables → Actions**
2. Click "New repository secret"

### 2.2 Create These Secrets:

**A. DOCKER_USERNAME**
```
Name: DOCKER_USERNAME
Value: your-docker-hub-username
```

**B. DOCKER_PASSWORD**
```
Name: DOCKER_PASSWORD
Value: your-docker-hub-password (or access token)
```
*To create access token:*
- Go to Docker Hub → Account Settings → Security
- Click "New Access Token"
- Copy the token and paste here

**C. DOCKER_REGISTRY_URL**
```
Name: DOCKER_REGISTRY_URL
Value: docker.io
```

**D. GEMINI_API_KEY**
```
Name: GEMINI_API_KEY
Value: your-actual-gemini-api-key
```

**E. JWT_SECRET**
```
Name: JWT_SECRET
Value: your-random-jwt-secret-string
```

**F. AWS_EC2_HOST** (for later deployment)
```
Name: AWS_EC2_HOST
Value: your-ec2-public-ip (e.g., 54.123.45.67)
```

**G. AWS_EC2_USER**
```
Name: AWS_EC2_USER
Value: ec2-user (or ubuntu if Ubuntu AMI)
```

**H. AWS_EC2_KEY**
```
Name: AWS_EC2_KEY
Value: (paste entire contents of your .pem file)
```

---

## 📝 STEP 3: Create GitHub Actions CI/CD Workflow

### 3.1 Create Workflow Directory
```bash
mkdir -p .github/workflows
```

### 3.2 Create the CI/CD YAML File
Create file: `.github/workflows/docker-build-deploy.yml`

**Copy this entire content:**

```yaml
name: Build and Push Docker Image to Docker Hub

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

env:
  REGISTRY: docker.io
  IMAGE_NAME: giklass

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
      # Step 1: Checkout code
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Step 2: Set up Docker Buildx
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      # Step 3: Log in to Docker Hub
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      # Step 4: Extract metadata
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable={{is_default_branch}}
      
      # Step 5: Build and push Docker image
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./GIKLASS
          file: ./GIKLASS/dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          build-args: |
            GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
            JWT_SECRET=${{ secrets.JWT_SECRET }}
      
      # Step 6: Notify on success
      - name: Notify Success
        run: |
          echo "✅ Docker image successfully built and pushed to Docker Hub"
          echo "Image: ${{ secrets.DOCKER_USERNAME }}/giklass:latest"
      
      # Step 7: Deploy to EC2 (optional - only on push to main)
      - name: Deploy to EC2
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.AWS_EC2_KEY }}" > ~/.ssh/ec2-key.pem
          chmod 600 ~/.ssh/ec2-key.pem
          ssh -i ~/.ssh/ec2-key.pem -o StrictHostKeyChecking=no ${{ secrets.AWS_EC2_USER }}@${{ secrets.AWS_EC2_HOST }} << 'EOF'
            set -e
            echo "🚀 Deploying GIKLASS on EC2..."
            
            # Install Docker if not present
            if ! command -v docker &> /dev/null; then
              sudo yum update -y
              sudo yum install docker -y
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker $USER
            fi
            
            # Pull latest image
            docker pull ${{ secrets.DOCKER_USERNAME }}/giklass:latest
            
            # Stop old container if running
            docker stop giklass || true
            docker rm giklass || true
            
            # Run new container
            docker run -d \
              --name giklass \
              -p 3000:3000 \
              -e NODE_ENV=production \
              -e PORT=3000 \
              -e GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }} \
              -e JWT_SECRET=${{ secrets.JWT_SECRET }} \
              -v giklass_data:/app/giklass.db \
              --restart always \
              ${{ secrets.DOCKER_USERNAME }}/giklass:latest
            
            echo "✅ Container deployed successfully"
            echo "🌐 Access at: http://${{ secrets.AWS_EC2_HOST }}:3000"
            
            # Check if container is running
            docker ps | grep giklass || echo "⚠️ Container check failed"
          EOF

  notify-completion:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Workflow Completion Status
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "✅ CI/CD Pipeline Completed Successfully!"
            echo "📍 Docker Image: ${{ secrets.DOCKER_USERNAME }}/giklass:latest"
            echo "🌐 Access EC2 at: http://${{ secrets.AWS_EC2_HOST }}:3000"
          else
            echo "❌ CI/CD Pipeline Failed"
            echo "Check GitHub Actions logs for details"
          fi
```

### 3.3 Add the file to Git
```bash
git add .github/workflows/docker-build-deploy.yml
git commit -m "Add CI/CD workflow for Docker build and EC2 deployment"
git push
```

---

## ✅ STEP 4: Verify CI/CD Setup

### 4.1 Check Workflow Status
1. Go to your GitHub repo
2. Click **"Actions"** tab
3. You should see your workflow running
4. Wait for it to complete ✅

### 4.2 What the Workflow Does:
- ✅ Checkout your code
- ✅ Build Docker image from GIKLASS/dockerfile
- ✅ Tag it with branch name and "latest"
- ✅ Push to Docker Hub
- ✅ Deploy to EC2 (automatic on main branch)

### 4.3 Troubleshooting CI/CD Failures
```bash
# Check GitHub Actions logs:
# 1. Go to Actions tab
# 2. Click the failed workflow
# 3. Click the job to see detailed logs
# 4. Common issues:
#    - Docker Hub credentials wrong → Check secrets
#    - GEMINI_API_KEY missing → Add to secrets
#    - EC2 SSH key invalid → Verify .pem file content
```

---

## 🐳 STEP 5: Verify Docker Hub Upload

### 5.1 Check if Image Pushed Successfully
```bash
# In browser, go to:
https://hub.docker.com/r/YOUR_DOCKER_USERNAME/giklass

# Or via Docker CLI:
docker pull YOUR_DOCKER_USERNAME/giklass:latest
```

### 5.2 View Image Tags
- Should see: `latest`, `main`, `main-XXXXX` (commit SHA)

---

## 🚀 STEP 6: Prepare AWS EC2 Instance

### 6.1 Create/Verify EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instances"
3. Choose: **Ubuntu 20.04 or 22.04 LTS** (or Amazon Linux 2)
4. Instance type: **t2.micro** (free tier eligible)
5. Security Group - Add Inbound Rules:
   ```
   SSH     TCP 22      0.0.0.0/0
   Custom  TCP 3000    0.0.0.0/0 (for GIKLASS)
   HTTP    TCP 80      0.0.0.0/0 (optional)
   HTTPS   TCP 443     0.0.0.0/0 (optional)
   ```
6. Download and save the `.pem` key file

### 6.2 Get EC2 Public IP
1. Go to EC2 Dashboard
2. Find your instance
3. Copy the **Public IPv4 address** (e.g., 54.123.45.67)

### 6.3 Test SSH Connection
```bash
# From your local machine
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@54.123.45.67
# or for Ubuntu:
ssh -i your-key.pem ubuntu@54.123.45.67

# You should be logged in
```

---

## 🔧 STEP 7: Manual EC2 Setup (First Time Only)

If the CI/CD doesn't automatically deploy, do this manually:

### 7.1 SSH into EC2
```bash
ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP
```

### 7.2 Install Docker
```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
newgrp docker

# For Ubuntu
sudo apt-get update
sudo apt-get install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
newgrp docker
```

### 7.3 Create .env File on EC2
```bash
cat > /tmp/env_file << 'EOF'
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_actual_key
JWT_SECRET=your_actual_secret
EOF
```

### 7.4 Pull and Run Docker Image
```bash
# Pull from Docker Hub
docker pull YOUR_DOCKER_USERNAME/giklass:latest

# Create volume for database persistence
docker volume create giklass_data

# Run container
docker run -d \
  --name giklass \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e GEMINI_API_KEY=your_key \
  -e JWT_SECRET=your_secret \
  -v giklass_data:/app/giklass.db \
  --restart always \
  YOUR_DOCKER_USERNAME/giklass:latest

# Verify container is running
docker ps
docker logs giklass
```

---

## ✨ STEP 8: Verify Application is Running

### 8.1 Test from EC2 Instance
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP

# Test locally
curl http://localhost:3000
# Should return HTML

# Check container health
docker ps
docker logs giklass -f  # Follow logs
```

### 8.2 Test from Your Local Machine
```bash
# From your computer
curl http://YOUR_PUBLIC_IP:3000
# Should return HTML

# Or open in browser:
# http://YOUR_PUBLIC_IP:3000
```

### 8.3 Verify Application is Accessible
- Open browser
- Go to: `http://YOUR_PUBLIC_IP:3000`
- Should see GIKLASS login page ✅

---

## 📊 STEP 9: Continuous Updates (CI/CD Workflow)

Now whenever you push to GitHub, it automatically:

### 9.1 Push Changes
```bash
# Make changes to your code
git add .
git commit -m "Feature: Add new functionality"
git push origin main
```

### 9.2 Watch CI/CD Run
1. Go to GitHub → Actions tab
2. See workflow running
3. Wait for completion ✅

### 9.3 Verify on EC2
- Docker image is built
- Image is pushed to Docker Hub
- EC2 pulls new image
- Container restarts with new code
- Application updated at `http://YOUR_PUBLIC_IP:3000`

---

## 🔄 STEP 10: Troubleshooting

### Issue: CI/CD Fails at Docker Push
```
Solution:
1. Check Docker Hub credentials in GitHub Secrets
2. Verify DOCKER_USERNAME and DOCKER_PASSWORD
3. Try pulling locally: docker pull YOUR_USERNAME/giklass
```

### Issue: EC2 Deployment Fails
```
Solution:
1. Check AWS_EC2_KEY secret (should be contents of .pem file)
2. Check AWS_EC2_HOST is correct IP
3. Check AWS_EC2_USER (ec2-user for Amazon Linux, ubuntu for Ubuntu)
4. Manually SSH: ssh -i key.pem AWS_EC2_USER@HOST
```

### Issue: Container Won't Start on EC2
```bash
# SSH into EC2 and check:
docker logs giklass
docker inspect giklass

# Common issue: Port already in use
docker ps -a  # See all containers
docker rm giklass  # Remove old container
docker run -d -p 3000:3000 ... (rerun)
```

### Issue: Application Not Accessible on Public IP
```bash
# Check 1: Container is running
docker ps | grep giklass

# Check 2: Port is exposed
docker port giklass

# Check 3: Security Group allows port 3000
# Go to AWS Console → Security Groups

# Check 4: Application is actually listening
docker exec giklass curl http://localhost:3000
```

### Issue: Database Not Persisting
```bash
# Ensure volume is created and mounted
docker volume ls | grep giklass_data

# Check volume mount
docker inspect giklass | grep -A 5 "Mounts"
```

---

## 🎯 STEP 11: Quick Reference Commands

### GitHub Commands
```bash
# View remote
git remote -v

# Push to GitHub
git push origin main

# Check status
git status

# View logs
git log --oneline
```

### Docker Hub Commands
```bash
# Login to Docker Hub
docker login

# Pull image
docker pull YOUR_USERNAME/giklass:latest

# View local images
docker images | grep giklass
```

### EC2 Commands
```bash
# SSH to EC2
ssh -i key.pem ec2-user@PUBLIC_IP

# Check Docker status
sudo systemctl status docker

# View running containers
docker ps

# View container logs
docker logs giklass -f

# Stop container
docker stop giklass

# Remove container
docker rm giklass

# Check open ports
sudo firewall-cmd --list-all
# or
sudo netstat -tlnp | grep 3000
```

### GitHub Actions Commands
```bash
# View workflow status
# Go to: https://github.com/USERNAME/GIKLASS/actions

# Manual workflow trigger (if set up)
# Go to: Actions → Select workflow → Run workflow
```

---

## 📈 STEP 12: Full Workflow Example

### Scenario: You made a code change

```bash
# 1. On your local machine
cd GIKLASS
nano src/App.tsx  # Make a change

# 2. Commit and push
git add src/App.tsx
git commit -m "Feature: Update dashboard UI"
git push origin main

# 3. GitHub Actions automatically:
#    - Builds Docker image
#    - Pushes to Docker Hub
#    - Deploys to EC2

# 4. Check GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/GIKLASS/actions

# 5. Wait for workflow to complete (2-5 minutes)

# 6. Access updated application
# Open: http://YOUR_PUBLIC_IP:3000

# Your changes are now LIVE! 🚀
```

---

## ✅ Final Verification Checklist

```bash
# Local Machine
[ ] Git repository created
[ ] All files committed and pushed to GitHub
[ ] GitHub secrets configured (8 secrets)
[ ] .github/workflows/docker-build-deploy.yml created
[ ] Workflow runs successfully

# Docker Hub
[ ] Image successfully pushed: YOUR_USERNAME/giklass:latest
[ ] Can pull locally: docker pull YOUR_USERNAME/giklass:latest

# AWS EC2
[ ] EC2 instance running
[ ] Security Group allows port 3000
[ ] SSH connection works: ssh -i key.pem USER@IP
[ ] Docker installed on EC2

# Application
[ ] Container running on EC2: docker ps | grep giklass
[ ] Accessible locally on EC2: curl http://localhost:3000
[ ] Accessible from outside: curl http://YOUR_PUBLIC_IP:3000
[ ] Browser access works: http://YOUR_PUBLIC_IP:3000
[ ] Can see GIKLASS login page

# Continuous Deployment
[ ] Push to GitHub triggers workflow
[ ] Workflow completes successfully
[ ] Docker Hub receives new image
[ ] EC2 pulls and restarts container
[ ] Updated application live at public IP
```

---

## 🚀 You're All Set!

Your GIKLASS project now has:
- ✅ Version control on GitHub
- ✅ Automated CI/CD pipeline
- ✅ Automatic Docker image building
- ✅ Automatic deployment to EC2
- ✅ Live application on public IP

**To access your application:**
```
http://YOUR_PUBLIC_IP:3000
```

**To make updates:**
```bash
git push origin main  # Push code → Automatic CI/CD → Live update
```

---

## 📞 Support

If something goes wrong:

1. **Check GitHub Actions logs**
   - Go to: Your Repo → Actions
   - Click the failed workflow
   - See detailed error messages

2. **Check EC2 logs**
   ```bash
   ssh -i key.pem USER@IP
   docker logs giklass
   ```

3. **Check Docker Hub**
   - Verify image is there: https://hub.docker.com/r/YOUR_USERNAME/giklass

4. **Check AWS Security Group**
   - Ensure port 3000 is open to 0.0.0.0/0

---

**Congratulations! You have a fully automated CI/CD pipeline! 🎉**
