import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroImg from '../../assets/images/hero.png';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="w-full">
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center px-6 py-12 md:px-12 lg:px-24 bg-gradient-to-b from-vanilla to-white dark:from-espresso dark:to-mocha overflow-hidden transition-colors duration-300">
        
        {/* Background blobs for aesthetic */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-caramel/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-chocolate/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="w-full md:w-1/2 z-10 flex flex-col justify-center text-center md:text-left mt-4 md:mt-0">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-heading font-black leading-tight text-chocolate dark:text-crema tracking-tight"
          >
            The Sweetest Way to Run Your <span className="text-caramel">Parlour.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 sm:mt-6 text-base sm:text-xl text-slateGray dark:text-latte max-w-lg mx-auto md:mx-0 leading-relaxed"
          >
            FrostFlow is the modern, cloud-based POS and inventory management system designed specifically for premium ice cream and dessert businesses.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            <Link to="/login" className="px-8 py-4 bg-chocolate text-white text-lg font-bold rounded-full hover:bg-caramel transition-all shadow-lg hover:shadow-caramel/30 hover:-translate-y-1 flex items-center justify-center gap-2">
              Access Dashboard <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 mt-16 md:mt-0 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square md:aspect-auto md:h-[600px] border-8 border-white dark:border-cacao bg-white dark:bg-mocha mx-auto max-w-md md:max-w-none"
          >
            <img 
              src={heroImg} 
              alt="Ice Cream Parlour" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
