---
title: Samarpan Backend
emoji: 🤝
colorFrom: yellow
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# 🤝 Samarpan Full-Stack NGO Ecosystem - Backend API

This is the containerized FastAPI production server hosting the enterprise core backend of Samarpan NGO platform.

## 🚀 Key Specifications
* **Runtime**: Docker / Python 3.11-slim
* **Port Binding**: `7860` (Hugging Face default)
* **Framework**: FastAPI (Asynchronous Engine)

## 🗃️ Essential Environment Configuration
Make sure to add the following secrets in **Space Settings ➔ Variables and Secrets**:
* `DATABASE_URL` (using `postgresql+asyncpg://`)
* `SYNC_DATABASE_URL` (using `postgresql://`)
* `GROQ_API_KEY` (Free AI API key from console.groq.com)
* `SECRET_KEY` (Strong cryptographic signing key)
* `FRONTEND_URL` (CORS authorized Vercel Frontend origin)
