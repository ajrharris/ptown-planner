# Provincetown Trip Planner

A shared availability picker for planning a group trip to Provincetown. Everyone enters their name and marks which weekends (Fri–Mon) they're free between May–October 2026. The app highlights the best overlapping weekends.

Built with [Cloudflare Workers](https://developers.cloudflare.com/workers/) and [D1](https://developers.cloudflare.com/d1/) (SQLite).

## Deploy

Prerequisites: [Node.js](https://nodejs.org/) and a [Cloudflare account](https://dash.cloudflare.com/sign-up).

```bash
# Install dependencies
npm install

# Authenticate with Cloudflare (if you haven't already)
npx wrangler login

# Create the D1 database
npx wrangler d1 create ptown-planner-db
```

Copy the `database_id` from the output and paste it into `wrangler.toml`, replacing `REPLACE_WITH_YOUR_DATABASE_ID`.

```bash
# Run the schema migration on the remote database
npx wrangler d1 execute ptown-planner-db --remote --file=schema.sql

# Deploy
npx wrangler deploy
```

Wrangler will print the live URL (e.g. `https://ptown-planner.<your-subdomain>.workers.dev`). Share it with your friends.

## Local development

```bash
# Create the local D1 database
npx wrangler d1 execute ptown-planner-db --local --file=schema.sql

# Start the dev server
npx wrangler dev
```

## Project structure

```
src/index.js        Worker entry point — serves HTML and handles API routes
public/index.html   Frontend (single-page app, no build step)
schema.sql          D1 database migration
wrangler.toml       Cloudflare Workers configuration
```
