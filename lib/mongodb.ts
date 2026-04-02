import { MongoClient, Db } from 'mongodb'

const uri = process.env.DATABASE_URL as string
const options = {}

let cachedClient: MongoClient | null = (global as any).mongoClient || null
let cachedDb: Db | null = (global as any).mongoDb || null

if (!uri) {
  throw new Error('Please add your Mongo URI to .env')
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri, options)
  await client.connect()
  const db = client.db()

  if (process.env.NODE_ENV === 'development') {
    ;(global as any).mongoClient = client
    ;(global as any).mongoDb = db
  }

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export default connectToDatabase
