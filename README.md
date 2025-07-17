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

### Testing

Test the Lead_Data functionality:
```
npm run test:lead
```

This will run comprehensive tests for the new lead management features.

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/example` - Example endpoint

### Events API

- `POST /events` - Create a new event (supports Lead_Data)
- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Lead Management

The Events API now supports lead management through the `Lead_Data` object:

- **Automatic Lead Creation**: When creating an event with `Lead_Data`, the system automatically creates or updates leads
- **Lead Deduplication**: Searches for existing leads by email or phone to prevent duplicates
- **Lead Association**: Automatically associates the lead with the event via the `Lead` field

### Record Type Management

The Events API automatically fetches and associates Record Types:

- **Automatic Record Type Lookup**: Fetches Record_Type from `crm_settings.Record_Types` table based on Event_Type
- **Table Filtering**: Searches for records where `Table = 'Events'` and `Name = Event_Type`
- **Graceful Handling**: Continues event creation even if Record_Type is not found

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

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