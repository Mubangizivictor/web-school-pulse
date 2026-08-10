# School Pulse Public Website

Official public website for School Pulse, a Victorbee Technologies product.

## Public URLs

- Website: https://schoolpulse.victorbee.com
- School Pulse app: https://app.schoolpulse.victorbee.com

## Stack

- Astro static export
- GitHub Pages
- Firebase Cloud Functions for protected public submissions and checkout backend
- Yo! Payments adapter point prepared; production payment initiation remains disabled until provider credentials and callback verification are configured

## Local development

```bash
npm install
npm run dev
npm run build
```

## Firebase Functions

```bash
cd functions
npm install
npm run build
```

Never place Yo! Payments API credentials in the public website repository or frontend environment variables. Use Firebase Functions secrets/backend configuration.

## Deployment

Pushes to `main` are configured to build and deploy the static `dist` output through GitHub Pages. The repository contains `public/CNAME` for `schoolpulse.victorbee.com`.

## Remaining production configuration

1. Add public Firebase project values to the build environment.
2. Deploy the public form and checkout Cloud Functions.
3. Configure the frontend `PUBLIC_API_BASE_URL` and connect form fetch calls to deployed functions.
4. Add Yo! Payments credentials only to secure backend secrets.
5. Implement and verify Yo! Payments callback/webhook signature validation according to the official API documentation.
6. Replace dashboard placeholders with real School Pulse screenshots.
7. Complete final legal review of Privacy Policy and Terms.
8. Configure DNS CNAME for `schoolpulse.victorbee.com` to the GitHub Pages hostname.
