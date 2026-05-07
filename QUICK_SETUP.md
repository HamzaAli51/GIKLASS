# GIKLASS - FAST SETUP (Execute These Commands in Order)

## ⚡ SETUP TIME: ~15 minutes

---

## 🔧 STEP 1: Initial Git Setup (5 min)

```bash
cd GIKLASS

# Initialize Git
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"

# Add all files
git add .
git status

# Commit
git commit -m "Initial GIKLASS setup with Docker and CI/CD"
```

---

## 📌 STEP 2: Create GitHub Repository (5 min)

1. Go to https://github.com/new
2. Repository name: `GIKLASS`
3. Keep it **public** (easier for CI/CD)
4. **DO NOT** initialize with README
5. Click **"Create repository"**
6. Copy the commands GitHub shows

---

## 🚀 STEP 3: Push to GitHub (2 min)

```bash
# Copy from GitHub and run:
git remote add origin https://github.com/YOUR_USERNAME/GIKLASS.git
git branch -M main
git push -u origin main

# Verify
git remote -v  # Should show your GitHub repo
```

---

## 🔐 STEP 4: Add GitHub Secrets (3 min)

1. Go to: GitHub Repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add these 8 secrets:

| Name | Value | Notes |
|------|-------|-------|
| `DOCKER_USERNAME` | your-docker-hub-username | From Docker Hub |
| `DOCKER_PASSWORD` | your-docker-hub-access-token | Create at Docker Hub → Security |
| `DOCKER_REGISTRY_URL` | docker.io | Keep as is |
| `GEMINI_API_KEY` | your-actual-api-key | From Google AI Studio |
| `JWT_SECRET` | random-secret-string | Generate random string |
| `AWS_EC2_HOST` | 54.123.45.67 | Your EC2 public IP |
| `AWS_EC2_USER` | ec2-user | ec2-user (Amazon Linux) or ubuntu (Ubuntu) |
| `AWS_EC2_KEY` | contents of your .pem file | Paste entire file content |

**How to get Docker Hub Access Token:**
- Go to https://hub.docker.com/settings/security
- Click "New Access Token"
- Copy the token

---

## ✅ STEP 5: Verify Workflow File Exists

Check that this file exists in your project:
```bash
ls -la .github/workflows/docker-build-deploy.yml
# Should show the file

cat .github/workflows/docker-build-deploy.yml | head -20
# Should show the workflow
```

---

## 🔄 STEP 6: Push Workflow to GitHub

```bash
git add .github/workflows/docker-build-deploy.yml
git commit -m "Add GitHub Actions CI/CD workflow"
git push origin main
```

---

## ⏳ STEP 7: Wait for CI/CD Pipeline

1. Go to your GitHub repo
2. Click **"Actions"** tab
3. Watch the workflow run
4. Wait for **"✅ success"** (usually 2-5 minutes)

**If it fails:**
- Click the failed workflow
- Click the step that failed
- Read the error message
- Check [GITHUB_CICD_DEPLOYMENT.md](GITHUB_CICD_DEPLOYMENT.md) troubleshooting

---

## 🐳 STEP 8: Verify Docker Hub Upload

```bash
# Option 1: Via browser
# Go to: https://hub.docker.com/r/YOUR_USERNAME/giklass
# Should see image with tags: latest, main

# Option 2: Via Docker CLI
docker pull YOUR_DOCKER_USERNAME/giklass:latest
```

---

## 🚀 STEP 9: Prepare AWS EC2 (if not ready)

### 9.1 Create EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instances"
3. Choose: **Ubuntu 20.04 LTS** or **Amazon Linux 2**
4. Instance type: **t2.micro**
5. Security Group - Add Inbound Rules:
   ```
   SSH  - Port 22   - 0.0.0.0/0
   TCP  - Port 3000 - 0.0.0.0/0
   ```
6. Download .pem file

### 9.2 Get Public IP
- Go to EC2 Dashboard
- Find your instance
- Copy **Public IPv4 address** (e.g., 54.123.45.67)

