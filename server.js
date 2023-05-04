<<<<<<< HEAD
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.PORT || 8000;

const app = express();

app.use(express.static(path.join(__dirname, 'client/build')));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/user", require('./routes/userRoutes'))
app.use("/api/book", require('./routes/bookRoutes'))
app.use("/api/post", require('./routes/postRoutes'))

try {
    mongoose.connect(process.env.MONGO_URI)
    console.log("connected to the mongo database")
} catch (error) {
    console.log(error)
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

=======
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.PORT || 8000;

const app = express();

app.use(express.static(path.join(__dirname, 'client/build')));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/user", require('./routes/userRoutes'))
app.use("/api/book", require('./routes/bookRoutes'))
app.use("/api/post", require('./routes/postRoutes'))

try {
    mongoose.connect(process.env.MONGO_URI)
    console.log("connected to the mongo database")
} catch (error) {
    console.log(error)
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

>>>>>>> 3c9c8559219fcf8de0995568f6b3d7dc8131dfa1
app.listen(port, () => console.log(`Server is running on port ${port}`))