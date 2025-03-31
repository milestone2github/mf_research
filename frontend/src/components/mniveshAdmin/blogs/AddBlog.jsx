import React, { useEffect, useRef, useState } from "react";
import BackButton from "../../common/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function AddBlog() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);

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

  // Fetch the blog details
  useEffect(() => {
    if (slug) {
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/mnivesh/admin/blogs/${slug}`)
        .then((res) => {
          const blog = res.data.data;
          setFormData({
            title: blog.title || '',
            author: blog.author || '',
            image: null,
            content: blog.content || '',
            postDate: blog.post_date ? blog.post_date.split('T')[0] : '',
            metaTitle: blog.metaTitle || '',
            metaKeyword: blog.metaKeyword || '',
            metaUrl: blog.metaUrl || '',
            metaDescription: blog.metaDescription || ''
          });
        })
        .catch((err) => console.error('Error fetching blog by slug:', err));
    }
  }, [slug])

  // Initiating quill text editor
  useEffect(() => {
    const modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline"],
        [{link: 'link'}],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }]
        // ["blockquote", "code-block"],
        // ["clean"],
      ],
    };
    quillRef.current = new Quill("#editor", {
      theme: "snow",
      modules: modules,
    });

    if (formData.content) {
      quillRef.current.root.innerHTML = formData.content;
    }
    quillRef.current.on("text-change", () => {
      setFormData((prev) => ({ ...prev, content: quillRef.current.root.innerHTML }));
    });
  }, []);

  // Update editor content if formData.content changes from BE
  useEffect(() => {
    if (quillRef.current && formData.content) {
      // Avoid unnecessary update if content same
      if (quillRef.current.root.innerHTML !== formData.content) {
        quillRef.current.root.innerHTML = formData.content;
      }
    }
  }, [formData.content]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      if (formData.image) formDataToSend.append('image', formData.image);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('postDate', formData.postDate);
      formDataToSend.append('metaTitle', formData.metaTitle);
      formDataToSend.append('metaKeyword', formData.metaKeyword);
      formDataToSend.append('metaUrl', formData.metaUrl);
      formDataToSend.append('metaDescription', formData.metaDescription);

      if (slug) {
        // Update existing blog with new data
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/mnivesh/admin/blogs/${slug}`, formDataToSend);
        alert('Blog updated successfully!');
      } else {
        // Create new Blog
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/mnivesh/admin/blogs`, formDataToSend);
        alert('Blog created successfully!');
      }

      navigate('../blogs'); // Navigate back to all blogs
    } catch (err) {
      console.error('Error submitting blog:', err);
      alert('Failed to save blog.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <BackButton />
      <h2 className="text-2xl font-bold mb-6">
        {slug ? 'Edit Blog' : 'Create New Blog'}
      </h2>

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
          <div id="editor" className="bg-white" />
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
              value={formData.postDate}
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
          {slug ? 'Update Blog' : 'Create Blog'}
        </button>
      </form>
    </div>
  );
}

export default AddBlog;
