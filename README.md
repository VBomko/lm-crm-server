# Scratch Node.js Project

A simple Node.js API project with Express, featuring a modular architecture.

## Features

- Express.js server with middleware setup
- Modular architecture
- Error handling
- Environment configuration
- Utility functions
- Logging middleware

## Project Structure

```
├── config/             # Configuration files
├── controllers/        # Route handlers
├── middleware/         # Custom middleware
├── models/             # Data models
├── routes/             # API routes
├── utils/              # Utility functions
├── .env                # Environment variables
├── index.js            # Entry point
├── package.json        # Project metadata and dependencies
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory (or use the existing one)
   ```
   PORT=3000
   NODE_ENV=development
   ```

### Running the Application

Start the server in development mode:
```
npm run dev
```

Start the server in production mode:
```
npm start
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/example` - Example endpoint

## Development

### Project Structure Explanation

- **config/**: Contains configuration files for the application, including environment variables.
- **middleware/**: Contains custom middleware functions for the Express application.
- **models/**: Contains data models with validation logic.
- **routes/**: Contains API route definitions.
- **utils/**: Contains utility functions used throughout the application.

### Adding New Features

1. Create a new model in the `models/` directory
2. Create a new controller in the `controllers/` directory
3. Create a new route file in the `routes/` directory
4. Add the new route to the `routes/index.js` file

## License

ISC