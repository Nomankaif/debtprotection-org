import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import MotionWrap from '../components/MotionWrap';

const StatItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm text-slate-600">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-600">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

const BlogPost = () => {
  const { slug } = useParams(); // Changed from id to slug
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching post with slug:', slug);
        const res = await axios.get(`/api/published/${slug}`); // Use slug for API call
        console.log('Post API Response:', res.data);

        if (res.data) {
          setPost(res.data);
          console.log('Post loaded successfully:', res.data.title);
        } else {
          setError('Article not found');
          setPost(null);
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load article. It might not exist or an error occurred.');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold text-red-600 sm:text-4xl">Error</h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <Link
            to="/resources"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Article not found</h1>
          <p className="mt-3 text-slate-600">The blog post you are looking for is unavailable or may have been moved.</p>
          <Link
            to="/resources"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/resources" className="hover:text-slate-900">
            Blog
          </Link>
          <span>/</span>
          <span>{post.title}</span>
        </nav>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900 sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span>By {post.author}</span>
          <span>Published on {new Date(post.publishedAt).toLocaleDateString()}</span>
          <span>{post.readingTime} min read</span>
        </div>
        {(post.imageUrl || post.featuredImageId) && (
          <div className="mt-10 overflow-hidden rounded-3xl">
            {/* Determine the correct image source:
                - If backend returned a full URL (starts with http), use it directly
                - If backend returned a relative path like /uploads/..., use it as-is so dev proxy handles it
                - If featuredImageId is populated with a media object, use its url */}
            {(() => {
              const imgFromFeatured = post.featuredImageId && post.featuredImageId.url ? post.featuredImageId.url : null;
              const candidate = post.imageUrl || imgFromFeatured || '';
              const src = candidate && candidate.toString().startsWith('http') ? candidate : candidate;
              return <img src={src} alt={post.title} className="h-[380px] w-full object-cover" />;
            })()}
          </div>
        )}
        <div className="mt-10 prose max-w-none prose-lg text-slate-700" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-12 grid gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-3">
          <StatItem
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M5 13v-7a2 2 0 012-2h5.5a1.5 1.5 0 011.24.65l2.63 3.7a1.5 1.5 0 01.26.85V17a2 2 0 01-2 2h-7.5L4.5 21v-2.5A1.5 1.5 0 013 17V15a2 2 0 012-2z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Views"
            value={`${post.views || 0}`}
          />
          <StatItem
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M7 6h10M7 10h6M7 14h4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 20v-1a1 1 0 011-1h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Word Count"
            value={`${post.wordCount || 0}`}
          />
          <StatItem
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            label="Featured"
            value={post.isFeatured ? 'Yes' : 'No'}
          />
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-900">Tags</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Comments section removed as it's not supported by the current backend API */}
      </div>
    </section>
  );
};

export default BlogPost;