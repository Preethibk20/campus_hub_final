const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.collection('users');
  const docs = await collection.find({}).project({ email: 1, name: 1, password: 1, isVerified: 1 }).toArray();
  for (const doc of docs) {
    console.log(`ID: ${doc._id}, Email: ${doc.email}, Name: ${doc.name}, Verified: ${doc.isVerified}, Password prefix: ${doc.password ? doc.password.substring(0, 10) : 'NULL'}`);
  }
  await mongoose.disconnect();
}

check();
