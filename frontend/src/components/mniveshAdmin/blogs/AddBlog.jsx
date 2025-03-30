import React, { useState } from "react";
import BackButton from "../../common/BackButton";

function AddBlog() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    image: null,
    content: "",
    metaTitle: "",
    metaKeyword: "",
    metaUrl: "",
    metaDescription: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle blog creation via API
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6">Create New Blog</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
            placeholder="Enter blog title"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block font-medium mb-1">Content:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full border p-2 rounded-md h-32"
            placeholder="Write your blog content here..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium mb-1">Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* Author & Post Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Author:</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
              placeholder="Author Name"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Post Date:</label>
            <input
              type="date"
              name="postDate"
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        {/* Meta Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Meta Title:</label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Meta Keyword:</label>
            <input
              type="text"
              name="metaKeyword"
              value={formData.metaKeyword}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Meta URL:</label>
          <input
            type="text"
            name="metaUrl"
            value={formData.metaUrl}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Meta Description:</label>
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleChange}
            className="w-full border p-2 rounded-md h-20"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Blog
        </button>
      </form>
    </div>
  );
}

export default AddBlog;
