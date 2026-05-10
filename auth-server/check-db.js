const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campushub');
  const collection = mongoose.connection.collection('gigs');
  const docs = await collection.find({}).limit(5).toArray();
  console.log(JSON.stringify(docs, null, 2));
  await mongoose.disconnect();
}

check();
