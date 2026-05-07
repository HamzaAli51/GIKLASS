# GIKLASS - CI/CD QUICK REFERENCE & CHEAT SHEET

## 🚀 TLDR (Too Long; Didn't Read)

```bash
# 1. Push code to GitHub
git add . && git commit -m "msg" && git push origin main

# 2. Add 8 GitHub Secrets
# Go to: Repo → Settings → Secrets (copy-paste from QUICK_SETUP.md)

# 3. Wait for CI/CD ✅
# Watch: Repo → Actions tab

# 4. SSH to EC2 and install Docker
ssh -i key.pem ec2-user@IP
sudo yum update -y && sudo yum install docker -y
sudo systemctl start docker && sudo usermod -aG docker ec2-user

# 5. Run container
docker volume create giklass_data
docker pull YOUR_USERNAME/giklass:latest
docker run -d -p 3000:3000 -e GEMINI_API_KEY=key -e JWT_SECRET=secret \
  -v giklass_data:/app/giklass.db YOUR_USERNAME/giklass:latest

# 6. Visit: http://YOUR_PUBLIC_IP:3000 ✅

# THAT'S IT! Future pushes auto-deploy.
```

---

## 📋 COMPLETE COMMAND CHECKLIST

### Phase 1: Git & GitHub (5 min)
```bash
# 1a. Initialize Git
cd GIKLASS
git init
git config user.name "Your Name"
git config user.email "email@example.com"

# 1b. Commit
git add .
git commit -m "Initial GIKLASS setup with Docker and CI/CD"

# 1c. Create repo on GitHub
# Visit: https://github.com/new
# Name: GIKLASS
# Keep public
# Click Create (don't initialize with README)

# 1d. Link and Push
git remote add origin https://github.com/YOUR_USERNAME/GIKLASS.git
git branch -M main
git push -u origin main

# 1e. Verify
git remote -v  # Should show your GitHub repo
```

### Phase 2: GitHub Secrets (3 min)
```bash
# Go to: GitHub Repo → Settings → Secrets and variables → Actions
# Click "New repository secret" for EACH:

DOCKER_USERNAME            = your-docker-username
DOCKER_PASSWORD            = docker-hub-access-token
DOCKER_REGISTRY_URL        = docker.io
GEMINI_API_KEY            = your-gemini-key
JWT_SECRET                = your-secret-string
AWS_EC2_HOST              = 54.123.45.67 (your IP)
AWS_EC2_USER              = ec2-user
AWS_EC2_KEY               = (entire .pem file content)
```

### Phase 3: Workflow Trigger (2 min)
```bash
# Verify workflow file exists
ls -la .github/workflows/docker-build-deploy.yml

# Trigger CI/CD
git push origin main

# Monitor
# Go to: https://github.com/YOUR_USERNAME/GIKLASS/actions
# Watch the workflow run (2-5 min)
```

### Phase 4: EC2 Docker Setup (10 min)
```bash
# 4a. SSH to EC2
ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP

# 4b. Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
newgrp docker

# 4c. Create volume
docker volume create giklass_data

# 4d. Pull image
docker pull YOUR_DOCKER_USERNAME/giklass:latest

# 4e. Run container
docker run -d \
  --name giklass \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e GEMINI_API_KEY=your-actual-key \
  -e JWT_SECRET=your-actual-secret \
  -v giklass_data:/app/giklass.db \
  --restart always \
  YOUR_DOCKER_USERNAME/giklass:latest

# 4f. Verify
docker ps
docker logs giklass
```

### Phase 5: Access Application (1 min)
```bash
# From EC2
curl http://localhost:3000

# From local machine
curl http://YOUR_PUBLIC_IP:3000

# In browser
# Visit: http://YOUR_PUBLIC_IP:3000
```

---

## 🔄 DAILY WORKFLOW COMMANDS

### Make Code Changes
```bash
# Edit files
nano src/App.tsx

# Stage and commit
git add src/App.tsx
git commit -m "Feature: Add new dashboard"

# Push (triggers automatic CI/CD)
git push origin main

# Watch deployment
# Go to: GitHub → Actions tab
# Wait for ✅ success

# Application automatically updates!
```

