# Supabase CMS

This project is a small CMS built with React, Vite, Supabase Auth, and Supabase Postgres.

## Structure

```text
financialservice/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Dashboard.jsx
|   |   |   `-- Login.jsx
|   |   |-- admin.jsx
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- styles.css
|   |   `-- supabase.js
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- package.json
`-- vercel.json
```

There is no required custom backend in this repo. The app talks directly to Supabase.

## Environment Variables

Create `client/.env` from `client/.env.example`:

```env
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_anon_key>
VITE_LOGIN_LOOKUP_TABLES=users
```

`VITE_LOGIN_LOOKUP_TABLES` is optional. It controls which tables are checked for `username -> email` lookup before signing in with Supabase Auth.

## Supabase Setup

### 1. Authentication

In Supabase:

1. Create a project.
2. Go to `Authentication`.
3. Enable `Email/Password` sign-in.
4. Create an admin user in Supabase Auth with an email and password.

### 2. Database Tables, Storage, and RLS

Run the full schema in `supabase/cms_schema.sql` from the Supabase SQL editor. It creates the tables, triggers, row-level security policies, seed pages, and the `site-assets` Storage bucket used for uploaded images and documents.

Required tables:

- `site_settings`: global site name, logo URL, and footer CTA text.
- `cms_pages`: managed landing pages, SEO fields, hero text, hero image URL, publish state, and nav order.
- `cms_sections`: editable page sections such as content blocks, cards, CTAs, FAQs, and lists.
- `cms_section_items`: cards/list rows/resources/services inside a section.
- `users`: CMS user profile and role mapping for Supabase Auth users.
- `media_assets`: optional metadata index for files uploaded to Supabase Storage.
- `contact_leads`: contact form/new lead records.
- `assessment_submissions`: free assessment answers and generated/reviewed results.
- `consultations`: requested or scheduled consultations.
- `team_applications`: recruitment form/application records.
- `advisor_profiles`: public advisor/team profile content.

Images and uploaded files are stored in the Supabase Storage bucket named `site-assets`. Database records store text URLs such as `logo_url`, `hero_image_url`, `image_url`, `headshot_url`, and `resume_url`; the binary file itself is not stored in Postgres.

The `users.email` value must match a real user in Supabase Auth.

## Local Development

Install dependencies:

```bash
npm run install:client
```

Run the app:

```bash
npm run dev:client
```

Open `http://localhost:5173`.

## CMS Behavior

- `/` renders the landing page from `cms_pages`, `cms_sections`, and `cms_section_items`.
- `/admin` shows the login form for logged-out users.
- `/admin` accepts either a username or an email.
- Authenticated CMS users can update site settings, page content, sections, section items, and image URLs.
- Image uploads are saved to the `site-assets` Supabase Storage bucket.

## Vercel Deployment

Recommended Vercel settings:

- `Root Directory`: `client`
- `Build Command`: `npm run build`
- `Output Directory`: `dist`

Environment variables required in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_LOGIN_LOOKUP_TABLES` (optional)
