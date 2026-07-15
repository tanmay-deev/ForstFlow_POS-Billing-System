import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, IceCream } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="w-full flex flex-col justify-center animate-fade-in">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-caramel to-chocolate flex items-center justify-center text-white shadow-soft">
          <IceCream size={26} />
        </div>
        <h2 className="text-3xl font-heading font-bold text-chocolate dark:text-crema tracking-tight">FrostFlow</h2>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-chocolate dark:text-crema mb-2 tracking-tight">Welcome back</h1>
        <p className="text-slateGray dark:text-latte text-base">Enter your credentials to access your dashboard.</p>
        <button 
          type="button"
          onClick={() => { setEmail('admin@example.com'); setPassword('123456'); }}
          className="mt-4 px-4 py-2 bg-caramel/10 text-caramel dark:bg-caramel/20 dark:text-orange-300 font-semibold text-sm rounded-lg hover:bg-caramel/20 dark:hover:bg-caramel/30 transition-colors inline-flex items-center"
        >
          Auto-fill Admin Credentials
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slateGray dark:text-latte uppercase tracking-wide mb-1.5 ml-1">Email Address</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white dark:bg-mocha border border-gray-200 dark:border-cacao rounded-xl px-4 py-3.5 text-chocolate dark:text-crema focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-latte font-medium"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
            <label className="block text-xs font-bold text-slateGray dark:text-latte uppercase tracking-wide">Password</label>
            <button type="button" onClick={() => toast("Please contact your administrator to reset your password.", { icon: "🔒" })} className="text-xs font-bold text-caramel hover:text-chocolate dark:text-crema dark:hover:text-white transition-colors">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-mocha border border-gray-200 dark:border-cacao rounded-xl pl-4 pr-12 py-3.5 text-chocolate dark:text-crema focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-latte font-medium tracking-wider"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-chocolate dark:text-crema dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 bg-chocolate text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg hover:bg-[#3D251E] active:scale-[0.99] transition-all mt-8"
        >
          Sign in to FrostFlow
        </button>
      </form>
    </div>
  );
};

export default Login;
