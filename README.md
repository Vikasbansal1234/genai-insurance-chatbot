# 🏥 GeniAI - AI-Powered Health Insurance Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

An intelligent health insurance management platform powered by GPT-4 with RAG (Retrieval-Augmented Generation) capabilities. The system enables users to manage insurance policies, upload and query PDF documents, and interact with an AI agent for policy operations.

[Features](#-features) • [Architecture](#-architecture-overview) • [Setup](#-setup-instructions) • [API Docs](#-api-documentation) • [Prompt Strategy](#-prompt-engineering-strategy)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Setup Instructions](#-setup-instructions)
- [Development & Testing](#-development--testing)
- [API Documentation](#-api-documentation)
- [Prompt Engineering Strategy](#-prompt-engineering-strategy)
- [Assumptions](#-assumptions)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)

---

## ✨ Features

### 🤖 AI Agent Capabilities
- **Conversational AI Interface**: GPT-4o powered chat agent with context-aware responses
- **Policy Management**: Purchase, renew, and cancel insurance policies through natural conversation
- **RAG Document Search**: Query uploaded PDF documents with semantic search
- **Multi-tool Integration**: LangChain-powered agent with 9+ specialized tools
- **Persistent Chat History**: Multi-session conversation management

### 📄 Document Management
- **PDF Upload & Processing**: Automatic extraction and embedding of PDF content
- **Cloud Storage**: AWS S3 integration for secure file storage
- **Vector Search**: MongoDB Atlas Vector Search for semantic document retrieval
- **User-Isolated Data**: Each user's documents are securely isolated
- **Chunking Strategy**: Recursive text splitting with overlap for better context

### 🏥 Insurance Operations
- **Policy Purchase**: Create new insurance policies with customer and beneficiary details
- **Policy Renewal**: Extend existing policies with automated payment processing
- **Policy Cancellation**: Request and process policy cancellations
- **Plan Browsing**: View available insurance plans by category (health, life, motor, home)

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: User and admin role separation
- **Password Hashing**: Bcrypt encryption for user credentials
- **Protected Routes**: Frontend and backend route protection

---

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB + Mongoose
- **Vector Store**: MongoDB Atlas Vector Search
- **Storage**: AWS S3 for file storage
- **AI/ML**: 
  - OpenAI GPT-4o (Chat Model)
  - LangChain (Agent Framework)
  - OpenAI text-embedding-3-large (Embeddings)
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **File Processing**: pdf-parse, multer

### Frontend
- **Framework**: Next.js 15 (React 19)
- **UI Library**: @assistant-ui/react (Chat UI)
- **Styling**: Tailwind CSS v4
- **Components**: Radix UI primitives
- **State Management**: Zustand
- **Markdown**: react-markdown with syntax highlighting

### Infrastructure
- **Database GUI**: Mongo Express
- **Package Manager**: npm workspaces (monorepo)
- **Code Quality**: Prettier (code formatting), ESLint (linting)
- **Testing**: Jest (unit testing), Supertest (API testing)

---

## 🏗 Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Next.js Frontend (Port 3000)                          │     │
│  │  - React Components                                     │     │
│  │  - Chat UI (@assistant-ui)                             │     │
│  │  - Authentication                                       │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  NestJS Backend (Port 8080)                            │     │
│  │                                                         │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │     │
│  │  │ Auth Module  │  │ Agent Module │  │ PDF Module  │ │     │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │     │
│  │  │Policy Module │  │ Plan Module  │  │ Chat Module │ │     │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
          ┌───────────────────┴───────────────────┐
          │                                        │
          ▼                                        ▼
┌──────────────────────────┐          ┌──────────────────────────┐
│   AI/ML Layer            │          │   Data Layer             │
│                          │          │                          │
│  ┌────────────────────┐  │          │  ┌────────────────────┐  │
│  │ OpenAI GPT-4o      │  │          │  │ MongoDB            │  │
│  │ (Chat Agent)       │  │          │  │ - Users            │  │
│  └────────────────────┘  │          │  │ - Policies         │  │
│                          │          │  │ - Plans            │  │
│  ┌────────────────────┐  │          │  │ - Chats            │  │
│  │ LangChain          │  │          │  │ - Customers        │  │
│  │ - Agent Framework  │  │          │  │ - Payments         │  │
│  │ - 9+ Tools         │  │          │  └────────────────────┘  │
│  │ - RAG Pipeline     │  │          │                          │
│  └────────────────────┘  │          │  ┌────────────────────┐  │
│                          │          │  │ MongoDB Atlas      │  │
│  ┌────────────────────┐  │          │  │ Vector Search      │  │
│  │ OpenAI Embeddings  │  │          │  │ - PDF Embeddings   │  │
│  │ text-embedding-    │  │          │  │ - Semantic Search  │  │
│  │ 3-large            │  │          │  └────────────────────┘  │
│  └────────────────────┘  │          │                          │
└──────────────────────────┘          └──────────────────────────┘
```

### Agent Architecture (LangChain Flow)

```
User Input → Agent Controller → Agent Service
                                      │
                                      ▼
                            ┌─────────────────┐
                            │ LangChain Agent │
                            │   (GPT-4o)      │
                            └─────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ Policy Tools │  │  Plan Tools  │  │ RAG Retriever│
          ├──────────────┤  ├──────────────┤  ├──────────────┤
          │• purchase    │  │• getAllPlans │  │• Vector      │
          │• renew       │  │• getPlanById │  │  Search      │
          │• cancel      │  │• getByCatego │  │• User-filter │
          │• getById     │  │  ry          │  │• Top-K       │
          │• getAll      │  └──────────────┘  │  results     │
          └──────────────┘                     └──────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      ▼
                              Database Operations
                              (MongoDB + Vector DB)
```

### Data Flow

#### 1. **User Authentication Flow**
```
Register/Login → Hash Password → Create JWT → Store Token
                                              ↓
Protected Requests → Validate JWT → Extract User ID → Proceed
```

#### 2. **PDF Upload & Embedding Flow**
```
Upload PDF → Parse PDF → Chunk Text (1000 chars, 200 overlap)
                              ↓
                Generate Embeddings (OpenAI text-embedding-3-large)
                              ↓
                Store in MongoDB Atlas Vector Search
                (with userId filter)
```

#### 3. **Chat Conversation Flow**
```
User Message → Save to Chat History → Build Context
                                         ↓
                              Create Agent with Tools
                                         ↓
                              Invoke GPT-4o with Context
                                         ↓
                              Tool Execution (if needed)
                                         ↓
                              Generate Response
                                         ↓
                              Save Assistant Message
```

### Database Schema

#### Collections

**Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  username: String,
  role: String (enum: 'user' | 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

**Policies Collection**
```javascript
{
  _id: ObjectId,
  policyNumber: String (unique),
  userId: ObjectId (ref: User),
  customerId: ObjectId (ref: Customer),
  planId: ObjectId (ref: Plan),
  agentId: ObjectId (optional),
  startDate: Date,
  endDate: Date,
  status: String (enum: 'active' | 'expired' | 'cancelled'),
  createdAt: Date,
  updatedAt: Date
}
```

**Plans Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  category: String (enum: 'health' | 'life' | 'motor' | 'home'),
  basePremium: Number,
  coverageAmount: Number,
  description: String,
  riders: Array,
  createdAt: Date,
  updatedAt: Date
}
```

**Chats Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  messages: [{
    role: String (enum: 'user' | 'assistant'),
    content: String,
    timestamp: Date
  }],
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**PdfEmbeddings Collection (MongoDB Atlas)**
```javascript
{
  _id: ObjectId,
  text: String,
  embedding: Array<Number> (vector),
  userId: String,
  fileName: String,
  chunkIndex: Number,
  createdAt: Date
}
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Docker** and **Docker Compose** installed
- **OpenAI API Key**: Required for GPT-4 and embeddings (get one at [OpenAI](https://platform.openai.com/api-keys))
- At least 4GB RAM recommended
- Ports 3000, 8080, and 27017 available on your system

### Step-by-Step Setup

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd GeniAi
```

#### Step 2: Create Environment Files

Create `.env` files in three locations: **root**, **backend**, and **web** folders.

**1. Root `.env` file** (create in project root):

```env
# Docker Compose Environment Variables
# Copy this file to .env and fill in your actual values

# Backend Configuration
NODE_ENV=production
PORT=8080

# OpenAI API Key (get from https://platform.openai.com)
OPENAI_API_KEY=

# MongoDB Atlas Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/?appName=yourapp
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=yourapp
MONGODB_ATLAS_DB_NAME=test

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

**2. Backend `.env` file** (create in `backend/` folder):

```env
# OpenAI API Key
OPENAI_API_KEY=

# MongoDB Atlas Configuration
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=yourapp
MONGODB_ATLAS_COLLECTION_NAME=pdfembeddings
MONGODB_ATLAS_DB_NAME=test

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

**3. Web `.env` file** (create in `web/` folder):

```env
# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com)
- Generate JWT secret with: `openssl rand -base64 32`
- MongoDB Atlas URI should include your username, password, and cluster details

#### Step 3: Start the Application

```bash
docker compose up
```

Or run in detached mode (background):

```bash
docker compose up -d
```

**What happens during Docker build:**

**Backend Build Process:**
1. 📦 Installs dependencies
2. 🔍 **Runs ESLint** - Checks code quality and style
3. 💅 **Runs Prettier format check** - Verifies code formatting
4. ✅ **Runs Jest tests** - Executes all test cases
5. 🏗️ Builds the application
6. 🚀 Starts NestJS backend API server (port 8080)

**Frontend Build Process:**
1. 📦 Installs dependencies
2. 🏗️ Builds Next.js application
3. 🌐 Starts Next.js frontend app (port 3000)

**After Build:**
- 🗄️ MongoDB database container starts
- 📊 Seeds initial data (admin user, plans, agents)

**Note:** If tests, lint, or format checks fail, the Docker build will stop. You can disable these checks by setting environment variables:
```bash
RUN_LINT=false RUN_FORMAT_CHECK=false RUN_TESTS=false docker compose up --build
```

#### Step 4: Access the Application

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api`
- **API Docs**: `http://localhost:8080/api/docs`

**Default Admin Credentials:**
```
Email: admin@example.com
Password: admin123
```

⚠️ **Change these credentials in production!**

## 🧪 Development & Testing

### Running Tests

**Backend Tests** (Jest)

```bash
# Navigate to backend directory
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov
```

**Test Structure:**
- Test files are located in `backend/test/domain/`
- Tests follow the naming convention: `*.spec.ts`
- Tests mirror the source code structure

**Test Files:**
- `backend/test/domain/agent/agent.controller.spec.ts`
- `backend/test/domain/auth/auth.controller.spec.ts`
- `backend/test/domain/chat/chat.controller.spec.ts`
- `backend/test/domain/pdf/pdf.controller.spec.ts`
- `backend/test/domain/plan/plan.controller.spec.ts`
- `backend/test/domain/policy/policy.controller.spec.ts`

### Code Formatting & Linting

**Backend** (Prettier + ESLint)

```bash
# Navigate to backend directory
cd backend

# Format code with Prettier
npm run format

# Check formatting without making changes
npm run format:check

# Format all files (including markdown)
npm run format:all

# Run ESLint
npm run lint

# Run ESLint and auto-fix issues
npm run lint:fix
```

**Frontend** (Prettier + ESLint)

```bash
# Navigate to web directory
cd web

# Check code formatting
npm run prettier

# Format code with Prettier
npm run prettier:fix

# Run ESLint
npm run lint
```

**Quick Commands:**
- **Backend**: `cd backend && npm run format && npm run lint:fix`
- **Frontend**: `cd web && npm run prettier:fix && npm run lint`

## 📖 Detailed Docker Commands

**🛠️ Common Docker Compose Commands**

```bash
# Start all services (first time - builds images)
docker compose up --build

# Start in background (recommended)
docker compose up -d

# Stop all services
docker compose down

# View real-time logs from all services
docker compose logs -f

```

**🚀 Service Ports & URLs**

| Service | External URL | Internal Port | Purpose |
|---------|-------------|---------------|---------|
| **Frontend** | `http://localhost:3000` | Port 3000 | Next.js React App |
| **Backend API** | `http://localhost:8080` | Port 8080 | NestJS REST API |
| **API Docs** | `http://localhost:8080/api/docs` | Port 8080 | Swagger Documentation |

**✅ Verify Installation**

After running `docker compose up`, verify everything is working:

1. **🌐 Frontend Web App**: Visit `http://localhost:3000`
   - Should show the AI assistant interface

2. **🔗 Backend API Health**: Visit `http://localhost:8080/api/health`
   - Should return: `{"status":"healthy","timestamp":"...","service":"Health Insurance Policy API","framework":"NestJS"}`

3. **📚 API Documentation**: Visit `http://localhost:8080/api/docs`
   - Interactive Swagger UI for all API endpoints

**🔍 Troubleshooting**

```bash
# Check if all services are running
docker compose ps

# View detailed logs
docker compose logs -f

# Test backend connectivity
curl http://localhost:8080/api/health

# Test frontend accessibility
curl -s http://localhost:3000 | head -5
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8080/api
```

### Interactive API Docs

Swagger UI available at: `http://localhost:8080/api/docs`

### Authentication

All protected endpoints require JWT Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |

**Register Request**
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe",
  "role": "user"
}
```

**Register Response**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "user"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Login Request**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Chat Management (`/api/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/chat` | Get all user chats | Yes |
| POST | `/chat` | Create new chat | Yes |
| GET | `/chat/:id` | Get chat by ID | Yes |
| PATCH | `/chat/:id` | Update chat title | Yes |
| DELETE | `/chat/:id` | Delete chat | Yes |

**Create Chat**
```json
POST /api/chat
{
  "title": "Insurance Inquiry"
}
```

**Get User Chats**
```json
GET /api/chat

Response:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "title": "Insurance Inquiry",
    "messages": [
      {
        "role": "user",
        "content": "What plans do you offer?",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "role": "assistant",
        "content": "We offer health, life, motor, and home insurance...",
        "timestamp": "2024-01-15T10:30:05Z"
      }
    ],
    "lastMessageAt": "2024-01-15T10:30:05Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:05Z"
  }
]
```

#### AI Agent (`/api/agent`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/agent` | Chat with AI agent | Yes |

**Agent Chat Request**
```json
POST /api/agent
{
  "input": "I want to purchase health insurance",
  "chatId": "507f1f77bcf86cd799439011",
  "conversationHistory": [
    {
      "role": "user",
      "content": "What plans do you offer?"
    },
    {
      "role": "assistant",
      "content": "We offer multiple plans..."
    }
  ]
}
```

**Agent Chat Response**
```json
{
  "output": "I can help you purchase health insurance. We have several options available...",
  "chatId": "507f1f77bcf86cd799439011"
}
```

#### Policy Management (`/api/policy`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/policy/purchase` | Purchase new policy | Yes |
| POST | `/policy/renew/:policyNumber` | Renew existing policy | Yes |
| POST | `/policy/cancel/:policyNumber` | Cancel policy | Yes |
| GET | `/policy` | Get user policies | Yes |
| GET | `/policy/:policyNumber` | Get policy details | Yes |

**Purchase Policy**
```json
POST /api/policy/purchase
{
  "planName": "Basic Health Insurance",
  "agentId": "507f1f77bcf86cd799439011",
  "insured": {
    "name": "John Doe",
    "relation": "self",
    "dob": "1990-01-15"
  },
  "beneficiaries": [
    {
      "name": "Jane Doe",
      "relation": "spouse"
    }
  ],
  "customerPhone": "+1234567890"
}
```

#### Plan Management (`/api/plan`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/plan` | Get all plans | Yes |
| GET | `/plan/:id` | Get plan by ID | Yes |
| GET | `/plan/category/:category` | Get plans by category | Yes |

**Get All Plans**
```json
GET /api/plan

Response:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Basic Health Insurance",
    "category": "health",
    "basePremium": 5000,
    "coverageAmount": 500000,
    "description": "Comprehensive health coverage...",
    "riders": [
      "Critical Illness Cover",
      "Hospital Cash"
    ]
  }
]
```

#### PDF Upload (`/api/pdf`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/pdf/upload` | Upload and embed PDF | Yes |

**Upload PDF**
```bash
POST /api/pdf/upload
Content-Type: multipart/form-data

file: <pdf-file>
```

**Response**
```json
{
  "success": true,
  "message": "PDF processed and embeddings stored successfully.",
  "chunksStored": 25,
  "db": "test",
  "collection": "pdfembeddings"
}
```

### Error Responses

All endpoints follow a consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 🧠 Prompt Engineering Strategy

### Overview

The system employs a sophisticated prompt engineering strategy using LangChain's agent framework with GPT-4o. The strategy focuses on tool-augmented generation (TAG) combined with retrieval-augmented generation (RAG) for optimal performance.

### Core Principles

#### 1. **Tool-First Architecture**
- **Explicit Tool Descriptions**: Each tool has detailed descriptions guiding the AI when to use it
- **Schema Validation**: Zod schemas ensure proper parameter passing
- **Context Injection**: User ID and chat ID automatically injected into tool context
- **Single Responsibility**: Each tool handles one specific task

#### 2. **Tool Descriptions & Prompts**

##### Policy Tools

**Purchase Insurance Tool**
```typescript
{
  name: "purchase_insurance",
  description: "Purchase a new insurance policy for a customer. 
                Creates customer record, policy, and payment. 
                Requires a valid plan name (e.g., 'Basic Health Insurance'). 
                Customer name and email are automatically taken from authenticated user. 
                User is automatically identified from authentication context.",
  schema: z.object({
    planName: z.string().describe(
      "The name of the insurance plan (e.g., 'Basic Health Insurance', 'Premium Life Insurance'). 
       Use get_all_plans tool to see available plans."
    ),
    // ... other parameters
  })
}
```

**Key Strategy**: 
- ✅ Explicitly states what the tool does
- ✅ Mentions automatic user context
- ✅ References other tools for dependencies
- ✅ Provides examples in descriptions

**Renew Insurance Tool**
```typescript
{
  name: "renew_insurance",
  description: "Renew an existing insurance policy using the policy number. 
                Extends the policy's end date by one year, creates a renewal record, 
                and generates a payment record for the renewal premium. 
                User is automatically identified from authentication context.",
  schema: z.object({
    policyNumber: z.string().describe(
      "The policy number (e.g., POL-1731234567890-ABCD1234) of the policy to renew."
    )
  })
}
```

##### Plan Tools

**Get All Plans Tool**
```typescript
{
  name: "get_all_plans",
  description: "Retrieve all available insurance plans in the system. 
                Returns complete list of plans with details including plan name, 
                category (health/life/motor/home), base premium, coverage amount, 
                and available riders. 
                Use this when user asks about available insurance plans or 
                wants to compare different plans.",
  schema: z.object({}) // No input needed
}
```

**Key Strategy**:
- ✅ Describes return data structure
- ✅ Provides usage scenarios
- ✅ Lists categories explicitly

##### RAG Retriever Tool

**Document Search Tool**
```typescript
{
  name: "retrieve_policy_information",
  description: "**USE THIS TOOL ONLY AS A LAST RESORT** when the user's query is 
                specifically about retrieving content or information from their 
                uploaded PDF documents. 
                
                DO NOT use this tool if the user is asking about: purchasing insurance, 
                renewing policies, canceling policies, getting policy details, 
                viewing plans, or any other action that has a dedicated tool. 
                
                ONLY use this tool when the user explicitly asks questions about the 
                CONTENT inside their uploaded PDF files (e.g., 'What does my PDF say about...', 
                'Find information in my uploaded document about...'). 
                
                This searches through the authenticated user's uploaded insurance 
                documents and PDFs. Returns relevant document excerpts from the 
                user's uploaded files."
}
```

**Key Strategy**:
- ✅ **Negative prompting**: Explicitly states when NOT to use the tool
- ✅ **Priority guidance**: "ONLY AS A LAST RESORT"
- ✅ **Clear use cases**: Provides exact query patterns
- ✅ **Prevents misuse**: Avoids hallucinations and unnecessary retrievals

#### 3. **Context Management**

**Automatic Context Injection**
```typescript
const contextSchema = z.object({
  user_id: z.string().describe("The unique ID of the user."),
  chat_id: z.string().optional().describe("The chat conversation ID."),
});

// Passed to agent
{
  context: { 
    user_id: user.id,
    chat_id: chat._id.toString(),
  }
}
```

**Benefits**:
- ✅ User isolation without prompting
- ✅ Automatic authentication
- ✅ Session management
- ✅ Prevents cross-user data access

#### 4. **Conversation History Management**

```typescript
// Build message history
const messages = [];

// Add previous conversation
if (conversationHistory && conversationHistory.length > 0) {
  for (const msg of conversationHistory) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content));
    } else {
      messages.push(new AIMessage(msg.content));
    }
  }
}

// Add current message
messages.push(new HumanMessage(input));
```

**Benefits**:
- ✅ Multi-turn conversations
- ✅ Context preservation
- ✅ Follow-up questions
- ✅ Coherent dialogue

#### 5. **Model Configuration**

```typescript
new ChatOpenAI({ 
  model: "gpt-4o",      // Latest GPT-4 optimized
  temperature: 0,       // Deterministic responses
  apiKey: process.env.OPENAI_API_KEY 
})
```

**Strategy Rationale**:
- **GPT-4o**: Best reasoning for tool selection
- **Temperature 0**: Consistent, predictable outputs
- **No system prompt needed**: Tool descriptions act as prompts

#### 6. **RAG Strategy**

**Embedding Configuration**
```typescript
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-large",  // 3072 dimensions
});
```

**Chunking Strategy**
```typescript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,      // Optimal for context window
  chunkOverlap: 200,    // Preserve context across chunks
});
```

**Retrieval Configuration**
```typescript
const retriever = vectorStore.asRetriever({
  filter: {
    preFilter: {
      "userId": { $eq: userId },  // User isolation
    },
  },
  k: 10,  // Top 10 most relevant chunks
});
```

**RAG Flow**:
1. User query → Embed query
2. Semantic search in user's documents
3. Retrieve top-K relevant chunks
4. Pass to GPT-4o as context
5. Generate grounded response

#### 7. **Error Handling & Fallbacks**

```typescript
try {
  const result = await agent.invoke(
    { messages },
    { context: { user_id, chat_id } }
  );
  // Process result
} catch (error) {
  // Log error
  // Return user-friendly message
  throw new InternalServerErrorException({
    success: false,
    error: 'Failed to create conversation',
    message: error.message,
  });
}
```

### Prompt Engineering Best Practices Applied

✅ **Specificity**: Tool descriptions are highly specific
✅ **Examples**: Provide concrete examples in descriptions
✅ **Constraints**: Explicit instructions on when NOT to use tools
✅ **Structure**: Consistent tool naming and parameter patterns
✅ **Context**: Automatic context injection prevents prompt injection
✅ **Determinism**: Temperature 0 for production reliability
✅ **Chain-of-Thought**: Agent naturally reasons through tool selection
✅ **Few-Shot Learning**: Tool descriptions act as examples
✅ **Negative Prompting**: Explicitly state what NOT to do
✅ **Schema Validation**: Zod schemas enforce parameter types

### Agent Decision Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ GPT-4o Reasoning│
└─────────────────┘
    │
    ▼
Analyze Intent
    │
    ├─► Purchase intent? → use purchase_insurance
    ├─► Renewal intent? → use renew_insurance
    ├─► Query plans? → use get_all_plans
    ├─► Policy info? → use get_insurance
    ├─► Document query? → use retrieve_policy_information (LAST RESORT)
    └─► Casual chat? → Direct response
```

### Testing Prompts

**Good Prompts** (Trigger correct tools):
- "I want to buy health insurance" → `purchase_insurance` + `get_all_plans`
- "Show me all available plans" → `get_all_plans`
- "What does my uploaded PDF say about coverage limits?" → `retrieve_policy_information`
- "Renew policy POL-123-ABC" → `renew_insurance`

**Challenging Prompts** (Test reasoning):
- "What are my options?" → Context-aware response (plans or policies)
- "How much does it cost?" → Clarification question
- "My policy" → `get_insurance` to retrieve user's policies

---

## 📝 Assumptions

### Technical Assumptions

1. **Database Configuration**
   - MongoDB Atlas is available for vector search functionality
   - MongoDB Atlas cluster is M10 or higher (required for vector search)
   - Vector search index is manually created before PDF upload
   - Local MongoDB is used for application data (policies, users, etc.)

2. **API Keys & Access**
   - Valid OpenAI API key with GPT-4 access
   - Sufficient OpenAI API credits for embeddings and completions
   - MongoDB Atlas credentials have read/write permissions

3. **Infrastructure**
   - Node.js 18+ is installed
   - Sufficient disk space for PDF uploads (temporary storage)
   - Network access to OpenAI API and MongoDB Atlas
   - Ports 3000, 8080, 8081, 27017 are available

4. **Development Environment**
   - npm workspaces are supported
   - ES Modules are enabled
   - TypeScript compilation works correctly

### Business Logic Assumptions

1. **Insurance Policies**
   - Policy numbers are generated automatically using timestamp + random string
   - Policies have a one-year validity period by default
   - Renewal extends the policy by exactly one year
   - Only active policies can be renewed
   - Cancelled policies cannot be reactivated

2. **User Management**
   - One user can have multiple policies
   - Email addresses are unique across the system
   - Users can only access their own policies and documents
   - Default role is 'user', admin role must be explicitly set

3. **Plans**
   - Plans are pre-defined and stored in the database
   - Plan names must match exactly when purchasing
   - Plan categories are limited to: health, life, motor, home
   - Plans cannot be modified through the API (admin-only operation)

4. **PDF Documents**
   - PDFs are processed immediately upon upload
   - Original PDFs are deleted after embedding
   - Only PDF format is supported
   - Maximum file size is handled by server configuration
   - PDFs are chunked into 1000-character segments with 200-character overlap

5. **AI Agent Behavior**
   - Agent has access to conversation history for context
   - Agent can only perform operations on behalf of authenticated user
   - Agent cannot access other users' data
   - Tool selection is deterministic (temperature = 0)
   - RAG retrieval is used only when explicitly needed

### Security Assumptions

1. **Authentication**
   - JWT tokens expire after 24 hours
   - Passwords are hashed with bcrypt (10 rounds)
   - Token refresh is not implemented (re-login required)
   - Frontend stores tokens in localStorage

2. **Data Isolation**
   - User IDs are automatically extracted from JWT
   - Database queries are filtered by user ID
   - Vector search includes user ID prefilter
   - No cross-user data leakage is possible

3. **File Upload**
   - File uploads are scoped to authenticated users
   - Temporary files are cleaned up after processing
   - No file type validation beyond extension
   - Upload directory is not publicly accessible

### Operational Assumptions

1. **Error Handling**
   - OpenAI API failures are caught and returned as 500 errors
   - MongoDB connection failures are logged
   - Invalid JWT tokens return 401 errors
   - PDF parsing failures return 500 errors

2. **Logging**
   - Console logs are used for debugging
   - No persistent log storage is configured
   - Sensitive data (passwords, tokens) are not logged

3. **Performance**
   - No caching is implemented
   - Each request creates new database connections
   - Embedding generation is synchronous
   - No rate limiting is configured

4. **Deployment**
   - Application runs on a single server
   - No load balancing is configured
   - MongoDB is accessible from application server
   - Environment variables are set correctly

### Known Limitations

1. **Scalability**
   - Vector search requires MongoDB Atlas M10+ cluster (not free tier)
   - No horizontal scaling configuration
   - File uploads are stored temporarily on disk

2. **Features**
   - No password reset functionality
   - No email verification
   - No payment processing (simulated only)
   - No policy document generation

3. **Testing**
   - No unit tests included
   - No integration tests
   - No load testing
   - Manual testing required

4. **Documentation**
   - API documentation is auto-generated from decorators
   - No user documentation or help system
   - No video tutorials or onboarding

---

## 📁 Project Structure

```
GeniAi/
├── backend/                          # NestJS Backend Application
│   ├── src/
│   │   ├── core/                     # Core modules
│   │   │   ├── database/             # Database configuration
│   │   │   │   ├── database.module.ts
│   │   │   │   ├── database.service.ts
│   │   │   │   └── seed-data.service.ts
│   │   │   ├── storage/              # Storage services
│   │   │   │   ├── s3.service.ts         # AWS S3 integration
│   │   │   │   └── storage.module.ts
│   │   │   └── tools/                # LangChain Tools
│   │   │       ├── retriever.tool.ts     # RAG Vector Search
│   │   │       ├── policies.tools.ts     # Policy Operations
│   │   │       └── plans.tools.ts        # Plan Operations
│   │   │
│   │   ├── domains/                  # Feature Modules
│   │   │   ├── agent/                # AI Agent Module
│   │   │   │   ├── agent.controller.ts
│   │   │   │   ├── agent.service.ts
│   │   │   │   ├── agent.module.ts
│   │   │   │   ├── agent.constants.ts
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   │
│   │   │   ├── auth/                 # Authentication
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   └── register.dto.ts
│   │   │   │   └── models/
│   │   │   │       └── user.entity.ts
│   │   │   │
│   │   │   ├── chat/                 # Chat History
│   │   │   │   ├── chat.controller.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── chat.module.ts
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   │
│   │   │   ├── policy/               # Policy Management
│   │   │   │   ├── policy.controller.ts
│   │   │   │   ├── policy.service.ts
│   │   │   │   ├── policy.module.ts
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   │
│   │   │   ├── plan/                 # Insurance Plans
│   │   │   │   ├── plan.controller.ts
│   │   │   │   ├── plan.service.ts
│   │   │   │   ├── plan.module.ts
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   │
│   │   │   ├── pdf/                  # PDF Processing
│   │   │   │   ├── pdf.controller.ts
│   │   │   │   ├── pdf.service.ts
│   │   │   │   ├── pdf.module.ts
│   │   │   │   ├── dto/
│   │   │   │   └── models/
│   │   │   │
│   │   │   ├── customer/             # Customer Records
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   ├── payment/              # Payment Records
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   ├── renewal/              # Renewal Records
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   ├── cancellation/         # Cancellation Records
│   │   │   │   ├── dto/
│   │   │   │   ├── models/
│   │   │   │   └── repositories/
│   │   │   │
│   │   │   └── shared/               # Shared Utilities
│   │   │       ├── decorators/
│   │   │       │   └── current-user.decorator.ts
│   │   │       ├── guards/
│   │   │       │   └── jwt-auth.guard.ts
│   │   │       └── strategies/
│   │   │           └── jwt.strategy.ts
│   │   │
│   │   ├── app.module.ts             # Root Module
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts                   # Entry Point
│   │
│   ├── test/                         # Test Files
│   │   ├── domain/                   # Domain-specific tests
│   │   │   ├── agent/
│   │   │   │   └── agent.controller.spec.ts
│   │   │   ├── auth/
│   │   │   │   └── auth.controller.spec.ts
│   │   │   ├── chat/
│   │   │   │   └── chat.controller.spec.ts
│   │   │   ├── pdf/
│   │   │   │   └── pdf.controller.spec.ts
│   │   │   ├── plan/
│   │   │   │   └── plan.controller.spec.ts
│   │   │   └── policy/
│   │   │       └── policy.controller.spec.ts
│   │   └── README.md                 # Test documentation
│   ├── dist/                         # Compiled JavaScript
│   ├── uploads/                      # Temporary PDF Storage
│   ├── .env                          # Backend environment variables (create this)
│   ├── Dockerfile                    # Backend Docker configuration
│   ├── jest.config.js               # Jest test configuration
│   ├── tsconfig.eslint.json          # ESLint TypeScript config
│   ├── MONGODB_SETUP.md
│   ├── package.json
│   └── tsconfig.json
│
├── web/                              # Next.js Frontend Application
│   ├── app/
│   │   ├── api/                      # API Routes (not used currently)
│   │   ├── auth/                     # Auth Pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── assistant.tsx             # Main Chat Interface
│   │   ├── page.tsx                  # Home Page
│   │   ├── layout.tsx                # Root Layout
│   │   └── globals.css               # Global Styles
│   │
│   ├── components/
│   │   ├── assistant-ui/             # Chat UI Components
│   │   │   ├── thread.tsx                # Main chat thread
│   │   │   ├── thread-list.tsx           # Chat history sidebar
│   │   │   ├── threadlist-sidebar.tsx
│   │   │   ├── attachment.tsx            # File attachments
│   │   │   ├── markdown-text.tsx         # Message rendering
│   │   │   ├── voice-input.tsx
│   │   │   ├── tool-fallback.tsx
│   │   │   └── tooltip-icon-button.tsx
│   │   │
│   │   └── ui/                       # Reusable UI Components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── avatar.tsx
│   │       ├── sidebar.tsx
│   │       └── ... (Radix UI components)
│   │
│   ├── lib/
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── chat-api.ts               # Chat API client
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── hooks/
│   │   └── use-mobile.ts             # Responsive hook
│   │
│   ├── middleware.ts                 # Route protection
│   ├── .env                          # Frontend environment variables (create this)
│   ├── Dockerfile                    # Frontend Docker configuration
│   ├── components.json               # shadcn/ui components config
│   ├── eslint.config.mjs             # ESLint configuration
│   ├── postcss.config.mjs            # PostCSS configuration
│   ├── next-env.d.ts                 # Next.js type definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── tailwind.config.js
│
├── docker-compose.yml                # Docker Compose configuration
├── .env                              # Root environment variables (create this)
├── node_modules/                     # Root dependencies
├── package.json                      # Workspace configuration
├── package-lock.json
└── README.md                         # This file
```

### Key Directories

**Backend**
- `src/core/`: Shared infrastructure (database, tools, storage)
- `src/domains/`: Feature-based modules (agent, auth, policy, etc.)
- `src/domains/*/dto/`: Data Transfer Objects for validation
- `src/domains/*/models/`: MongoDB schema definitions
- `src/domains/*/repositories/`: Data access layer (if used)
- `test/domain/`: Test files mirroring source structure (*.spec.ts)

**Frontend**
- `app/`: Next.js 15 app router pages
- `components/assistant-ui/`: Custom chat components
- `components/ui/`: Reusable Radix UI components
- `lib/`: Utility functions and API clients

---

## 🔧 Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `PORT` | Server port | No | `8080` | `8080` |
| `NODE_ENV` | Environment | No | `development` | `production` |
| `JWT_SECRET` | JWT signing key | Yes | - | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry | No | `24h` | `7d` |
| `MONGODB_URI` | MongoDB connection | Yes | - | `mongodb://localhost:27017/healthinsurance` |
| `MONGODB_ATLAS_URI` | Atlas connection | Yes | - | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_ATLAS_DB_NAME` | Atlas database | No | `test` | `production` |
| `MONGODB_ATLAS_COLLECTION_NAME` | Embeddings collection | No | `pdfembeddings` | `embeddings` |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - | `sk-...` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | No | - | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | No | - | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region for S3 | No | `us-east-1` | `us-east-1` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | No | - | `my-bucket-name` |

### Frontend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | No | `http://localhost:8080/api` | `https://api.example.com` |

### Security Notes

- ⚠️ Never commit `.env` files to version control
- ✅ Use `.env.example` files to document required variables
- ✅ Use strong, randomly generated `JWT_SECRET` in production
- ✅ Rotate API keys regularly
- ✅ Use environment-specific configurations

## Acknowledgments

- **OpenAI** - GPT-4 and embeddings
- **LangChain** - Agent framework
- **NestJS** - Backend framework
- **Next.js** - Frontend framework
- **MongoDB** - Database and vector search
- **@assistant-ui** - Chat UI components

## Demo Video

<iframe src="https://vimeo.com/1134231863?share=copy&fl=sv&fe=ci" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="GeniAI Demo Video"></iframe>

<p><a href="https://vimeo.com/1134231863">GeniAI Demo Video</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
