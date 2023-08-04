const asyncHandler = require('express-async-handler');
const Post = require('../../model/Post/Post');
const User = require('../../model/User/User');
const Category = require('../../model/Category/Category');

// ! create a new post

exports.createPost = asyncHandler(async (req, res) => {
  // Get author create post
  const userLogin = await req?.userLogin;
  const { id: idUserLogin, userName: authorName } = userLogin;
  // Title, content, category,
  const { title, category, content } = req?.body;
  const checkPost = await Post.findOne({ title: title });
  if (checkPost) throw new Error('Title is already exists, can you change the title');
  // ! Create post
  const newPost = await Post.create({
    title: title,
    content: content,
    category: category,
    author: {
      id: idUserLogin,
      authorName: authorName,
    },
  });
  // Update Category
  await Category.findOneAndUpdate(
    { name: category },
    {
      $push: { posts: newPost.id },
    },
    {
      new: true,
      upsert: true,
    },
  );
  // Update Post to User create
  await User.findByIdAndUpdate(
    idUserLogin,
    {
      $push: { posts: newPost.id },
    },
    {
      new: true,
      upsert: true,
    },
  );
  // * Response status
  res.status(201).json({
    status: 'success',
    message: 'Post created successfully',
    newPost: newPost,
  });
});

// ! fetch All Post

exports.fetchAllPosts = asyncHandler(async (req, res) => {
  const allPosts = await Post.find({});
  res.status(201).json({
    status: 'success',
    message: 'All posts were get successfully',
    data: allPosts,
  });
});

// ! fetch one post

exports.fetchPost = asyncHandler(async (req, res) => {
  const idPostFetching = req?.params.id;
  const post = await Post.findById(idPostFetching);
  if (!post) throw new Error('No post with id ' + idPostFetching);
  res.status(201).json({
    status: 'success',
    message: 'Get post successfully',
    data: post,
  });
});

// ! Delete a post

exports.deletePost = asyncHandler(async (req, res) => {
  const userLogin = req.userLogin;
  const ownerPostOfUserLogin = userLogin?.posts;
  const idDelete = req?.params.id;
  const checkPostOwner = ownerPostOfUserLogin.find((post) => {
    const idDeleteCheck = idDelete.toString();
    const checkPost = post.toString();
    return checkPost.includes(idDeleteCheck);
  });
  if (!checkPostOwner) throw new Error('The User Login dont have that post');
  //* Update post in User Login

  await User.findByIdAndUpdate(userLogin.id, {
    $pull: { posts: idDelete },
  });
  //* Update post in Category

  const postDelete = await Post.findById(idDelete);
  const categoryOfPost = postDelete.category;
  await Category.findOneAndUpdate(
    { name: categoryOfPost },
    {
      $pull: { posts: idDelete },
    },
  );
  // ! Delete post in Post

  await Post.findByIdAndDelete(idDelete);

  res.status(202).json({
    status: 'success',
    message: 'Delete post successfully',
  });
});

// ! Update a post

exports.updatePost = asyncHandler(async (req, res) => {
  const userLogin = req.userLogin;
  const idPostUpdate = req?.params.id;
  const beforeUpdatePost = await Post.findById(idPostUpdate);
  const beforeCategoryUpdate = beforeUpdatePost.category;
  const updatePost = req?.body;
  const postUpdateCategory = req?.body?.category;
  // * Check Auth to Update
  // ? Nếu User không sở hữu bài post không thể chỉnh sửa
  const postsUserLoginOwner = userLogin.posts;
  const checkPost = postsUserLoginOwner.find((post) => {
    const idCheck = idPostUpdate.toString();
    return post.toString().includes(idCheck);
  });
  if (!checkPost) throw new Error('You dont own this post ');
  // Update
  const postUpdate = await Post.findByIdAndUpdate(idPostUpdate, updatePost, {
    new: true,
    upsert: true,
  });
  // * Update Category list post
  if (postUpdateCategory && postUpdateCategory !== beforeCategoryUpdate) {
    await Category.findOneAndUpdate(
      { name: beforeCategoryUpdate },
      {
        $pull: { posts: beforeUpdatePost._id },
      },
      {
        new: true,
        upsert: true,
      },
    );
    await Category.findOneAndUpdate(
      { name: postUpdateCategory },
      {
        $push: { posts: beforeUpdatePost._id },
      },
      {
        new: true,
        upsert: true,
      },
    );
  }
  res.status(200).json({
    status: 'Success',
    message: 'Update post successfully',
    data: postUpdate,
  });
});
