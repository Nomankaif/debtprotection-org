import { motion } from 'framer-motion';
import AdminNavbar from './AdminNavbar';
import AdminFooter from './AdminFooter';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <AdminNavbar />
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow"
      >
        {children}
      </motion.main>
      
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;

