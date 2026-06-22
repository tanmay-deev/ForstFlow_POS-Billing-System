import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-mocha dark:bg-espresso transition-colors duration-300 relative">
      {/* Absolute floating theme toggle for Auth pages */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="text-slateGray dark:text-latte hover:text-chocolate dark:text-crema dark:hover:text-caramel relative p-3 rounded-full bg-white/80 dark:bg-mocha/80 shadow-soft backdrop-blur-md border border-gray-100 dark:border-cacao hover:scale-105 transition-all"
          title="Toggle theme"
        >
          {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
        </button>
      </div>

      {/* Left side: Premium Image Background */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-chocolate">
        <img 
          src="/images/auth-bg.png" 
          alt="FrostFlow Premium POS" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
        />
        {/* Subtle, smooth gradient overlay for text readability - NO BOX */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
        
        <div className="absolute bottom-12 left-12 right-12 pointer-events-none">
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-md">Crafting Joy,<br/>One Scoop at a Time.</h2>
          <p className="text-lg xl:text-xl text-white/80 font-medium max-w-md drop-shadow-md">Welcome to your FrostFlow management system. Sign in to start your shift and serve happiness.</p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative bg-white dark:bg-mocha dark:bg-espresso transition-colors duration-300">
        <div className="w-full max-w-[420px] mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
