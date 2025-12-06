import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Hero from '../components/Hero';

const services = [
  {
    title: 'Debt Consolidation',
    description: 'Combine multiple debts into one manageable payment with a plan tailored to your goals.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
        <path
          d="M4 12h16M4 17h10M4 7h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Credit Counseling',
    description: 'Get expert support to strengthen your credit profile and build long-term financial health.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
        <path
          d="M4 6h16M7 12h10M10 18h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="6" cy="12" r="1" fill="currentColor" />
        <circle cx="18" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Debt Negotiation',
    description: 'Partner with our specialists to reduce balances, secure lower rates, and regain control.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
        <path
          d="M6 17l-2 3V6a2 2 0 012-2h12a2 2 0 012 2v14l-2-3H6z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M10 9h4M10 12h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const awards = ['/images/11111.png', '/images/22222.png', '/images/33333.png', '/images/44444.png'];

const testimonials = [
  {
    name: 'Sophia M.',
    date: 'May 15, 2024',
    quote:
      'Debt Protection helped me consolidate my debts into a single plan that finally feels manageable. I’m on a clear path to financial freedom.',
    likes: 12,
    comments: 1,
    avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Ethan L.',
    date: 'April 22, 2024',
    quote:
      'The credit counseling services were invaluable. I learned how to improve my score and make smarter decisions about my budget.',
    likes: 15,
    comments: 2,
    avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Olivia K.',
    date: 'March 10, 2024',
    quote:
      'Thanks to Debt Protection, I negotiated better repayment terms and reduced my stress. Highly recommend their team.',
    likes: 10,
    comments: 0,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
  },
];

const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/published', {
          params: { limit: 3 }
        });
        setFeaturedPosts(response.data.posts || []);
      } catch (error) {
        console.error('Error fetching featured posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  return (
    <div className="bg-white" style={{ scrollBehavior: 'smooth' }}>
      <Hero />

      <section id="services" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Our Services</h2>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Comprehensive debt protection solutions tailored to your unique financial goals.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  {service.icon}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-3 text-sm text-slate-600 sm:text-base">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredPosts.length > 0 && (
        <section className="px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Featured Articles</h2>
            <p className="mt-3 text-slate-600 sm:text-lg">
              Stay informed with our latest insights and expert guidance
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/resources/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={post.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                    <div className="mt-auto pt-4 text-sm text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>By {post.author}</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/resources"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                View All Articles
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-slate-50 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Awards & Recognition</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {awards.map((image) => (
              <div
                key={image}
                className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <img src={image} alt="Award recognition" className="h-32 w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Client Testimonials</h2>
          <p className="mt-3 text-slate-600 sm:text-lg">
            We partner with clients nationwide to navigate debt challenges with confidence.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.date}</p>
                  </div>
                </div>
                <div className="mt-4 text-base text-blue-500">★★★★★</div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{testimonial.quote}</p>
                <div className="mt-auto flex items-center gap-6 pt-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-slate-400">
                      <path
                        d="M5 11.5V4.75A1.75 1.75 0 016.75 3h6.19c.63 0 1.03.68.73 1.23L12.5 7h1.75A1.75 1.75 0 0116 8.75v.83a1.5 1.5 0 01-.44 1.06l-4.82 4.82a1 1 0 01-.71.29H7.75A2.75 2.75 0 015 13.0V11.5z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{testimonial.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5 text-slate-400">
                      <path
                        d="M10.833 16.667l4.167-4.17h-2.5V5.833H9.167v6.664h-2.5l4.166 4.17z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{testimonial.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Ready to Take Control of Your Debt?</h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Schedule a consultation and start building a personalized plan toward financial freedom.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
