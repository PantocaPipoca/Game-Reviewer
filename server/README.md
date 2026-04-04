# Backend API

## Structure

The API is divided in 3 layers:

#### **Repository**
Only touches the database. No decisions, no validation, just Prisma calls.

#### **Service**
Asks "should this be allowed?". Calls repositories, enforces business rules. Never touches `req`/`res`.

#### **Controller**
Extracts values from the request, calls a service, sends the response. Input shape validation lives here. Business validation lives in the service.


## Security

This is a Node.js + Express backend built with a focus on keeping things predictable and reasonably secure.
The app is created in createApp() and middleware is applied in a specific order.

- Basic setup: CORS, body parsing, cookies, and secure headers (Helmet)
- `Rate limiting` to avoid abuse
- `CSRF` protection using a double submit cookie pattern + SameSite only cookies
- `OpenAPI` validation to enforce request and response structure
- `Swagger` docs
- A simple /api/health endpoint for checks
- Centralized `error handling` with safe responses in production
- There’s also a small fix to convert `BigInt` values to strings so Express JSON responses don’t break.
