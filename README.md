# PixelForge Nexus - Project Management System


## 🎯 Overview

PixelForge Nexus is a secure, role-based project management system designed specifically for Creative SkillZ LLC. It provides comprehensive project tracking, team collaboration, document management, and administrative oversight capabilities.

### Key Objectives
- **Streamline project workflows** with role-based dashboards
- **Enhance team collaboration** through secure document sharing
- **Provide administrative oversight** with comprehensive user management
- **Ensure data security** with robust authentication and authorization
- **Scale efficiently** with modern web technologies

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure session management
- **Multi-factor authentication (MFA)** support with TOTP
- **Role-based access control** (Admin, Project Lead, Developer)
- **Password encryption** using bcrypt with salt rounds
- **Session timeout** and automatic logout

### 👥 User Management
- **Three-tier role system** with granular permissions
- **User creation and management** (Admin only)
- **Role assignment and modification**
- **User profile management**
- **Account activation/deactivation**

### 📊 Project Management
- **Project creation and tracking** with status management
- **Team assignment** and member management
- **Deadline tracking** and project timelines
- **Project lead assignment** and delegation
- **Project completion workflow**

### 📁 Document Management
- **Secure file upload** with Cloudinary integration
- **Document sharing** within project teams
- **File type validation** and size restrictions
- **Document versioning** and access control
- **Direct download links** with permission checks

### 📈 Dashboard Features
- **Role-specific dashboards** with tailored interfaces
- **Real-time project statistics** and metrics
- **Team member overview** and assignment tracking
- **Deadline monitoring** and alerts
- **Activity summaries** and progress tracking

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 14.2.16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern UI component library
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless API endpoints
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - JWT token management

### File Storage
- **[Cloudinary](https://cloudinary.com/)** - Cloud-based file storage and CDN
- **[Multer](https://www.npmjs.com/package/multer)** - File upload handling

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and quality
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

---


# 🚀 PixelForge Nexus - Complete Setup Guide

This guide will walk you through setting up the PixelForge Nexus project management system from scratch.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB** (local installation or cloud account)
- **Cloudinary** account (for file storage)



---

## 🔧 Step 1: Project Setup

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/umendra-pardhi/pixelforge-nexus.git

# Navigate to project directory
cd pixelforge-nexus

```

### Install Dependencies

```bash
# Install all project dependencies
npm install

```

---

## 🌍 Step 2: Environment Variables Setup

### Environment Variables Configuration

```bash

# Local MongoDB (if running MongoDB locally)
MONGODB_URI=mongodb://localhost:27017/pixelforge_nexus

# Generate a secure JWT secret
JWT_SECRET=your-super-secret-jwt-key

# Get these from your Cloudinary dashboard
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Application environment
NODE_ENV=development

```

## 🚀 Step 3: Start the Application

### Development Server

```bash
# Start the development server
npm run dev

# The application should start on http://localhost:3000
```

### Verify Application is Running

```bash
# Check if the application is accessible
curl http://localhost:3000

```

---

### Access the Application

1. **Navigate to Login Page:**
   ```
   http://localhost:3000
   ```

2. **Login with Admin Credentials:**
   - Email: `admin@pixelforge.com`
   - Password: `admin123`

3. **Verify Dashboard Access:**
   - After login, you should be redirected to the admin dashboard
   - You should see project and user management options

### Test Different User Roles

If you created sample data, you can test different user roles:

```bash
# Project Lead Login
Email: lead@pixelforge.com
Password: lead123

# Developer Login
Email: dev1@pixelforge.com
Password: developer123
```

---
