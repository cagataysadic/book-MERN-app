const express = require('express')
const dotenv = require('dotenv').config()
const path = require('path')
const cors = require('cors')
const mongoose = require('mongoose')
const port = process.env.PORT || 10000;

const app = express();

app.use(express.static(path.join(__dirname, 'client/build')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/user", require('./routes/userRoutes'))
app.use("/api/books", require('./routes/bookRoutes'))

try {
    mongoose.connect(process.env.MONGO_URI)
    console.log("connected to the mongo database")
} catch (error) {
    console.log(error)
}


app.listen(port, () => console.log(`Server is running on ${port}`))