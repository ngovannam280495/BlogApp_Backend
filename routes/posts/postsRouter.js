const express = require('express');
const authUserLogin = require('../../middlewares/AuthUserLogin');
const { createPost, fetchAllPosts, fetchPost, deletePost, updatePost } = require('../../controller/posts/postsController');

const postRouter = express.Router();

postRouter.post('/', authUserLogin, createPost);
postRouter.get('/', authUserLogin, fetchAllPosts);
postRouter.get('/:id', authUserLogin, fetchPost);
postRouter.delete('/:id', authUserLogin, deletePost);
postRouter.patch('/:id', authUserLogin, updatePost);

module.exports = postRouter;
