import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

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
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Login failed');
    }
  };

  return (
    <div className="card w-full shadow-medium">
      <div className="text-center mb-section">
        <h2 className="text-caramel">FrostFlow</h2>
        <p>Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-default">
        <div>
          <label className="label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="input-field pr-10" 
              required 
            />
            <button 
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slateGray hover:text-chocolate transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full mt-4">Sign In</button>
      </form>
    </div>
  );
};

export default Login;
