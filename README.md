# Commissions

A commission manager for digital artists. My third project, built while going through Full Stack Open.

Most artists I know take commissions through Discord or Instagram DMs and keep track of them in notes, screenshots and their own memory. This app gives an artist one public page with their prices, a proper request form for clients, and a board that shows where every commission stands.

## What it does

**For the artist**

- A public page at `/your-handle` with portfolio images, commission types, starting prices and turnaround times
- A switch to open or close commissions
- A board with every request: Requested, Quoted, Awaiting payment, In progress, Sketch review, Delivered
- A page per request with the client's brief and reference images, a quote form, payment tracking and a history
- Payments are written down by hand (deposit or final, paid or not). The app does not move money

**For the client**

- No account needed
- A request form: description, personal or commercial use, optional deadline, up to 5 reference images
- A private link to follow the request, with a timeline
- Approve or decline the artist's quote from that page
- An email on every status change

## Stack

- Next.js 16 (App Router) and TypeScript
- PostgreSQL with Prisma 7
- Better Auth for artist accounts (email and password, sessions stored in Postgres)
- Tailwind CSS 4
- Cloudinary for images, Resend for email
- Vitest for tests

## Running it locally

You need Node 24 and Docker.

```bash
git clone <this repo>
cd digitalSaas
npm install
cp .env.example .env
```

Open `.env` and set `BETTER_AUTH_SECRET` to a long random string (`openssl rand -base64 32` makes one). The rest can stay as it is for local work.

```bash
docker compose up -d      # Postgres on port 5433
npm run db:migrate        # create the tables
npm run dev               # http://localhost:3000
```

Without Cloudinary keys, uploaded images are saved to a local `.uploads` folder. Without a Resend key, emails are printed in the terminal instead of being sent, which is handy because you can click the links in them.

## Tests

```bash
npm test
```

The tests use a second database (`commissions_test`) in the same Docker container and wipe it between tests. They refuse to run against a database whose name does not end in `_test`.

Other checks:

```bash
npm run lint
npm run typecheck
```

## How artists are kept apart

This was the part I cared most about getting right. Every artist is a tenant and nobody should ever see another artist's requests. There are three layers:

1. **Every table has an `artistId` column**, including child tables like files and payments.
2. **`tenantDb(artistId)`** in `src/lib/tenant.ts` wraps the database client and adds the artist id to every read and write. Pages and actions are not allowed to import the raw client at all, a lint rule reports an error if they try.
3. **Composite foreign keys.** A file or payment points at its request with both `requestId` and `artistId`, so the database itself rejects a row that mixes two artists, even if my code has a bug.

`tests/tenant.test.ts` is the proof. Some of those tests go around the helper on purpose to check that the database says no on its own.

## Other things worth knowing

- **Private client links.** The token in `/r/<token>` is computed from the request id and the server secret, and only a hash of it is stored. A leaked database is not enough to open anyone's request. The downside: changing `BETTER_AUTH_SECRET` breaks every existing link.
- **Uploads.** The file name and type sent by the browser are ignored. `src/lib/image-info.ts` reads the first bytes of the file to check it really is a JPEG, PNG or WebP. SVG is refused because it can contain scripts. The limit is 4 MB per image.
- **Status changes.** The allowed moves are one table in `src/lib/status.ts`. Each change is a single query that only works if the request is still in the status the page showed, so two clicks at the same time cannot both win.
- **Money** is stored in minor units (cents) as integers, never as floats.
- **Rate limiting** is done in Postgres (`src/lib/rate-limit.ts`) so it works on serverless hosting.

## Deploying (free tiers)

The project is set up for Vercel, Neon, Cloudinary and Resend.

1. **Neon**: create a project. Copy the pooled connection string to `DATABASE_URL` and the direct one to `DIRECT_URL`.
2. **Cloudinary**: copy the cloud name, API key and API secret.
3. **Resend**: create an API key. To send to real clients you have to verify a domain you own, then set `EMAIL_FROM` to an address on it. Without a domain Resend only delivers to your own address.
4. **Vercel**: import the repo and add every variable from `.env.example`. Set `BETTER_AUTH_URL` to the site's real address and use a new `BETTER_AUTH_SECRET`, not the local one.

Vercel runs the `vercel-build` script, which applies the migrations and then builds.

Vercel's free plan is for non-commercial projects, so this setup is fine for a portfolio piece but not for charging artists.

## Not built yet

- Real payments. The `payments` table already has `provider` and `providerRef` columns for when I add a payment provider. Stripe is not simple to get from Morocco, which is why v1 tracks payments by hand
- Revision rounds with a limit
- Watermarked previews and sharing sketches inside the app
- Contract acceptance
- Password reset, and making email verification required
- Drag and drop on the board (it uses a "move to" control for now)
- Stats, Discord webhooks

## What I learned

- Putting the security rule in one place (the tenant helper) and then making it hard to go around it beats remembering to add a `where` everywhere.
- Server actions are public endpoints. Every one of them starts by checking who is calling, even when the page that renders the form already did.
- A page showing a button does not mean the server should trust the click. The quote approval sends the price the client was looking at, and the server refuses if it changed.
- Having tests for the scary parts (tenants, uploads, status changes) made me a lot less nervous about changing things later.
