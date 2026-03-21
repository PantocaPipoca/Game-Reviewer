# Repository Info

Each `*Repository.ts` file contains all the queries for its corresponding table. Types are in `../types/Types.ts`.

Most function names use the following prefixes:

- **Select** — takes primary key, returns the matching entry or `null`
- **Insert** — takes all manually-set fields, returns the created entry
- **Update** — takes all fields, updates the matching entry, returns the updated entry
- **Delete** — takes primary key, returns the deleted entry
