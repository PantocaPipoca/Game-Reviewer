# Observability

> Prerequisites: Docker, Docker Compose

## Pipeline

#### Logs

```
App (Pino) => stdout & app.log => Alloy => Loki => Grafana
```

#### Metrics

```
App (/api/metrics) => Prometheus => Grafana
```

- Alloy: http://localhost:12345
- Loki: http://localhost:3100
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

> No auth required for endpoints because it's a development environment

## Log format

JSON in production. Every request line has method, URL, status code, response time and a `reqId` for tracing. Sensitive fields (`email`, `token`, `cookie`) are redacted automatically. In production logs are also written to `observability/logs/app.log`.

### PINO_LOG_LEVEL

| Level   | Description                                                           |
| ------- | --------------------------------------------------------------------- |
| `trace` | Most detailed logs                                                    |
| `debug` | Debug information for development and troubleshooting.                |
| `info`  | General application events (server start, requests, jobs, etc.).      |
| `warn`  | Non-critical issues or unexpected situations that should be reviewed. |
| `error` | Errors that affect a specific operation or request.                   |
| `fatal` | Critical errors that cause the application to stop or crash.          |

> Change the level by setting `PINO_LOG_LEVEL` in `server/.env`.

## Grafana

There's a custom made dashboard in Grafana that takes metrics from Prometheus and logs from Loki. Panels include traffic (RPS by method and status class), error rates (4xx/5xx as a percentage of total), latency, and Node.js runtime health (heap, CPU, event loop lag).

The latency panels show p50, p90, p95, and p99, which are `percentiles` of request duration. For example, p50 means 50% of requests complete in less than or equal to this time, p90 means 90% do, and so on.

Filters at the top (Method, Status code, Log level, Search) apply to both metric panels and log panels.

For e.g. to search for Errors in the log panel, you can use `level=error` in the search field.

## Alerts

There are 4 alerts defined:

| Alert             | Condition                               | Severity |
| ----------------- | --------------------------------------- | -------- |
| `ServerDown`      | API metrics endpoint unreachable for 1m | critical |
| `HighErrorRate`   | 5xx rate exceeds 10% of traffic for 2m  | critical |
| `HighLatency`     | p95 latency exceeds 2s for 5m           | warning  |
| `HighMemoryUsage` | Node.js heap usage above 95% for 5m     | warning  |

> There's no contact points predefined, it has to be added manually.
