const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', MONGODB_URI ? 'Found (hidden for security)' : 'NOT FOUND');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
})
    .then(() => {
        console.log('✅ Successfully connected to MongoDB!');
        mongoose.connection.close();
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('\nPossible solutions:');
        console.error('1. Check if your IP address is whitelisted in MongoDB Atlas');
        console.error('2. Verify your MongoDB connection string is correct');
        console.error('3. Ensure your MongoDB cluster is running');
        console.error('4. Check if special characters in password are URL-encoded');
        process.exit(1);
    });
