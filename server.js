const http = require('http');
const express = require('express');
const connectMongoDB = require('./database/connectMongo');
const { notFoundRouter, handlerGlobalError } = require('./middlewares/handlerError');
const userRouter = require('./routes/users/userRouter');
const categoryRounter = require('./routes/categories/categoryRouter');
const postRouter = require('./routes/posts/postsRouter');
const commentsRouter = require('./routes/comments/commentsRouter');

// !Server
const app = express();

connectMongoDB();

app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRounter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/comments', commentsRouter);
// ? Middleware for not found router
app.use(notFoundRouter);
// MiddleWare Error Handler Global

app.use(handlerGlobalError);

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;
server.listen(PORT, console.log(`Server is listening on port: ${PORT}`));
