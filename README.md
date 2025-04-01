# Project X - Inventory and Checkout System

![Inventory and Checkout System Model](https://github.com/akindele22/ProjectX/blob/66eb5928b7e90583bc7d152e2c69b83d09c34b08/Project%20X%20model.png)



![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

**Project X** is a custom inventory and checkout system designed for Shoprite to address declining sales by optimizing inventory management and checkout processing. This SaaS solution offers:

- Multi-user inventory management
- Role-based access control
- Secure checkout processing
- Real-time inventory updates

## Features

### Core Functionality
- ✅ **User Management**
  - Super Admin, Inventory Manager, and Cashier roles
  - Permission-based access control
  - Secure authentication with JWT

- 🛒 **Inventory System**
  - CRUD operations for inventory items
  - Stock quantity tracking
  - SKU management

- 💳 **Checkout Processing**
  - Transaction-based inventory updates
  - Role-restricted access

### Technical Features
- 🔒 **Security**
  - Password hashing with bcrypt
  - Rate limiting
  - CORS protection
  - Helmet security headers

- ⚙️ **Infrastructure**
  - PostgreSQL database
  - Knex.js query builder
  - Transaction management
  - Graceful shutdown

## System Architecture
```
project-x/
├── config/          # Configuration files
├── controllers/     # Business logic
├── middleware/      # Authentication and validation
├── migrations/      # Database schema
├── models/          # Data models
├── routes/          # API endpoints
├── services/        # External services
├── utils/           # Helper functions
├── app.js           # Main application
└── knexfile.js      # Database configuration
```

## API Documentation
### Key Endpoints

| Endpoint | Method | Description | Required Permissions |
|----------|--------|-------------|----------------------|
| `/api/v1/auth/register` | POST | Register super admin | None |
| `/api/v1/auth/login` | POST | User login | None |
| `/api/v1/users` | POST | Create new user(Require Super Admin permissions) | `user:create` |
| `/api/v1/users` | GET | List all users | `user:read` |
| `/api/v1/roles` | GET | List all roles | `role:read` |
| `/api/v1/roles/:id/permissions` | POST | Assign permissions to a role | `role:update` |
| `/api/v1/inventory` | POST | Add a new inventory item | `inventory:create` |
| `/api/v1/inventory` | GET | List all inventory items | `inventory:read` |
| `/api/v1/checkout` | POST | Process checkout | `checkout:process` |

## Installation

### Prerequisites
- Node.js 18.x
- PostgreSQL 15.x
- npm 9.x

### Steps
1. Clone the repository:
   ```bash
   git clone [https://github.com/akindele22/ProjectX.git]
   cd project-x
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up database:
   ```bash
   createdb projectx
   npm run migrate
   ```

## Configuration

Create a `.env` file in the root directory:

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Environment Variables
The application supports different environments:
- `development` (default)
- `test`
- `production`

Set via `NODE_ENV` environment variable.

## Testing

Run the test suite with:
```bash
npm test
```

## Deployment

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check `.env` credentials
   - Test connection with `psql`

2. **Role Initialization Errors**
   - Check migration status with `knex migrate:status`
   - Manually verify tables exist in database

3. **Authentication Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration

### Logs
Application logs are output to:
- Console in development mode
- File-based logs in production (`logs/` directory)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Project X** © 2025 - Shoprite Custom Inventory System

