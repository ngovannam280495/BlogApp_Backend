const { createComment, fetchComment, updateComment, deleteComment, fetchAllCommentsOfPost } = require('../../controller/comments/commentsController');
const authUserLogin = require('../../middlewares/AuthUserLogin');
const express = require('express');

const commentsRouter = express.Router();

commentsRouter.post('/:postID', authUserLogin, createComment);
commentsRouter.get('/:id', authUserLogin, fetchComment);
commentsRouter.get('/all/:postID', authUserLogin, fetchAllCommentsOfPost);
commentsRouter.patch('/:id', authUserLogin, updateComment);
commentsRouter.delete('/:id', authUserLogin, deleteComment);

module.exports = commentsRouter;
