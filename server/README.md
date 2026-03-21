# Backend Info

**Repository** — only touches the database. No decisions, no validation, just Prisma calls.

**Service** — asks "should this be allowed?". Calls repositories, enforces business rules. Never touches `req`/`res`.

**Controller** — Extracts values from the request, calls a service, sends the response. Input shape validation lives here. Business validation lives in the service.
