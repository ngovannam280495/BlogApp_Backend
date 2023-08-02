const http = require('http');
const express = require('express');
const userRouter = require('./routes/users/userRouter');
const connectMongoDB = require('./database/connectMongo');

// !Server
const app = express();

connectMongoDB();

app.use(express.json());

app.use('/api/v1/users', userRouter);

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;
server.listen(PORT, console.log(`Server is listening on port: ${PORT}`));
