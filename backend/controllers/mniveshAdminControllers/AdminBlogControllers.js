const Blog = require("../../models/Blogs");

async function NewBlogCreate(req, res) {
  try {
    const {
      title,
      content,
      image,
      author,
      post_date,
      metaTitle,
      metaKeyword,
      metaUrl,
      metaDescription
    } = req.body;
    const lastBlog = await Blog.findOne({}).sort({ id: -1 }).exec();
    const newId = lastBlog ? lastBlog.id + 1 : 1;

    const slug = title.toLowerCase().replace(/\s+/g, '-');
    const status = 1;
    const newBlog = new Blog({
      id:newId,
      title,
      content,
      image,
      slug,
      author,
      status,
      post_date,
      metaTitle,
      metaKeyword,
      metaUrl,
      metaDescription
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: newBlog,
    });
  } catch (error) {
    console.error('Error creating blog:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message,
    });
  }
}

async function UpdateBlog(req, res) {
  try {
    const {
      title,
      content,
      image,
      author,
      post_date,
      metaTitle,
      metaKeyword,
      metaUrl,
      metaDescription
    } = req.body;

    const slug = title.toLowerCase().replace(/\s+/g, '-');
    
    const updatedData = {
      title,
      content,
      image,
      slug,
      author,
      status: 1,
      post_date,
      metaTitle,
      metaKeyword,
      metaUrl,
      metaDescription
    };

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },           // Filter: find blog with the matching slug
      updatedData,        // Update: new data for the blog
      { new: true }       // Options: return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  } catch (error) {
    console.error('Error updating blog:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message,
    });
  }
}

async function DeleteBlog(req, res) {
  try {
    const { title } = req.body;

    const slug = title.toLowerCase().replace(/\s+/g, '-');
    
    const updatedData = {
      deleted_at: new Date()
    };

    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },           // Filter: find blog with the matching slug
      updatedData,        // Update: new data for the blog
      { new: true }       // Options: return the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
      data: updatedBlog,
    });
  } catch (error) {
    console.error('Error deleting blog:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message,
    });
  }
}


async function GetBlogsSearch(req, res) {
  try {
    const searchQuery = req.query.q || "";
    
    const regex = new RegExp(searchQuery, "i");
    
    const blogs = await Blog.find({
      title: regex,
      deleted_at: "NULL"
    });
    
    res.status(200).send({
      success: true,
      message: 'Blogs retrieved successfully',
      data: blogs,
    });
  } catch (error) {
    console.error('Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve blogs',
      error: error.message,
    });
  }
}

module.exports = {NewBlogCreate, GetBlogsSearch, UpdateBlog, DeleteBlog}