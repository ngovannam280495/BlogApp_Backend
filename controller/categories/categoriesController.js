const asyncHandler = require('express-async-handler');
const Category = require('../../model/Category/Category');

// ! Create a new category

exports.createCategory = asyncHandler(async (req, res) => {
  // Defined user post content
  const userLogin = req?.userLogin;
  const userNameLogin = userLogin ? userLogin.userName : 'anonymous';
  const idUserLogin = userLogin?._id;
  // Create a new category
  const { name } = req?.body;
  // ? Check name is existing
  const nameCategoryExists = await Category.findOne({ name: name });
  if (nameCategoryExists) {
    throw new Error(`Category ${name} already exists`);
  }
  const newCategory = await Category.create({
    name: name,
    author: {
      id: idUserLogin,
      authorName: userNameLogin,
    },
  });
  // Response
  res.status(201).json({
    status: 'success',
    message: 'Created category successfully',
    category: newCategory,
  });
});

// ! Delete category
exports.deleteCategory = asyncHandler(async (req, res) => {
  const idRequestDelete = req?.params.id;
  const category = await Category.findById(idRequestDelete);
  const categoryName = category.name;
  const message = `Category ${categoryName} deleted successfully`;
  await Category.findByIdAndDelete(idRequestDelete);
  res.status(202).json({
    status: 'deleted successfuly',
    message: message,
  });
});

// ! Update category
exports.updateCategory = asyncHandler(async (req, res) => {
  const idRequestUpdate = req?.params.id;
  const { nameUpdate } = req?.body;
  const categoryUpdate = await Category.findById(idRequestUpdate);
  const categoryNameUpdate = categoryUpdate.name;
  const message = `${categoryNameUpdate} has changed to ${nameUpdate} successfully`;
  await Category.findByIdAndUpdate(idRequestUpdate, { name: nameUpdate }, { new: true, upsert: true });
  res.status(202).json({
    status: 'Updated',
    message: message,
  });
});

// ! Fectch All Categories

exports.fetchAllCategories = asyncHandler(async (req, res) => {
  // Fectch all categories
  const allCategories = await Category.find({});
  const allCategoryNames = allCategories.map((category) => category.name);
  // Response
  res.status(200).json({
    status: 'success',
    message: 'Getting all categories successfully',
    data: allCategoryNames,
  });
});

// ! Fectch One Category

exports.fetchCategory = asyncHandler(async (req, res) => {
  const idFetch = req?.params.id;
  const category = await Category.findById(idFetch);
  res.status(200).json({
    status: 'success',
    message: 'Getting category successfully',
    category: category,
  });
});
