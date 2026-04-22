📚 Library Management System API
A robust Backend RESTful API designed to manage library operations, including user management, book inventory, and a comprehensive borrowing tracking system. Built with Node.js, Express, and MongoDB.

🚀 Overview
This project implements a Modular Architecture to ensure scalability and maintainability. It handles complex relationships between users and books, ensuring data integrity through Mongoose schema design and logical business flows.

🛠️ Tech Stack
Runtime Environment: Node.js

Web Framework: Express.js

Database: MongoDB (NoSQL)

ODM: Mongoose

Authentication: JSON Web Tokens (JWT) & Bcrypt.js

Deployment: Vercel (Serverless Functions)

Tools: Git, Postman, Dotenv, CORS

🏗️ Folder Structure
The project follows a clean, layered directory structure to separate concerns:

Plaintext
Library-App/
├── src/
│   ├── DB/                 # Database configurations and Mongoose Models
│   │   ├── models/         # (Book, User, BorrowedBook, Library)
│   │   └── connection.js   # MongoDB Atlas Connection logic
│   ├── modules/            # Business logic divided into features
│   │   ├── user/           # User management (Controller, Service, Routes)
│   │   ├── book/           # Book inventory and search logic
│   │   └── borrowing/      # Borrowing/Returning transactions
│   └── app.controller.js   # Centralized Route management
├── index.js                # Application Entry Point
└── vercel.json             # Vercel Deployment configuration
✨ Key Features
User Management: Full registration and profile management.

Book Inventory: Detailed book records with availability status tracking.

Advanced Borrowing Logic: - Automated dueDate calculation (14-day default).

Status tracking (Borrowed, Returned, Overdue).

Linking users and books via a dedicated BorrowedBook model.

Data Integrity: Uses Mongoose References to maintain clean relational data.

Soft Delete: Implemented isDeleted flags for safe data handling.

Security: Password hashing and protected routes.

🚦 Getting Started
Prerequisites
Node.js installed

MongoDB Atlas account or local MongoDB instance

Installation

Clone the repository:
git clone https://github.com/YoussefHawarii/Library-App.git

Install dependencies:
npm install

Set up environment variables:
Create a .env file in the root directory and add:

Code snippet
DB_URL=your_mongodb_connection_string
PORT=3000

Run the application:
npm run dev

🌐 Deployment
The project is configured for easy deployment on Vercel.
The live version can be accessed here: library-app-sigma-liard.vercel.app