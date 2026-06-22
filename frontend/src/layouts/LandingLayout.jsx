import { Outlet, Link } from 'react-router-dom';
import { Snowflake, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const LandingLayout = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen bg-vanilla dark:bg-espresso flex flex-col font-sans transition-colors duration-300">
      <nav className="px-4 py-3 md:px-12 md:py-6 flex items-center justify-between bg-white/80 dark:bg-espresso/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-cacao gap-2 transition-colors duration-300">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-caramel to-chocolate flex items-center justify-center text-white shadow-soft shrink-0">
            <Snowflake className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h1 className="text-xl md:text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-caramel to-chocolate truncate">
            FrostFlow
          </h1>
        </div>
        <div className="shrink-0 flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-slateGray dark:text-latte hover:text-chocolate dark:text-crema dark:hover:text-caramel relative p-2 rounded-full hover:bg-vanilla dark:bg-espresso dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/login" className="px-4 py-2 md:px-6 md:py-2.5 bg-caramel text-white text-sm md:text-base font-semibold rounded-full hover:bg-chocolate transition-colors shadow-soft whitespace-nowrap">
            Log In
          </Link>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-8 bg-chocolate text-white text-center">
        <p className="text-sm opacity-80">© 2026 FrostFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingLayout;
