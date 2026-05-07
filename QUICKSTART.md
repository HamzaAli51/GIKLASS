# GIKLASS Docker & EC2 - QUICK START

## 📋 Pre-requisites
- Docker installed locally
- Docker Hub account (hub.docker.com)
- AWS EC2 instance running (Ubuntu 20.04+)
- SSH access to EC2 instance

---

## 🚀 Quick Start (5 Steps)

### Step 1: Prepare Environment (2 min)
```bash
cd GIKLASS

# Create .env.local with your credentials
cp .env.example .env.local
# Edit .env.local and add:
# - GEMINI_API_KEY=your_key
# - JWT_SECRET=your_secret
```

### Step 2: Build and Test Locally (3 min)
```bash
# Build Docker image
docker build -t giklass:latest .

# Test locally
docker-compose up

# Visit http://localhost:3000 in your browser
# Stop: Ctrl+C then docker-compose down
```

### Step 3: Push to Docker Hub (5 min)
```bash
# Login to Docker Hub
docker login

# Tag image
docker tag giklass:latest YOUR_DOCKER_USERNAME/giklass:latest

# Push to Docker Hub
docker push YOUR_DOCKER_USERNAME/giklass:latest
```

### Step 4: Deploy to AWS EC2 (5 min)
```bash
# SSH to your EC2 instance
ssh -i your-key.pem ec2-user@YOUR_PUBLIC_IP

# Install Docker (if not already installed)
sudo yum update -y && sudo yum install docker -y
sudo systemctl start docker
sudo usermod -aG docker $USER

# Pull and run your image
docker pull YOUR_DOCKER_USERNAME/giklass:latest

docker run -d \
  --name giklass \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=your_key_here \
  -e JWT_SECRET=your_secret_here \
  YOUR_DOCKER_USERNAME/giklass:latest
```

### Step 5: Verify It Works
```bash
# From EC2 instance
docker ps  # Should show running giklass container
docker logs giklass  # Should show "Server running on http://0.0.0.0:3000"

# From your local machine
curl http://YOUR_PUBLIC_IP:3000
# Should return HTML (not error)

# Visit in browser: http://YOUR_PUBLIC_IP:3000
```

---

## ✅ Verification Checklist

```bash
# On local machine
[ ] Docker image builds: docker build -t giklass:latest .
[ ] Image runs: docker-compose up (shows http://localhost:3000 works)
[ ] Image pushed to Docker Hub: docker push YOUR_DOCKER_USERNAME/giklass:latest

# On EC2 instance
[ ] Docker installed: docker --version
[ ] Image pulled: docker pull YOUR_DOCKER_USERNAME/giklass:latest
[ ] Container running: docker ps | grep giklass
[ ] Container healthy: docker logs giklass (no errors)
[ ] Port 3000 open in Security Group (AWS console)

# Test accessibility
[ ] Local curl works: curl http://YOUR_PUBLIC_IP:3000
[ ] Browser works: Visit http://YOUR_PUBLIC_IP:3000
[ ] Database persists: Restart container, data still there
```

---

## 🔧 Common Commands

```bash
# View logs
docker logs giklass
docker logs giklass -f  # Follow logs

# Restart container
docker restart giklass

# Stop container
docker stop giklass

# Remove and redeploy
docker rm giklass
docker run -d -p 3000:3000 --name giklass YOUR_DOCKER_USERNAME/giklass:latest

# Check if app is responding
curl http://localhost:3000  # Local
curl http://YOUR_PUBLIC_IP:3000  # Remote

# View container info
docker ps -a
docker inspect giklass
docker stats giklass
```

---

## 🆘 If It Doesn't Work

### Not accessible on public IP?
1. **Check Security Group:**
   - AWS Console → EC2 → Security Groups
   - Add inbound rule: Port 3000, Source 0.0.0.0/0

2. **Check container is running:**
   ```bash
   docker ps
   docker logs giklass
   ```

3. **Check NODE_ENV is production:**
   ```bash
   docker exec giklass printenv NODE_ENV
   # Should output: production
   ```

### Container won't start?
```bash
docker logs giklass | head -20  # See error
```

### See full troubleshooting guide:
Read `TROUBLESHOOTING.md` in GIKLASS folder

---

## 📖 Full Guides

- **DOCKER_DEPLOYMENT.md** - Complete step-by-step deployment guide
- **TROUBLESHOOTING.md** - Solutions for common issues
- **deploy.sh** - Automated deployment script (Linux/Mac)

---

## 🎯 What Was Fixed

1. ✅ **NODE_ENV production mode** - Server now correctly uses static files in production
2. ✅ **PORT from environment variable** - Can change port via -e PORT=xxxx
3. ✅ **Health check added** - Docker can monitor container health
4. ✅ **Build optimizations** - Multi-stage build, production dependencies only
5. ✅ **Documentation** - Complete guides for deployment and troubleshooting

---

## 📞 Support

If application still doesn't show on public IP after following these steps:

1. Run diagnostic:
   ```bash
   docker logs giklass > /tmp/logs.txt
   docker exec giklass printenv > /tmp/env.txt
   docker inspect giklass > /tmp/inspect.json
   ```

2. Check AWS console:
   - Instance is running (green check)
   - Security group allows port 3000
   - Public IP is assigned

3. Test locally first:
   ```bash
   docker-compose up  # Test on your machine
   ```

4. See **TROUBLESHOOTING.md** for more solutions

---

## 💡 Tips

- Use `docker-compose.yml` for consistent local testing
- Keep `GEMINI_API_KEY` and `JWT_SECRET` in `.env` not in code
- Always test locally with `docker-compose up` before pushing to Docker Hub
- Monitor container with `docker logs giklass -f` while testing
- Use named volumes `giklass_data:/app` to persist database

---

**Ready? Start with Step 1 above! 🚀**
