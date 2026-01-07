# 🚀 Deployment Guide: Al Sakr V3

We have completely refactored the application to **Al Sakr V3**.
- **Frontend**: Open WebUI (migrated from custom Next.js)
- **Search**: Haystack + PgVector (migrated from LangChain + Qdrant)
- **Orchestrator**: n8n (retained)

## Step 1: Create New Repository
1.  Go to GitHub and create a new EMPTY repository (e.g., `alsakr-v3`).
2.  Do NOT initialize with README/License.
3.  Run the following commands in your local terminal:

```powershell
cd "c:\Users\pc shop\Desktop\alsakr_v2"
git remote add origin https://github.com/YOUR_USERNAME/alsakr-v3.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to VPS
1.  **SSH into your VPS**:
    ```bash
    ssh user@79.72.12.217
    ```

2.  **Pull and Clean**:
    ```bash
    # Go to your project folder (or clone fresh if you want)
    cd alsakr_v2
    
    # If the repo URL changed, update it:
    git remote set-url origin https://github.com/YOUR_USERNAME/alsakr-v3.git
    
    # Pull latest code
    git fetch --all
    git reset --hard origin/main
    
    # Run the deployment script
    cd v2_infra
    bash deploy.sh
    ```

3.  **Verify**:
    - Open WebUI: `http://79.72.12.217:3000`
    - Create your Admin Account on first login.
