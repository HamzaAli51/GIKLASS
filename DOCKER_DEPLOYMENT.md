# GIKLASS Docker & AWS EC2 Deployment Guide

## Issues Fixed ✅
1. **NODE_ENV not set** → Now set to `production` in Dockerfile
2. **PORT hardcoded** → Now reads from `process.env.PORT` with fallback
3. **Missing health check** → Added to Dockerfile
4. **Environment variables** → Now properly documented

---

## Step 1: Prepare Your Environment

### Create `.env.local` file in GIKLASS folder:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### Verify structure:
```bash
cd GIKLASS
ls -la  # Should see: dockerfile, package.json, server.ts, src/, .env.local
```

---

## Step 2: Build Docker Image Locally

### Build the image:
```bash
cd GIKLASS
docker build -t giklass:latest .
```

### Test locally:
```bash
docker-compose up
# Visit http://localhost:3000
```

### Stop container:
```bash
docker-compose down
```

---

## Step 3: Upload to Docker Hub

### 1. Create Docker Hub account at hub.docker.com

### 2. Login to Docker Hub:
```bash
docker login
# Enter your Docker Hub username and password
```

### 3. Tag your image:
```bash
docker tag giklass:latest yourdockerusername/giklass:latest
docker tag giklass:latest yourdockerusername/giklass:v1.0
```

### 4. Push to Docker Hub:
```bash
docker push yourdockerusername/giklass:latest
docker push yourdockerusername/giklass:v1.0
```

### 5. Verify on Docker Hub:
Visit https://hub.docker.com/r/yourdockerusername/giklass

---

## Step 4: Deploy to AWS EC2

### Prerequisites:
- AWS account with EC2 instance running (Ubuntu 20.04 or 22.04 recommended)
- Security Group rules allowing:
  - Port 22 (SSH)
  - Port 3000 (Application)
  - Port 80 (HTTP) - optional
  - Port 443 (HTTPS) - optional

### 1. SSH into EC2 instance:
```bash
ssh -i your-key.pem ec2-user@your-public-ip
# or for Ubuntu:
ssh -i your-key.pem ubuntu@your-public-ip
```

### 2. Install Docker on EC2:
```bash
sudo yum update -y
sudo yum install docker -y
# Or for Ubuntu:
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker ubuntu
```

### 3. Start Docker:
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 4. Pull and run your image:
```bash
# Pull from Docker Hub
docker pull yourdockerusername/giklass:latest

# Run the container
docker run -d \
  --name giklass \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e GEMINI_API_KEY=your_gemini_api_key \
  -e JWT_SECRET=your_jwt_secret \
  -v giklass_data:/app/giklass.db \
  yourdockerusername/giklass:latest
```

### 5. Verify container is running:
```bash
docker ps
docker logs giklass
```

### 6. Test the application:
```bash
# From your local machine
curl http://your-public-ip:3000

# Should return HTML (index.html content)
```

---

## Step 5: Configure Security Group (AWS Console)

1. Go to AWS EC2 Dashboard
2. Click "Security Groups"
3. Find your instance's security group
4. Add inbound rules:
   - Type: **Custom TCP**
   - Port: **3000**
   - Source: **0.0.0.0/0** (or your IP for security)

---

## Troubleshooting

### Container won't start?
```bash
docker logs giklass
# Check for errors
```

### Port 3000 not accessible?
```bash
# Check if container is running
docker ps

# Check security group rules
# Check firewall on EC2
sudo firewall-cmd --list-all  # or iptables
```

### Database issues?
```bash
# Check volume
docker inspect giklass | grep -A 10 Mounts

# Verify permissions
docker exec giklass ls -la /app/giklass.db
```

### Application running but showing blank page?
```bash
# Check if build was successful
docker exec giklass ls -la /app/dist/

# Check server logs
docker logs giklass --follow
```

---

## Production Best Practices

1. **Use environment file instead of inline variables:**
```bash
docker run -d \
  --name giklass \
  -p 3000:3000 \
  --env-file .env \
  yourdockerusername/giklass:latest
```

2. **Use docker-compose on EC2:**
```bash
# Copy docker-compose.yml to EC2
scp -i key.pem docker-compose.yml ubuntu@your-ip:/home/ubuntu/

# SSH and run
docker-compose up -d
```

3. **Use Nginx as reverse proxy:**
Create nginx.conf on EC2
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **Monitor container:**
```bash
docker stats giklass
docker logs giklass -f
```

---

## Quick Checklist

- [ ] .env.local created with GEMINI_API_KEY and JWT_SECRET
- [ ] Docker image builds successfully: `docker build -t giklass:latest .`
- [ ] Image runs locally: `docker-compose up`
- [ ] Image pushed to Docker Hub
- [ ] EC2 instance running with Docker installed
- [ ] Security group allows port 3000
- [ ] Container running on EC2: `docker ps`
- [ ] Application accessible at `http://public-ip:3000`

---

## Contact
For issues, check `docker logs giklass` for detailed error messages.
