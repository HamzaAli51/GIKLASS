# GIKLASS Docker/EC2 Setup - TROUBLESHOOTING GUIDE

## Common Issues and Solutions

---

## Issue 1: "Application won't run on EC2 public IP"

### Symptoms:
- `curl http://public-ip:3000` times out or refuses connection
- Container is running but not accessible

### Root Causes & Solutions:

**A. Security Group not configured**
```bash
# AWS Console → Security Groups → Your Instance's SG
# Add Inbound Rule:
Type: Custom TCP
Port Range: 3000
Source: 0.0.0.0/0 (or specific IP)
```

**B. Container not actually listening**
```bash
# SSH into EC2
docker logs giklass

# Should see: "Server running on http://0.0.0.0:3000"
# If not, check environment variables
docker inspect giklass | grep -A 5 "Env"
```

**C. NODE_ENV not set to production**
```bash
# Check if it's set
docker exec giklass printenv NODE_ENV

# Should output: production
# If not, restart with proper env:
docker stop giklass
docker run -d --name giklass -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY=xxxx \
  -e JWT_SECRET=xxxx \
  your-username/giklass:latest
```

---

## Issue 2: "Container starts but crashes immediately"

### Check logs:
```bash
docker logs giklass
```

### Common error: "Cannot find module"
```
Error: Cannot find module './src/lib/db.ts'
```
**Solution:** Ensure Dockerfile copies src folder (already fixed in updated Dockerfile)

### Common error: "Port already in use"
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or run container on different port
docker run -d --name giklass -p 3001:3000 ...
```

### Common error: "EACCES: permission denied"
```bash
# Database file permissions issue
docker exec giklass ls -la /app/giklass.db

# Fix: Ensure volume has proper permissions
chmod 755 giklass.db  # On host machine
```

---

## Issue 3: "Getting HTML instead of API responses"

### Symptoms:
- API calls return HTML
- Dashboard loads but functionality doesn't work

### Root Cause: Production mode not enabled

```bash
# This means server is using Vite dev middleware instead of serving static files
# Fix: Ensure NODE_ENV=production is set
docker exec giklass printenv NODE_ENV

# Restart if needed
docker stop giklass && docker rm giklass
docker run -d -e NODE_ENV=production -e PORT=3000 \
  -e GEMINI_API_KEY=your_key \
  -e JWT_SECRET=your_secret \
  -p 3000:3000 --name giklass your-username/giklass:latest
```

---

## Issue 4: "Build fails - 'npm run build' errors"

### Check Docker build logs:
```bash
docker build -t giklass:latest . 2>&1 | tail -50
```

### Common causes:

**A. Missing environment variables during build**
```bash
# Some apps need env vars at build time
# Solution: Use .env.local before building
cat .env.local  # Should exist with GEMINI_API_KEY

# Re-run build
docker build -t giklass:latest .
```

**B. TypeScript errors**
```bash
# Check for type errors
npm run lint  # Should be in package.json

# Fix locally first before Docker build
npm install
npm run build  # This is what Docker does
npm run lint
```

---

## Issue 5: "Database file not persisting between container restarts"

### Symptoms:
- Database resets after container restart
- Lost all data

### Solution: Use named volume
```bash
# Create volume
docker volume create giklass_data

# Run with volume
docker run -d --name giklass \
  -p 3000:3000 \
  -v giklass_data:/app \
  your-username/giklass:latest

# Or use docker-compose (already configured)
docker-compose up -d
```

### Check volume:
```bash
docker volume ls
docker volume inspect giklass_data
```

---

## Issue 6: "CORS or API endpoint errors"

### Symptoms:
- Frontend loads but API calls fail
- Browser console shows CORS error

### Solution A: Check server is configured for CORS
```bash
# Look in server.ts for CORS setup
grep -r "cors\|CORS" src/

# If not set, add to server.ts:
import cors from 'cors';
app.use(cors());
```

### Solution B: Check API routes are mounted correctly
```bash
docker logs giklass | grep -i "route\|listening"

