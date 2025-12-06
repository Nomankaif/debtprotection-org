import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostsManagement from './pages/admin/PostsManagement';
import PostEditor from './pages/admin/PostEditor';
import AdminRoot from './pages/admin/AdminRoot';
import MotionWrap from './components/MotionWrap';

// Wrap pages with MotionWrap
const WrappedHome = MotionWrap(Home);
const WrappedBlog = MotionWrap(Blog);
const WrappedBlogPost = MotionWrap(BlogPost);
const WrappedAbout = MotionWrap(About);
const WrappedContact = MotionWrap(Contact);
const WrappedPrivacyPolicy = MotionWrap(PrivacyPolicy);
const WrappedAdminLogin = MotionWrap(AdminLogin);
const WrappedAdminRegister = MotionWrap(AdminRegister);
const WrappedAdminDashboard = MotionWrap(AdminDashboard);
const WrappedPostsManagement = MotionWrap(PostsManagement);
const WrappedPostEditor = MotionWrap(PostEditor);
const WrappedAdminRoot = MotionWrap(AdminRoot);


// Debug: log imported modules to detect undefined components causing runtime errors
if (typeof window !== 'undefined') {
  console.debug('App imports:', {
    Header,
    Footer,
    Home,
    Blog,
    BlogPost,
    About,
    Contact,
    PrivacyPolicy,
    ProtectedRoute,
    AdminLogin,
    AdminRegister,
    AdminDashboard,
    PostsManagement,
    PostEditor,
    AdminRoot,
  });
}

const ScrollManager = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.replace('#', ''));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return null;
};

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <>
        <ScrollManager />
        {!isAdminRoute && <Header />}
        <main className={isAdminRoute ? '' : ''}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/" element={<WrappedHome />} />
              <Route path="/resources" element={<WrappedBlog />} />
              <Route path="/resources/blog/:slug" element={<WrappedBlogPost />} />
              <Route path="/about" element={<WrappedAbout />} />
              <Route path="/contact" element={<WrappedContact />} />
              <Route path="/privacy-policy" element={<WrappedPrivacyPolicy />} />
              
              {/* Admin Auth Routes */}
              <Route path="/admin" element={<WrappedAdminRoot />} />
              <Route path="/admin/login" element={<WrappedAdminLogin />} />
              <Route path="/admin/register" element={<WrappedAdminRegister />} />              
              {/* Protected Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <WrappedAdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/posts" 
                element={
                  <ProtectedRoute>
                    <WrappedPostsManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/posts/create" 
                element={
                  <ProtectedRoute>
                    <WrappedPostEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/posts/edit/:id" 
                element={
                  <ProtectedRoute>
                    <WrappedPostEditor />
                  </ProtectedRoute>
                } 
              />
              {/* Additional PostEditor routes (alternate paths used elsewhere) */}
              <Route 
                path="/admin/post-editor" 
                element={
                  <ProtectedRoute>
                    <WrappedPostEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/post-editor/:id" 
                element={
                  <ProtectedRoute>
                    <WrappedPostEditor />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>
        {!isAdminRoute && <Footer />}
        <ToastContainer position="bottom-right" />
      </>
    </AuthProvider>
  );
};

export default App;