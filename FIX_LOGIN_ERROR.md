# Fix GitHub Actions Login Error

## Error
```
Error: Username and password required
```

## Root Cause
GitHub Secrets are missing or incorrectly named in your repository.

---

## ✅ FIX: Add GitHub Secrets

### Step 1: Go to GitHub
1. Open: https://github.com/YOUR_USERNAME/GIKLASS
2. Click **Settings** (top menu)
3. Click **Secrets and variables** (left menu)
4. Click **Actions**

### Step 2: Add These 8 Secrets (Exactly as shown)

Click **"New repository secret"** for EACH one:

| Secret Name | Value | How to Get |
|-------------|-------|-----------|
| `DOCKER_USERNAME` | your-docker-hub-username | Docker Hub username |
| `DOCKER_PASSWORD` | your-docker-hub-token | Docker Hub → Settings → Security → New Access Token |
| `DOCKER_REGISTRY_URL` | docker.io | Keep exactly as shown |
| `GEMINI_API_KEY` | your-gemini-api-key | Google AI Studio |
| `JWT_SECRET` | your-random-secret | Generate random string |
| `AWS_EC2_HOST` | 54.123.45.67 | Your EC2 public IP |
| `AWS_EC2_USER` | ec2-user | ec2-user or ubuntu |
| `AWS_EC2_KEY` | entire-pem-file-content | Paste entire .pem file |

### Step 3: Verify All Secrets Are Added
```bash
# In GitHub:
Settings → Secrets and variables → Actions
# Should show 8 secrets ✅
```

### Step 4: Re-Run Workflow
1. Go to **Actions** tab
2. Click your workflow
3. Click **Re-run jobs** button
4. Watch it complete ✅

---

## ⚠️ Common Mistakes

❌ **Wrong:** Using Docker Hub password instead of access token  
✅ **Right:** Generate access token at Docker Hub → Settings → Security

❌ **Wrong:** Typos in secret names (DOCKER_USER instead of DOCKER_USERNAME)  
✅ **Right:** Match exactly as shown above

❌ **Wrong:** Empty secret values  
✅ **Right:** All values filled in

❌ **Wrong:** .pem file content has extra whitespace  
✅ **Right:** Paste exact file content (including -----BEGIN/END-----)

---

## 🚀 After Adding Secrets

```bash
# Push code to trigger workflow again
git push origin main

# Or manually re-run in GitHub:
# Actions → Your Workflow → Re-run jobs
```

---

## ✅ Verify Secrets Are Correct

Check Docker Hub token:
```bash
# In Docker Hub:
# 1. Go to: https://hub.docker.com/settings/security
# 2. Click "New Access Token"
# 3. Copy the token (not your password!)
# 4. Paste into DOCKER_PASSWORD secret
```

---

## 🆘 Still Getting Error?

Check these:
1. **Secret names exact match** - No typos
2. **Secret values not empty** - All have values
3. **GitHub repo is correct** - Settings tab shows your repo
4. **Waited a moment** - Sometimes takes a few seconds to sync

After adding/updating secrets, wait 10 seconds then re-run the workflow.
