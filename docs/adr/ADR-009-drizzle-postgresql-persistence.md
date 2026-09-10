# ADR-009: Drizzle ORM for TuCarton PostgreSQL Persistence

## Status

Accepted by Senior Developer direction on 2026-09-09.

## Decision

Use Drizzle ORM with the PostgreSQL driver and Drizzle Kit migrations for TuCarton server persistence.

## Consequences

- Schema and migrations remain TypeScript and SQL-oriented.
- The API owns database access; Expo never connects directly to PostgreSQL.
- Authentication work may create the local user and audit schema through versioned migrations.
- The database implementation must preserve future append-only ledger requirements; no mutable ledger balance is introduced by this authentication work item.
