const { MongoClient } = require('mongodb')
require('dotenv').config()

async function checkIndexes() {
  const uri = process.env.DATABASE_URL
  if (!uri) throw new Error('DATABASE_URL missing')
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()

  const collections = ['Merchant', 'User', 'Wallet', 'Transaction', 'WalletLog']
  for (const colName of collections) {
    const col = db.collection(colName)
    try {
      const indexes = await col.indexes()
      console.log(`Indexes for ${colName}:`, JSON.stringify(indexes, null, 2))
    } catch (e) {
      console.log(`Error getting indexes for ${colName}:`, e.message)
    }
  }

  await client.close()
}

checkIndexes().catch(console.error)
