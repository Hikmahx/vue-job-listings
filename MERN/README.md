# MERN Stack Job Listings Application

This is a MERN (MongoDB, Express, React, Node.js) stack implementation of the job listings application, refactored from the Vue.js and Django REST Framework version.

## Project Structure

```
MERN/
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components organized by feature
│   │   │   ├── layout/    # Header, Footer, etc.
│   │   │   ├── Home/      # Home page components
│   │   │   ├── Dashboard/ # Dashboard components
│   │   │   ├── Jobs/      # Job-related components
│   │   │   └── Auth/      # Authentication components
│   │   ├── pages/         # Page components (routes)
│   │   ├── redux/         # Redux store and reducers
│   │   │   └── reducers/  # Redux slices
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
│
└── server/          # Express backend application
    ├── config/      # Configuration files
    │   ├── db.ts    # MongoDB connection
    │   └── .env.example
    ├── middleware/  # Express middleware
    │   └── auth.ts  # Authentication middleware
    ├── models/      # Mongoose models
    │   ├── User.ts
    │   ├── Job.ts
    │   ├── JobDetails.ts
    │   ├── Company.ts
    │   ├── CompanyMember.ts
    │   ├── JobSeekerProfile.ts
    │   └── TeamMemberProfile.ts
    ├── routes/      # Express routes
    │   ├── auth.ts
    │   ├── jobs.ts
    │   └── companies.ts
    ├── server.ts    # Express server entry point
    └── package.json
```

## Features

- User authentication (register, login, logout)
- Job listings with filtering and search
- Job details view
- User dashboard
- Company management
- Job creation and management (for team members)

## Tech Stack

### Backend

- **Node.js** with **Express.js**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation
- **cors** for cross-origin requests

### Frontend

- **React** with **TypeScript**
- **Redux Toolkit** for state management
- **React Router** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:

```bash
cd MERN/server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/joblistings
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:

```bash
cd MERN/client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `client` directory (optional, defaults are set):

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

The client will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/accounts/register` - Register a new user
- `POST /api/accounts/login` - Login user
- `POST /api/accounts/logout` - Logout user
- `GET /api/accounts/profile` - Get current user profile
- `PUT /api/accounts/profile` - Update user profile

### Jobs

- `GET /api/jobs` - Get all jobs (with filtering and pagination)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs/create` - Create a new job (authenticated)
- `PUT /api/jobs/update/:id` - Update a job (authenticated)
- `DELETE /api/jobs/delete/:id` - Delete a job (authenticated)

### Companies

- `GET /api/companies` - Get all companies
- `GET /api/companies/:slug` - Get company by slug
- `GET /api/companies/:slug/people` - Get company people
- `POST /api/companies/create` - Create a company (authenticated)
- `PUT /api/companies/:slug/update` - Update company (authenticated)
- `DELETE /api/companies/:slug/delete` - Delete company (authenticated)

## Notes

- This implementation does NOT include AI engineering features (no vector search, no AI search mode)
- The structure follows the same patterns as the Vue/Django version but adapted for MERN stack
- Components are organized by feature (Home, Dashboard, Jobs, Auth) rather than by type
- Redux slices are stored in the `reducers` folder
- The Redux store is named `redux` (folder structure)
- Layout components (Header, Footer) are in `components/layout`
- Pages are not suffixed with 'page' (e.g., `Home.tsx` not `HomePage.tsx`)

## Development

### Running Both Servers

You can run both servers concurrently. In the root `MERN` directory, you can use tools like `concurrently`:

```bash
# Install concurrently globally
npm install -g concurrently

# Run both servers
concurrently "cd server && npm run dev" "cd client && npm run dev"
```

Or use separate terminal windows for each server.

## License

Same as the parent project.
