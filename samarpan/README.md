---
title: Samarpan Frontend
emoji: 🌐
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# 🌐 Samarpan Full-Stack NGO Ecosystem - Frontend App

This is the containerized Next.js 16 (App Router) production deployment of the Samarpan NGO platform, hosted on Hugging Face Spaces.

## 🚀 Key Specifications
* **Runtime**: Docker / Node.js 18-alpine
* **Port Binding**: `7860` (Hugging Face default)
* **Framework**: Next.js 16 Standalone Engine

## 🌐 Dynamic Backend Integration
Bakes the client-side API pointer directly into the production code bundles:
* `NEXT_PUBLIC_API_URL` ➔ `https://avi-dev-machine-backend.hf.space/api/v1`
