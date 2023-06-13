//mongodb+srv://<username>:<password>@devconnector.ekky8.mongodb.net/?retryWrites=true&w=majority

// this is where we do the mongodb connection

const mongoose = require('mongoose');

const config = require('config');
const dotenv = require("dotenv");

dotenv.config();

// const db = config.get('mongoURI');
const db = process.env.mongoURI;

console.log(db, '15 line')


const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            dbName: 'MERN',
            useUnifiedTopology: true
        });
        console.log('Mongo DB connected');
    } catch (e) {
        console.log(e.message);
        process.exit(1); // we exit the process with a failure code 1;
    }
};

module.exports = connectDB;
