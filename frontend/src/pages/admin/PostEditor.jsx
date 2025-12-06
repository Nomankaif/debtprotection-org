import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import axios from 'axios';
import RichTextEditor from '../../components/RichTextEditor';
import AdminLayout from '../../components/admin/AdminLayout';
import { PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = id !== undefined;

  const categories = [
    { key: 'debt_management', label: 'Debt Management' },
    { key: 'financial_planning', label: 'Financial Planning' },
    { key: 'credit_scores', label: 'Credit Scores' },
    { key: 'legal_advice', label: 'Legal Advice' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    tags: '',
    categories: [],
    status: 'Published'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        setIsFetching(true);
        try {
              const res = await axios.get(`/api/posts/${id}`);
              const post = res.data;

              // post.authorId may be populated (object) or an id string
              const postAuthorId = post.authorId && typeof post.authorId === 'object' ? (post.authorId._id || post.authorId.id) : post.authorId;

              if (postAuthorId?.toString() !== user.id?.toString() && user.role !== 'admin') {
                toast.error('You are not authorized to edit this post');
                navigate('/admin/posts');
                return;
              }

              setFormData(prev => ({
                ...prev,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                image: post.imageUrl || post.image || '',
                tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
                categories: post.categories || [],
                status: post.status || 'Draft'
              }));
        } catch (error) {
          console.error('Error fetching post:', error);
          toast.error('Failed to fetch post data');
          navigate('/admin/posts');
        } finally {
          setIsFetching(false);
        }
      };

      fetchPost();
    }
  }, [id, isEditing, user, navigate]);

  const handleCategoryChange = (categoryKey) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(categoryKey)
        ? prev.categories.filter(c => c !== categoryKey)
        : [...prev.categories, categoryKey];
      return { ...prev, categories: newCategories };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        image: response.data.imageUrl
      }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleUrlImageSubmit = async () => {
    if (!formData.image || !formData.image.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid image URL');
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('imageUrl', formData.image);

      const response = await axios.post('/api/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        image: response.data.imageUrl
      }));
      toast.success('Image uploaded successfully from URL!');
    } catch (error) {
      console.error('URL image upload error:', error);
      toast.error('Failed to upload image from URL. Please check the URL and try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      if (isEditing) {
        await axios.put(`/api/posts/${id}`, postData);
        toast.success('Post updated successfully!');
      } else {
        await axios.post('/api/posts', postData);
        toast.success('Post created successfully!');
      }

      navigate('/admin/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-600 border-r-purple-600 border-b-pink-600 border-l-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-panel py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="h-10 w-10 text-indigo-600" />
              <div>
                <h1 className="admin-heading text-4xl text-gray-900">
                  {isEditing ? 'Edit Your Post' : 'Create a New Masterpiece'}
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  {isEditing ? 'Update your content and make it shine' : 'Let your creativity flow and inspire minds'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter a captivating title for your article"
                className="w-full px-6 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-display"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="Write a brief summary of your article (optional)"
                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">This will be shown in post previews and search results</p>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category *
              </label>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => handleCategoryChange(category.key)}
                    className={classnames(
                      "px-6 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105",
                      formData.categories.includes(category.key)
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Featured Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-400 transition-colors">
                <div className="flex items-center space-x-6">
                  {/* Preview */}
                  <div className="w-40 h-40 relative flex-shrink-0">
                    {formData.image ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl shadow-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
                          <PhotoIcon className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                        <PhotoIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload Options */}
                  <div className="flex-1">
                    <div className="flex flex-col space-y-4">
                      {/* File Upload */}
                      <div>
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="imageUpload"
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 cursor-pointer inline-flex items-center space-x-2 font-semibold shadow-md transform hover:scale-105 transition-all"
                        >
                          <PhotoIcon className="w-5 h-5" />
                          <span>Upload from Computer</span>
                        </label>
                      </div>

                      {/* URL Input */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Or paste an image URL:</p>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={handleUrlImageSubmit}
                            className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold whitespace-nowrap"
                          >
                            Upload URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Content *
              </label>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="min-h-[400px]">
                  <RichTextEditor value={formData.content} onChange={handleContentChange} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Write your article content using the rich text editor</p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status *
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'Draft' }))}
                  className={classnames(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105",
                    formData.status === 'Draft'
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: 'Published' }))}
                  className={classnames(
                    "px-6 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105",
                    formData.status === 'Published'
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Published
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="debt, finance, credit, legal (separated by commas)"
                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">Add relevant tags to help readers find your content</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/posts')}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold shadow-lg"
              >
                {isLoading ? 'Publishing...' : (isEditing ? 'Update Post' : 'Publish Post')}
              </button>
            </div>
          </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default PostEditor;