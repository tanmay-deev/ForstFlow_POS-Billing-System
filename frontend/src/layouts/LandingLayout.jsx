import { Outlet, Link } from 'react-router-dom';
import { Snowflake } from 'lucide-react';

const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-vanilla flex flex-col font-sans">
      <nav className="px-4 py-3 md:px-12 md:py-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-caramel to-chocolate flex items-center justify-center text-white shadow-soft shrink-0">
            <Snowflake className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h1 className="text-xl md:text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-caramel to-chocolate truncate">
            FrostFlow
          </h1>
        </div>
        <div className="shrink-0">
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