### Docker Container Management
```bash
# View all containers
docker ps -a

# View running containers
docker ps

# View logs
docker logs giklass

# Follow logs in real-time
docker logs giklass -f

# Check container details
docker inspect giklass

# Restart container
docker restart giklass

# Stop container
docker stop giklass

# Remove container
docker rm giklass

# View container stats
docker stats giklass
```

### Docker Image Management
```bash
# View local images
docker images

# Pull latest image
docker pull YOUR_USERNAME/giklass:latest

# Remove local image
docker rmi YOUR_USERNAME/giklass:latest

# View image layers
docker history YOUR_USERNAME/giklass:latest

# Tag image
docker tag giklass:latest YOUR_USERNAME/giklass:v1.0
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect giklass_data

# Remove volume (WARNING: deletes data!)
docker volume rm giklass_data

# Check volume mount
docker inspect giklass | grep -A 5 "Mounts"
```

---

## 🆘 TROUBLESHOOTING COMMANDS

### Quick Diagnosis
```bash
# Step 1: Check container is running
docker ps | grep giklass
# Should show running container

# Step 2: Check logs for errors
docker logs giklass | tail -20
# Look for error messages

# Step 3: Check environment variables
docker exec giklass printenv | sort
# Verify NODE_ENV=production, etc.

# Step 4: Test connectivity
docker exec giklass curl http://localhost:3000
# Should return HTML

# Step 5: Check port mapping
docker port giklass
# Should show 0.0.0.0:3000

# Step 6: Check volume
docker inspect giklass | grep -A 5 "Mounts"
# Verify database mount

# Step 7: Check from outside EC2
curl http://YOUR_PUBLIC_IP:3000
# Should return HTML
```

### Fix Container Won't Start
```bash
# See what went wrong
docker logs giklass

# If port already in use
lsof -i :3000
kill -9 <PID>

# Or run on different port
docker run -d -p 3001:3000 --name giklass YOUR_USERNAME/giklass:latest

# If container exists, remove it
docker rm giklass

# Retry run command
```

### Fix Image Pull Failed
```bash
# Check Docker can reach Docker Hub
docker pull hello-world

# Login to Docker Hub
docker login

# Try pull again
docker pull YOUR_USERNAME/giklass:latest

# Check image on Docker Hub
# Visit: https://hub.docker.com/r/YOUR_USERNAME/giklass
```

### Fix Application Not Accessible
```bash
# 1. Check container is running
docker ps

# 2. Check port is listening
docker exec giklass curl http://localhost:3000

# 3. Check AWS Security Group
# Go to AWS Console → Security Groups
# Verify port 3000 open to 0.0.0.0/0

# 4. Check firewall on EC2
sudo firewall-cmd --list-all
# or
sudo netstat -tlnp | grep 3000

# 5. Test from EC2
curl http://localhost:3000

# 6. Test from local machine
curl http://YOUR_PUBLIC_IP:3000
```

### Fix GitHub Actions Failure
```bash
# 1. Go to: GitHub Repo → Actions
# 2. Click the failed workflow
# 3. Click the failed step
# 4. Read error message
# 5. Common issues:
#    - Docker Hub credentials wrong
#    - GitHub secrets missing or wrong
#    - EC2 key invalid
#    - Network connectivity issue

# Typical fixes:
# - Update GitHub Secrets
# - Verify Docker Hub access
# - Check EC2 SSH key
# - Check internet connectivity
```

---

## 📊 USEFUL MONITORING COMMANDS

### Check EC2 Instance Health
```bash
# SSH to EC2
ssh -i key.pem ec2-user@IP

# Check system resources
free -h  # Memory
df -h    # Disk
top      # CPU usage (press 'q' to exit)

# Check Docker daemon
sudo systemctl status docker

# Check logs
sudo journalctl -u docker -n 20

# Check network
netstat -tlnp | grep 3000  # Port 3000
curl http://localhost:3000  # Test locally
```

### Monitor Container
```bash
# Real-time stats
docker stats giklass

# Check health
docker inspect giklass | grep -A 5 "Health"

# View events
docker events --filter container=giklass

# Resource usage over time
docker stats --no-stream
```

---

## 📝 FILE REFERENCE

### Key Files Location
```
Project Root: /home/ec2-user  (or /root)
Container Root: /app
Database: /app/giklass.db
Build Output: /app/dist
Environment: Docker env vars
Config: .env or docker run -e VAR=value
Logs: docker logs giklass
```

