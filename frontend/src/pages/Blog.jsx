import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MotionWrap from '../components/MotionWrap';
import PostCard from '../components/PostCard';
import axios from 'axios'; // Assuming axios is installed for API calls

const hardcodedCategories = [
  { key: 'all', label: 'All' },
  { key: 'debt_management', label: 'Debt Management' },
  { key: 'financial_planning', label: 'Financial Planning' },
  { key: 'credit_scores', label: 'Credit Scores' },
  { key: 'legal_advice', label: 'Legal Advice' },
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const perPage = 12; // Matches backend limit

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: perPage,
        };
        if (searchTerm) {
          params.search = searchTerm;
        }
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        const response = await axios.get('/api/published', { params });
        setArticles(response.data.posts);
        setPagination(response.data.pagination);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, searchTerm, selectedCategory]);

  // Reset page to 1 when search term or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const pageItems = useMemo(() => {
    const totalPages = pagination.totalPages;
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }
      const middleStart = Math.max(2, currentPage - 1);
      const middleEnd = Math.min(totalPages - 1, currentPage + 1);
      for (let page = middleStart; page <= middleEnd; page++) {
        pages.push(page);
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, pagination.totalPages]);

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Debt Protection Blog</h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Stay informed with actionable insights and expert guidance on managing, protecting, and optimizing your
            finances.
          </p>
        </header>
        <div className="mt-8 flex items-center gap-3 rounded-full bg-slate-100 px-6 py-3">
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-slate-400">
            <path
              d="M9.166 15.833a6.667 6.667 0 100-13.334 6.667 6.667 0 000 13.334z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M16.667 16.667L13.75 13.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search articles"
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none sm:text-base"
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {hardcodedCategories.map((category) => {
            const isActive = category.key === selectedCategory;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setSelectedCategory(category.key)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  isActive ? 'border-transparent bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-200 hover:text-slate-900'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="mt-10 text-center text-slate-500">Loading articles...</div>
        )}

        {error && (
          <div className="mt-10 text-center text-red-500">{error}</div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
            No articles match your filters. Adjust your search or explore another category.
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!pagination.hasPrev}
                aria-label="Previous page"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M12.5 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {pageItems.map((item) =>
                typeof item === 'number' ? (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`h-10 min-w-[2.5rem] rounded-full px-3 text-sm font-semibold transition ${
                      currentPage === item ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item} className="px-2 text-slate-400">
                    …
                  </span>
                ),
              )}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!pagination.hasNext}
                aria-label="Next page"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                  <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Blog;
