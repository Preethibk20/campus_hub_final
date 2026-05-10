const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const users = await User.find({}, { email: 1 });
        console.log("Users in database:", users);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

check();
