
import React from 'react';
import { motion } from 'framer-motion';

const MotionWrap = (Component) => {
  const HOC = (props) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Component {...props} />
    </motion.div>
  );

  HOC.displayName = `MotionWrap(${Component.displayName || Component.name || 'Component'})`;
  return HOC;
};

export default MotionWrap;
