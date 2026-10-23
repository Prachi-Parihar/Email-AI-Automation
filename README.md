# 📧 Email AI Automation Platform

An AI-powered email automation platform designed to simplify email workflows with secure authentication and a modern web interface.

## 🚀 Overview

Email AI Automation is a full-stack web application built to streamline email-related workflows. The project uses a React frontend and a Node.js backend with a gateway and authentication service architecture.

## ✨ Features

- 🔐 User registration and login
- 📩 Email verification
- 🔑 Forgot and reset password functionality
- 🔥 Firebase authentication integration
- 🛡️ Authentication middleware and request validation
- ⚡ Redis integration
- 🌐 API Gateway for routing requests
- 📊 Interactive dashboard
- 🚦 Rate limiting and centralized error handling

## 🛠️ Tech Stack

**Frontend**
- React.js
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- REST APIs
- API Gateway architecture

**Database and Services**
- MongoDB
- Redis
- Firebase Authentication
- Email service integration

**Tools**
- Git and GitHub
- Docker

## 📁 Project Structure

```text
EmailWorkFlow-System/
├── backend/
│   ├── gateway/
│   └── services/
│       └── auth-service/
├── frontend/
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB or a MongoDB Atlas connection
- Redis
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Prachi-Parihar/Email-AI-Automation.git
cd Email-AI-Automation
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Open a separate terminal from the project root.

For the API Gateway:

```bash
cd backend/gateway
npm install
```

For the authentication service:

```bash
cd backend/services/auth-service
npm install
```

### 4. Configure environment variables

Create the required `.env` files based on your configuration. Set your database connection, Redis connection, authentication settings, email service credentials, and service URLs as needed.

**Important:** Never commit API keys, passwords, private keys, or production environment files to GitHub.

### 5. Run the application

Use the development scripts defined in each service's `package.json` to start the frontend, API Gateway, and authentication service in separate terminals.

Check each `package.json` for the exact available commands.

## 🔒 Security

- Environment variables are used for sensitive configuration.
- Authentication middleware helps protect secured routes.
- Request validation and rate limiting help improve API security.
- Private credentials should never be committed to the repository.

## 🎯 Learning Outcomes

Through this project, I am strengthening my skills in:

- Full-stack web development
- REST API development
- Authentication and authorization
- Microservice-style backend architecture
- Database and Redis integration
- Secure configuration management

## 👩‍💻 Author

**Prachi Parihar**

GitHub: [Prachi-Parihar](https://github.com/Prachi-Parihar)

---

⭐ If you find this project interesting, feel free to explore the repository!