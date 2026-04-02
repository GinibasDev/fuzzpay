const { MongoClient } = require('mongodb');

// Extracted from .env
const uri = "mongodb+srv://otpbuy:iIEGOKoRP0bH2pju@cluster0.1x4hyed.mongodb.net/?retryWrites=true&w=majority";

async function setupIndexes() {
  if (!uri) throw new Error('DATABASE_URL missing');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to database');

    // Merchant indexes
    console.log('Ensuring Merchant indexes...');
    await db.collection('Merchant').createIndex({ telegramChatId: 1 });
    await db.collection('Merchant').createIndex({ mchId: 1 }, { unique: true });
    
    // User indexes
    console.log('Ensuring User indexes...');
    await db.collection('User').createIndex({ merchantId: 1 });
    await db.collection('User').createIndex({ email: 1 }, { unique: true });
    
    // Wallet indexes
    console.log('Ensuring Wallet indexes...');
    await db.collection('Wallet').createIndex({ merchantId: 1 }, { unique: true });
    
    // Transaction indexes
    console.log('Ensuring Transaction indexes...');
    await db.collection('Transaction').createIndex({ merchantId: 1 });
    await db.collection('Transaction').createIndex({ orderNumber: 1 });
    await db.collection('Transaction').createIndex({ createdAt: 1 });
    await db.collection('Transaction').createIndex({ merchantId: 1, type: 1, orderNumber: 1 });
    
    // WalletLog indexes
    console.log('Ensuring WalletLog indexes...');
    await db.collection('WalletLog').createIndex({ merchantId: 1 });
    await db.collection('WalletLog').createIndex({ createdAt: 1 });

    console.log('All indexes created/verified successfully!');
  } catch (e) {
    console.error('Error during index creation:', e);
  } finally {
    await client.close();
  }
}

setupIndexes();
