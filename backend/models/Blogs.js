// mniveshBlog.js
const mongoose = require('mongoose');
const blogSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  slug: { type: String, required: true },
  author: { type: String, required: true },
  status: { type: Number, required: true },
  post_date: { type: Date, required: true },
  deleted_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now, required: true },
  updated_at: { type: Date, default: Date.now },
  metaTitle: { type: String },
  metaKeyword: { type: String },
  metaUrl: { type: String },
  metaDescription: { type: String },
});

// Import your mnivesh DB connection
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const Blogs = mniveshDbConnection.model('Blog', blogSchema);

module.exports = Blogs;
