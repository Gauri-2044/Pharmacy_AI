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