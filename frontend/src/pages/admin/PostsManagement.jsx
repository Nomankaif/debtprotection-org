import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout'; // Import AdminLayout

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts');
        const posts = response.data.posts || response.data;
        setPosts(posts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to fetch posts');
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This will also delete any associated images and data from the database.')) {
      try {
        await axios.delete(`/api/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
        toast.success('Post and associated data deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    const statusMap = { published: 'Published', draft: 'Draft' };
    return post.status === (statusMap[filter] || filter);
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow overflow-hidden sm:rounded-md"
        >
          {/* Filter Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({posts.length})
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'published'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Published ({posts.filter(p => p.status === 'Published').length})
              </button>
              <button
                onClick={() => setFilter('draft')}
                className={`px-4 py-2 text-sm font-medium ${
                  filter === 'draft'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Drafts ({posts.filter(p => p.status === 'draft').length})
              </button>
            </div>
          </div>

          {/* Posts List */}
          <ul className="divide-y divide-gray-200">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <li key={post._id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-600 truncate">{post.title}</p>
<p className="text-sm text-gray-500">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                          {post.tags.length > 0 && (
                            <div className="flex space-x-1">
                              {post.tags.map((tag, index) => (
                                <span key={index} className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/posts/edit/${post._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li>
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No posts found. Create your first post!
                </div>
              </li>
            )}
          </ul>
        </motion.div>
      </main>
    </AdminLayout>
  );
};

export default PostsManagement;