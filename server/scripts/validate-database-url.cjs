const REQUIRED_SCHEMA = 'kadima_salud'
const value = process.env.DATABASE_URL

if (!value) {
  console.error('DATABASE_URL is required.')
  process.exit(1)
}

let url
try {
  url = new URL(value)
} catch {
  console.error('DATABASE_URL is not a valid PostgreSQL URL.')
  process.exit(1)
}

const schema = url.searchParams.get('schema')

if (schema !== REQUIRED_SCHEMA) {
  console.error(`Refusing to deploy: DATABASE_URL must include ?schema=${REQUIRED_SCHEMA} to isolate this site in the shared database.`)
  process.exit(1)
}

console.log(`DATABASE_URL schema guard OK: ${REQUIRED_SCHEMA}`)
