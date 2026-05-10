const { MongoClient } = require('mongodb');

const uris = [
  process.env.MONGO_URI || 'mongodb://localhost:27017/campushub'
];

async function test() {
  for (const uri of uris) {
    console.log(`Testing URI: ${uri.substring(0, 50)}...`);
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      console.log('✅ Success!');
      const db = client.db('campushub');
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      await client.close();
      return uri;
    } catch (err) {
      console.error('❌ Failed:', err.message);
    }
  }
}

test();