# Should see:
# Server running on http://0.0.0.0:3000
# /api/auth, /api/classes, /api/messages routes available
```

### Solution C: Check environment variables in browser
```javascript
// In browser console, check if API calls are using correct URL
fetch('http://public-ip:3000/api/auth/login', {...})
```

---

## Issue 7: "Gemini API key errors"

### Symptoms:
- Error about API key not found or invalid
- Feature using Gemini doesn't work

### Solution:
```bash
# Check if GEMINI_API_KEY is set in container
docker exec giklass printenv GEMINI_API_KEY

# Should output your key (or similar)
# If empty, restart with proper env variable
docker stop giklass
docker rm giklass

# Run with env file (better approach)
docker run -d --name giklass \
  -p 3000:3000 \
  --env-file .env \
  -v giklass_data:/app \
  your-username/giklass:latest
```

---

## Issue 8: "Health check keeps failing"

### Symptoms:
```
Unhealthy (4)
```

### Solution:
```bash
# Check container logs
docker logs giklass

# Disable health check if problematic (temporary)
docker run -d --name giklass \
  -p 3000:3000 \
  --health-interval=0 \
  your-username/giklass:latest
```

---

## Diagnostic Commands

```bash
# See all running containers
docker ps -a

# Check container logs (last 50 lines, follow)
docker logs giklass --tail 50 -f

# Check resource usage
docker stats giklass

# See environment variables
docker exec giklass printenv | sort

# Test connectivity inside container
docker exec giklass curl http://localhost:3000

# Check files in container
docker exec giklass ls -la /app/

# Check if dist folder is built
docker exec giklass ls -la /app/dist/

# Enter container shell
docker exec -it giklass /bin/sh

# Check open ports
docker port giklass

# See all logs (including startup)
docker logs giklass --since 1h
```

---

## EC2 Diagnostics

```bash
# SSH to EC2
ssh -i key.pem ec2-user@public-ip

# Check if Docker is running
sudo systemctl status docker

# Test port from EC2
curl http://localhost:3000

# Test from another machine
curl http://public-ip:3000

# Check EC2 Security Group
# AWS Console → EC2 → Security Groups → Check inbound rules

# Check system firewall
sudo firewall-cmd --list-all  # Or check iptables
```

---

## Quick Fix Checklist

If application won't show on public IP:
- [ ] Container is running: `docker ps` includes giklass
- [ ] Container is healthy: `docker logs giklass` shows no errors
- [ ] PORT is exposed: Dockerfile has `EXPOSE 3000`
- [ ] Container binds to 0.0.0.0: `docker exec giklass curl localhost:3000` works
- [ ] Security group allows port 3000: AWS console check
- [ ] TEST locally first: `docker-compose up` on your machine
- [ ] Environment variables set: `docker inspect giklass` shows NODE_ENV=production

---

## Still Not Working?

1. **Collect diagnostics:**
```bash
docker logs giklass > logs.txt 2>&1
docker inspect giklass > inspect.json
curl -v http://public-ip:3000 > curl-output.txt 2>&1
```

2. **Check if it's a development mode issue:**
```bash
# Container running with development Vite middleware instead of production build
docker exec giklass printenv NODE_ENV  # Should be "production"
docker exec giklass ls -la /app/dist/  # Should have built files
```

3. **Test with simple Node app:**
```bash
# Verify Docker and networking work with basic app
docker run -d -p 3000:3000 --name test-node \
  node:20-alpine \
  sh -c 'npm init -y && npm install express && node -e "require(\"express\")().get(\"/\", (req, res) => res.send(\"OK\")).listen(3000)"'

# If this works, issue is with GIKLASS app, not Docker/EC2
```

---

## Reference

- Dockerfile: Updated with NODE_ENV=production, PORT env var, health check
- server.ts: Updated to read PORT from environment variable
- docker-compose.yml: For local testing and easy deployment
- DOCKER_DEPLOYMENT.md: Full deployment guide