### 9.3 Update GitHub Secret
```bash
# Go to GitHub → Repo Settings → Secrets
# Update AWS_EC2_HOST with your public IP
```

---

## ✨ STEP 10: Manual EC2 Deployment (First Time)

### 10.1 SSH to EC2
```bash
# From your local machine
ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP
# or for Ubuntu: ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

### 10.2 Install Docker
```bash
# For Amazon Linux 2:
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
newgrp docker

# For Ubuntu:
sudo apt-get update
sudo apt-get install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
newgrp docker
```

### 10.3 Pull and Run Docker Image
```bash
# Create volume
docker volume create giklass_data

# Pull image
docker pull YOUR_DOCKER_USERNAME/giklass:latest

# Run container
docker run -d \
  --name giklass \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e GEMINI_API_KEY=your_key_here \
  -e JWT_SECRET=your_secret_here \
  -v giklass_data:/app/giklass.db \
  --restart always \
  YOUR_DOCKER_USERNAME/giklass:latest

# Verify
docker ps
docker logs giklass
```

---

## 🌐 STEP 11: Test Application

### From EC2 Instance:
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP

# Test locally
curl http://localhost:3000
# Should return HTML
```

### From Your Local Machine:
```bash
# Test remote access
curl http://YOUR_PUBLIC_IP:3000
# Should return HTML

# Or open in browser:
# http://YOUR_PUBLIC_IP:3000
```

### Expected Result:
✅ You should see GIKLASS login page

---

## 🔄 STEP 12: Future Updates

Now CI/CD is automatic! Every time you push:

```bash
# Make changes
nano src/App.tsx

# Commit and push
git add .
git commit -m "Update feature"
git push origin main

# GitHub Actions automatically:
# 1. Builds Docker image
# 2. Pushes to Docker Hub
# 3. Deploys to EC2
# 4. Container restarts with new code

# Check Actions tab to see progress
# Application updated at: http://YOUR_PUBLIC_IP:3000
```

---

## ✅ Quick Checklist

```bash
# Execute these in order:
[ ] cd GIKLASS
[ ] git init && git add . && git commit -m "Initial setup"
[ ] git remote add origin https://github.com/YOUR_USERNAME/GIKLASS.git
[ ] git push -u origin main
[ ] Add 8 GitHub Secrets
[ ] Verify .github/workflows/docker-build-deploy.yml exists
[ ] git push (trigger CI/CD)
[ ] Wait for GitHub Actions to complete
[ ] Verify image on Docker Hub
[ ] SSH to EC2 and install Docker
[ ] Pull image and run container
[ ] Test at http://YOUR_PUBLIC_IP:3000
[ ] See application running ✅
```

---

## 📍 Quick Reference

| Command | Purpose |
|---------|---------|
| `git push origin main` | Trigger CI/CD |
| `docker ps` | Check running containers |
| `docker logs giklass` | View container logs |
| `docker logs giklass -f` | Follow logs in real-time |
| `curl http://localhost:3000` | Test locally on EC2 |
| `curl http://YOUR_IP:3000` | Test from outside |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| GitHub Actions fails | Check secrets are correct: Settings → Secrets |
| Docker Hub image missing | Check GitHub Actions logs: Repo → Actions |
| EC2 container won't start | SSH and check: `docker logs giklass` |
| Can't access on public IP | Check Security Group allows port 3000 |
| Port already in use | `docker rm giklass` and retry |

---

## 📖 For Detailed Info

- **Full guide**: [GITHUB_CICD_DEPLOYMENT.md](GITHUB_CICD_DEPLOYMENT.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Docker guide**: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

---

## 🎯 Timeline

```
Minutes 0-2:   Git setup + push to GitHub
Minutes 2-10:  Add secrets to GitHub
Minutes 10-15: Wait for CI/CD + verify Docker Hub
Minutes 15+:   Manual EC2 setup (30 min)

Total: ~45 minutes to have live application
```

---

**You now have a fully automated CI/CD pipeline! 🚀**

Every `git push` = Automatic build → Push to Docker Hub → Deploy to EC2 → Live update
