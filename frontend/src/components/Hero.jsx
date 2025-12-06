import { motion } from 'framer-motion';
import { BanknotesIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const Hero = () => {
  const stats = [
    { icon: ShieldCheckIcon, value: '10K+', label: 'Clients Assisted' },
    { icon: BanknotesIcon, value: '4.9/5', label: 'Customer Rating' },
    { icon: UserGroupIcon, value: '85%', label: 'Debt Reduced Avg.' }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <section className="relative bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden py-12 md:py-16 lg:py-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-6 w-24 h-24 md:w-32 md:h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-20 right-10 w-32 h-32 md:w-40 md:h-40 bg-indigo-200 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-16 left-1/4 w-16 h-16 md:w-24 md:h-24 bg-blue-300 rounded-full opacity-25 blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          
          {/* Left Content */}
          <motion.div 
            className="space-y-6 md:space-y-8 text-center lg:text-left"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm">
                <ShieldCheckIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  #1 Trusted Debt Relief Partner
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Regain Your
                <span className="block bg-linear-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                  Financial Freedom
                </span>
                <span className="block">with Expert Debt Protection</span>
              </h1>
            </motion.div>

            <motion.p 
              variants={fadeInUp}
              className="text-base md:text-lg lg:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Consolidate debts, reduce payments, and rebuild confidence. Our certified experts craft personalized
              strategies to help you overcome financial challenges and achieve long-term stability.
            </motion.p>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-3 gap-3 sm:gap-6 pt-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  className="text-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm"
                >
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 60 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Decorative border with gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 via-indigo-400 to-blue-500 rounded-3xl transform rotate-3 opacity-20 blur-sm"></div>
              <div className="absolute inset-2 bg-linear-to-br from-blue-500 via-indigo-500 to-blue-700 rounded-3xl transform -rotate-1 opacity-30"></div>
              
              {/* Main image container */}
              <div className="relative bg-white p-2 rounded-3xl shadow-2xl">
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  src="https://www.shutterstock.com/image-photo/protection-shield-bag-money-dollar-600nw-1816115486.jpg"
                  alt="Financial advisor helping client reduce debt"
                  className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] object-cover rounded-2xl"
                />

                {/* Floating elements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute -top-4 -left-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">Live Assistance</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="absolute -bottom-4 -right-4 bg-linear-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-2xl shadow-xl"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm opacity-90">Client Satisfaction</div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Additional floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -right-4 md:top-20 md:-right-8 w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <BanknotesIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 -left-4 md:bottom-32 md:-left-6 w-10 h-10 md:w-12 md:h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <ShieldCheckIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-8 sm:h-12 fill-white"
        >
          <path d="M0,120 C150,60 350,0 600,30 C850,60 1050,90 1200,60 L1200,120 Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
