import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PostCard = ({ post }) => {
  // Format the published date
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <Link to={`/resources/blog/${post.slug}`} className="block h-full">
        <div className="h-48 overflow-hidden">
          <img
            src={post.imageUrl || '/placeholder-image.jpg'}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-sm font-medium text-blue-600">{post.categoryLabel || post.category}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{post.title}</h3>
          <p className="mt-3 text-sm text-slate-600">{post.excerpt}</p>
          <div className="mt-auto pt-4 text-xs text-slate-500">
            <span>{post.author}</span> &middot; <span>{formattedDate}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PostCard;
