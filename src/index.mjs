import express from 'express';
import mongoose from 'mongoose';
import route from './routes/route.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express()

app.use(express.json())

mongoose
    .connect(process.env.DB, { useNewUrlParser: true })
    .then(() => console.log('MongoDb is connected'))
    .catch(err => console.log(err))

app.use('/', route);

app.use((req, res) => {
    res.status(400).send({ status: false, message: 'invalid URL' })
});

app.listen(process.env.PORT, () => {
    console.log(`Express app running on port ${process.env.PORT}`)
});