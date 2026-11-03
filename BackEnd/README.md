create hashed password

cd "C:\Users\HP\Desktop\Projects\pharmacy_automation\pharmacyautomation\BackEnd"

node -e "import('bcrypt').then(async ({default:bcrypt}) => console.log(await bcrypt.hash('YourStrongPassword123!', 10)))"