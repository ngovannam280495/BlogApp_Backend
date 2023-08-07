const Comment = require('../../model/Comment/Comment');
const Post = require('../../model/Post/Post');
const asyncHandler = require('express-async-handler');

// ! Create a new comment
exports.createComment = asyncHandler(async (req, res) => {
  // Define the user post comment
  const userComment = req?.userLogin;
  if (!userComment) {
    throw new Error('You must login to comment');
  }
  const idUserComment = userComment._id;
  const nameUserComment = userComment.userName;
  // define the post
  const postID = req?.params.postID;
  const post = await Post.findById(postID);
  // create comment
  const { message } = req?.body;
  const newComment = await Comment.create({
    message: message,
    author: {
      id: idUserComment,
      authorName: nameUserComment,
    },
    postId: postID,
  });
  // Update comment in Post
  await Post.findByIdAndUpdate(postID, { $push: { comments: newComment._id } }, { new: true, upsert: true });
  res.status(201).json({
    status: 'published',
    message: 'Created comment successfully',
    comment: newComment,
    inforPost: post,
  });
});

// ! Fetch a comment
exports.fetchComment = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const comment = await Comment.findById(id);
  if (!comment) throw new Error(`Comment is not found`);
  res.json({
    status: 'success',
    comment: comment,
  });
});

// ! Fetch all comments of a post

exports.fetchAllCommentsOfPost = asyncHandler(async (req, res) => {
  const postID = req?.params?.postID;
  const checkPost = await Post.findById(postID).populate('comments');
  if (!checkPost) throw new Error('Post is not exist');
  const comments = checkPost.comments;
  res.status(200).json({
    status: 'success',
    message: 'Comment fetched successfully',
    comments: comments,
  });
});

// ! Update comment
exports.updateComment = asyncHandler(async (req, res) => {
  const userLogin = req.userLogin._id;
  const idComment = req?.params.id;
  const comment = await Comment.findById(idComment);
  const idAuthorOfComment = comment.author.id;
  // Check quyền sở hữu comment
  if (userLogin.toString() !== idAuthorOfComment.toString()) throw new Error('You cannot update this comment');
  // Update
  const { message } = req?.body;
  await Comment.findByIdAndUpdate(
    idComment,
    {
      message,
    },
    { new: true, upsert: true },
  );
  res.status(202).json({
    status: 'success',
    message: 'Comment updated successfully',
  });
});

// ! Delete comment

exports.deleteComment = asyncHandler(async (req, res) => {
  const userLogin = req?.userLogin;
  const postsOfUserLogin = userLogin.posts;
  const idComment = req?.params.id;
  const comment = await Comment.findById(idComment);
  const idAuthorOfComment = comment.author.id;
  const postIDOfComment = comment.postId;
  // Verify auth to delete comment
  const postCheck = postsOfUserLogin.find((post) => {
    const midPostCheck = post.toString();
    const midPostIdofComment = postIDOfComment.toString();
    return midPostCheck.includes(midPostIdofComment);
  });
  if (!postCheck && userLogin._id !== idAuthorOfComment) throw new Error('You cannot delete this comment');
  // Update:
  await Comment.findByIdAndDelete(idComment);
  await Post.findByIdAndUpdate(
    postIDOfComment,
    {
      $pull: { comments: idComment },
    },
    {
      new: true,
      upsert: true,
    },
  );
  res.status(200).json({
    status: 'success',
    message: 'Comment deleted successfully',
  });
});
