# Backend API

## Structure

The API is divided in 3 layers:

### **Repository**

Only touches the database. No decisions, no validation, just Prisma calls.

### **Service**

Asks "should this be allowed?". Calls repositories, enforces business rules. Never touches `req`/`res`.

### **Controller**

Extracts values from the request, calls a service, sends the response. Input shape validation lives here. Business validation lives in the service.

### **Routes**

Receives requests, calls controllers, sends responses.

## Package Scripts

Scripts are executed using `npm run <script-name>`

### build

Compiles the TypeScript project using the TypeScript compiler (tsc).

### dev

Starts the development server in watch mode using tsx, automatically restarting when files change.

### prisma:test

Generates the Prisma client and applies database migrations using the test environment configuration from .env.test.

### prisma:ci

Generates the Prisma client and applies database migrations for CI environments using the default environment configuration.

### test:unit

Runs the unit test suite using Jest with the jest.unit.config.mjs configuration.

Uses NODE_OPTIONS=--experimental-vm-modules to support ES modules during testing

### test:integration

Runs the integration test suite using Jest with the jest.integration.config.mjs configuration.

Uses NODE_OPTIONS=--experimental-vm-modules to support ES modules during testing

### test

Prepares the test database, then runs both unit and integration tests using the .env.test environment configuration.

Execution order:

1. prisma:test
2. test:unit
3. test:integration

### test:ci

Runs database migrations and executes both unit and integration tests for CI environments.

Execution order:

1. prisma:ci
2. test:unit
3. test:integration



## Middlewares

This is a Node.js + Express REST API built with a focus on keeping it predictable and secure.
The app is created in `createApp()` and middleware is applied in a specific order:

- Basic setup: CORS, body parsing, cookies, and secure headers (Helmet)
- `Rate limiting` to avoid abuse
- `CSRF` protection using a double submit cookie pattern + SameSite only cookies (disabled in `test` mode)
- `OpenAPI` validation to enforce request and response structure
- `Swagger` docs (only available outside of `production`)
- A simple `/api/health` endpoint for checks
- Centralized `error handling` with safe responses in production
- A small fix to convert `BigInt` values to strings so Express JSON responses don't break

