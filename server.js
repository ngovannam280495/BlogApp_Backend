const http = require('http');
const express = require('express');
const userRouter = require('./routes/users/userRouter');
const connectMongoDB = require('./database/connectMongo');
const { notFoundRouter, handlerGlobalError } = require('./middlewares/handlerError');
const categoryRounter = require('./routes/categories/categoryRouter');

// !Server
const app = express();

connectMongoDB();

app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRounter);
// ? Middleware for not found router
app.use(notFoundRouter);
// MiddleWare Error Handler Global

app.use(handlerGlobalError);

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;
server.listen(PORT, console.log(`Server is listening on port: ${PORT}`));
