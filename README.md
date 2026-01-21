# SeedSIM Studio

SeedSIM Studio is a Next.js application that will serve as the cockpit for the
SeedSIM platform. This repository contains a minimal scaffold to verify
application wiring, including a landing page and a stub API route. Later
versions will incorporate a full UI and integration with Notion for embedding.

## Project Structure

This project uses the App Router introduced in Next.js 13+. Key files include:

- `app/layout.tsx` – The root layout that defines the HTML structure for all pages.
- `app/page.tsx` – The home page displayed at `/`.
- `app/api/seedsim/parse/route.ts` – A stubbed API endpoint at `/api/seedsim/parse`.
- `next.config.js` – Global Next.js configuration.
- `tsconfig.json` – TypeScript configuration.
- `.env.local.example` – Example environment variables (copy to `.env.local`).

## Setting up locally

1. **Install dependencies**

   Ensure you have Node.js ≥18 installed. Then run:

   ```sh
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.local.example` to `.env.local` and set `OPENAI_API_KEY` to your
   OpenAI API key. **Do not commit** `.env.local` to version control.

3. **Run the development server**

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser. You
   should see a page titled “SeedSIM Studio”.

4. **Test the API route**

   Send a POST request to `/api/seedsim/parse` (e.g. using `curl` or Postman):

   ```sh
   curl -X POST http://localhost:3000/api/seedsim/parse \
     -H 'Content-Type: application/json' \
     -d '{"input": "test"}'
   ```

   You should receive the stubbed JSON response:

   ```json
   {
     "patch": [],
     "assumptions": [],
     "warnings": [],
     "scenarioNameSuggestion": ""
   }
   ```

## Deployment

Once the repository is connected to Vercel via GitHub, push your changes to
GitHub. Vercel will automatically detect the Next.js project and create a
deployment. Make sure to add your `OPENAI_API_KEY` as an environment variable
within Vercel’s dashboard (Project → Settings → Environment Variables) so that
the server-side API route can access it securely.

## License

This project is licensed under the MIT license. See [LICENSE](LICENSE) for more
information.