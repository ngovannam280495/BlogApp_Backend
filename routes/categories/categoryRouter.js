const express = require('express');
const { createCategory, deleteCategory, updateCategory } = require('../../controller/categories/categoriesController');
const authUserLogin = require('../../middlewares/AuthUserLogin');
const categoryRounter = express.Router();

categoryRounter.post('/', authUserLogin, createCategory);
categoryRounter.delete('/:id', authUserLogin, deleteCategory);
categoryRounter.patch('/:id', authUserLogin, updateCategory);
module.exports = categoryRounter;
