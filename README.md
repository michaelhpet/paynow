# Paynow

Accept payments with Paynow.

## Features

- Accept payments via various payment gateways.
- Manage payment statuses.
- Webhook support for payment notifications.
- RESTful API for payment operations.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (using Drizzle ORM)
- **Environment Management**: dotenv
- **Validation**: Celebrate (Joi)
- **Logging**: Winston
- **Testing**: Mocha, Chai, Sinon
- **CI/CD**: GitHub Actions

## Architecture

The project follows a modular architecture with the following structure:

```
paynow
├── src
│   ├── app
│   │   ├── index.ts
│   │   ├── v1
│   │   │   ├── payments
│   │   │   │   ├── controller.ts
│   │   │   │   ├── validation.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── payments.test.ts
│   │   │   ├── index.ts
│   ├── utils
│   │   ├── index.ts
│   │   ├── logger.ts
├── .github
│   ├── workflows
│   │   ├── ci.yml
├── package.json
├── tsconfig.json
├── README.md
```

## Setup

### Prerequisites

- Node.js (version 18 or higher)
- Yarn (package manager)
- SQLite

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/michaelhpet/paynow.git
   cd paynow
   ```

2. Install dependencies:

   ```sh
   yarn install
   ```

3. Create a `.env` file in the root directory and add use the content of `.env.example`

### Running the Application

1. Run database migrations:

   ```sh
   yarn migrate
   ```

2. Start the development server:

   ```sh
   yarn dev
   ```

3. The server will start on `http://localhost:8000`.

### Running Tests

1. Run the tests:

   ```sh
   yarn test
   ```

### CI/CD

The project uses GitHub Actions for continuous integration. The CI workflow is defined in `.github/workflows/ci.yml`.

## API Endpoints

### Payments

- `POST /api/v1/payments`: Create a new payment.
- `GET /api/v1/payments`: Get all payments.
- `GET /api/v1/payments/:id`: Get a payment by ID.
- `POST /api/v1/payments/webhook`: Handle payment webhook notifications.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
