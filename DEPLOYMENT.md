# 🚀 Deployment Guide

## Step 1: Initialize Git Repository

```bash
cd c:\Tokenmint2
git init
git add .
git commit -m "Initial commit: Private Solana Token Minter"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Name: `private-token-minter`
4. Set to **Private** (recommended)
5. Don't initialize with README (we already have one)
6. Click "Create Repository"

## Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/private-token-minter.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `private-token-minter` repository
5. Click "Deploy"

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

## Step 5: Configure Environment Variables (Optional)

In Vercel dashboard:
1. Go to Project Settings
2. Environment Variables
3. Add: `REACT_APP_RPC_ENDPOINT` = `https://holy-neat-season.solana-mainnet.quiknode.pro/86d7ca3d0d4f68cdf73254d9e9d167895864f480/`

## ✅ Your App Will Be Live!

- **URL**: `https://your-project-name.vercel.app`
- **Access**: Only your 10 authorized wallets
- **Features**: Full token minting functionality
- **Cost**: Free on Vercel

## 🔧 Updates

To update your deployed app:
```bash
git add .
git commit -m "Update: description of changes"
git push
```

Vercel will automatically redeploy!