create hashed password

cd "C:\Users\HP\Desktop\Projects\pharmacy_automation\pharmacyautomation\BackEnd"

node -e "import('bcrypt').then(async ({default:bcrypt}) => console.log(await bcrypt.hash('YourStrongPassword123!', 10)))"

## Initialize Neon

With `NEON_URL` set in `.env`, initialize the schema and seed the sample medicines:

```powershell
npm run db:init
```

It creates the required tables if they do not exist and upserts the sample
medicines without dropping the medicines table.

To load the ten-product catalogue supplied for Neon:

```powershell
npm run db:catalog
```

For Vercel, set the project root directory to `BackEnd`. The deployment uses
`api/index.js` as the serverless function entrypoint; local development still
uses `node src/server.js`.

## Testing a Vercel deployment

After deploying, check the function and request logs with:

```powershell
$url = "https://YOUR-PROJECT.vercel.app"
Invoke-WebRequest "$url/health"
Invoke-WebRequest "$url/api/health"
```

The `/health` endpoint should return JSON with `"status": "ok"`. Each request
also returns an `x-request-id` response header. Use that ID to find the
matching `[vercel]`, `[request:start]`, `[request:end]`, or `[request:error]`
entry in Vercel's **Deployments -> Functions -> Logs** view.

If the deployment reports that no function exists, verify that the Vercel
project's **Root Directory** is `BackEnd` and redeploy. The function file must
be deployed at `BackEnd/api/index.js`.