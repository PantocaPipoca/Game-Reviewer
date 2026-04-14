# Backend API

## Structure

The API is divided in 3 layers:

#### **Repository**

Only touches the database. No decisions, no validation, just Prisma calls.

#### **Service**

Asks "should this be allowed?". Calls repositories, enforces business rules. Never touches `req`/`res`.

#### **Controller**

Extracts values from the request, calls a service, sends the response. Input shape validation lives here. Business validation lives in the service.

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

## Environment Variables

Environment variables of the server are set in `/server/.env`

#### `NODE_ENV`

- `production`<br>
  Logs will be written to the file `/observability/logs/app.log`.<br>
  No `/api/docs` and `/api/docs.json` routes.<br>
  Errors that are not from the `AppError` class will be sanitized to a safe error message, not exposing internal information (e.g. 400: Bad request).
- `development`<br>
  No email validation needed when creating user accounts.<br>
- `test`<br>
  Used to run unit & integration tests - see `docs/testing.md` to run tests.
  Doesn't print logs to stdout.
