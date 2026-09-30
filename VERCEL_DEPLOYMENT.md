# Deploy GIKLASS to Vercel

## Configure the project

1. Push the repository to GitHub and import it in Vercel.
2. Set **Root Directory** to `GIKLASS`, the inner folder containing this file, `package.json`, and `vercel.json`.
3. Select the Express framework preset. Keep the install command as `npm install --include=optional`, the build command as `npm run build`, and leave **Output Directory** unset; Vite writes static files to `public` for Vercel to serve.
4. Add these environment variables for Production (and Preview if needed):

   - `TURSO_DATABASE_URL`: the URL of your Turso database.
   - `TURSO_AUTH_TOKEN`: an auth token for that database.
   - `JWT_SECRET`: a long, random secret used to sign login cookies.
   - `GEMINI_API_KEY`: only needed if you enable Gemini API calls.

5. Deploy. Vercel will build the frontend and deploy `/api/*` as a serverless function.

The local `giklass.db` file is not persistent storage on Vercel. Configure both Turso variables before deploying so production data is stored in Turso.

## Deploy from the terminal

Run these commands from the inner `GIKLASS` folder:

```powershell
npx vercel
npx vercel --prod
```