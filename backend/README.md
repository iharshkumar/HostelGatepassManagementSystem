# Hostel Gatepass Management System — Backend API

Production-ready Flask REST API with MongoDB Atlas, JWT Authentication, and Clean Architecture.

## Features
- **Clean Architecture**: Decoupled routes, controllers, services, models, schemas, and utilities.
- **MongoDB Integration**: PyMongo integration for MongoDB Atlas.
- **JWT & Role-Based Access Control (RBAC)**: Secure tokens for Students, Wardens, and Admins.
- **Security First**: Password hashing via Bcrypt, CORS protection, security headers, input sanitization.
- **Unified JSON Response Standard**: Consistent `{ success, message, data/errors }` envelope.

## Quick Start

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   python app.py
   ```

4. Run tests:
   ```bash
   pytest tests/
   ```