### GitHub Paths
```
Workflow: .github/workflows/docker-build-deploy.yml
Dockerfile: ./GIKLASS/dockerfile
Repo: https://github.com/YOUR_USERNAME/GIKLASS
Actions: https://github.com/YOUR_USERNAME/GIKLASS/actions
Secrets: https://github.com/YOUR_USERNAME/GIKLASS/settings/secrets
```

### Docker Hub Path
```
Image: docker.io/YOUR_USERNAME/giklass:latest
URL: https://hub.docker.com/r/YOUR_USERNAME/giklass
Tags: latest, main, main-XXXXX, etc.
```

### AWS EC2 Path
```
Public IP: 54.XXX.XXX.XXX
SSH: ssh -i key.pem ec2-user@IP
Security Group: AWS Console → EC2 → Security Groups
Instance: AWS Console → EC2 → Instances
```

---

## 🎯 SUCCESS INDICATORS

### ✅ When Everything Works

```bash
# On local machine
git push origin main
# Should succeed without errors

# GitHub Actions
# Repo → Actions → Workflow shows ✅

# Docker Hub
# Can see image at: https://hub.docker.com/r/YOUR_USERNAME/giklass
# Tags visible: latest, main, commit-hash

# EC2 Container
docker ps
# Output shows giklass container running

# Application
curl http://YOUR_PUBLIC_IP:3000
# Returns HTML (not error)

# Browser
# http://YOUR_PUBLIC_IP:3000 loads page
# Can interact with application
# No console errors

# Future updates
git push origin main
# Automatically builds, pushes, deploys
# Application updates without manual intervention
```

---

## ⏱️ TIMING GUIDE

| Phase | Time | What's Happening |
|-------|------|------------------|
| Git Setup | 2 min | Initialize and commit |
| GitHub Setup | 3 min | Create repo and add secrets |
| First Push | 1 min | Push code to GitHub |
| CI/CD Run | 2-5 min | Build and push Docker image |
| Docker Hub | 1 min | Verify image uploaded |
| EC2 Setup | 10 min | Install Docker and pull image |
| **TOTAL** | **~25 min** | From start to live app |

---

## 🔐 SECURITY CHECKLIST

```bash
# Local machine
chmod 400 your-key.pem          # SSH key permissions

# EC2 instance
chmod 600 ~/.ssh/ec2-key.pem    # SSH key permissions
ssh-keyscan github.com >> ~/.ssh/known_hosts  # Trust GitHub (optional)

# Docker
docker login                     # Authenticate with Docker Hub
# Don't commit credentials to Git

# GitHub Secrets
# All sensitive data stored as secrets
# Never commit .env files
# Use environment variables at runtime
```

---

## 🚀 ONE-LINER COMMANDS

### Quick Deploy
```bash
# Push changes and trigger CI/CD
git add . && git commit -m "Update" && git push origin main
```

### Check Everything
```bash
# Full status check
echo "=== Git ===" && git status && echo "=== Docker ===" && docker ps && echo "=== Logs ===" && docker logs giklass | tail -5
```

### Full Restart
```bash
# Stop, remove, and restart container
docker stop giklass && docker rm giklass && docker pull YOUR_USERNAME/giklass:latest && docker run -d --name giklass -p 3000:3000 -e NODE_ENV=production -e GEMINI_API_KEY=key -e JWT_SECRET=secret -v giklass_data:/app/giklass.db YOUR_USERNAME/giklass:latest
```

### Test Everything
```bash
# Test locally on EC2
echo "=== Local Test ===" && curl -s http://localhost:3000 | head -20 && echo -e "\n=== Container Status ===" && docker ps | grep giklass
```

---

## 📚 DOCUMENTATION LINKS

- **Quick Setup**: [QUICK_SETUP.md](QUICK_SETUP.md)
- **Full Guide**: [GITHUB_CICD_DEPLOYMENT.md](GITHUB_CICD_DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Docker Help**: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
- **All Guides Index**: [DEPLOYMENT_GUIDE_INDEX.md](DEPLOYMENT_GUIDE_INDEX.md)

---

## 🎉 YOU'RE READY!

**Copy commands above, execute in order, and your GIKLASS app will be live! 🚀**

For detailed explanations, see the full guides.

---

**Last Updated:** May 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
