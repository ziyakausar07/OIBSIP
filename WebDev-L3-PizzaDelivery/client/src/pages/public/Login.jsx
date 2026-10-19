import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        toast.success(`Welcome to VELOCE, ${data.user.name}! ⚡`);
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 pb-28 max-w-md mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="cyber-card p-8 sm:p-10 space-y-6 border-veloce-500/30 shadow-glow-violet bg-midnight-900/90">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neon-pink via-veloce-600 to-amber-electric text-white flex items-center justify-center mx-auto shadow-glow-pink mb-3">
            <Zap size={28} className="fill-white" />
          </div>
          <h1 className="text-2xl font-display font-black text-white">
            Welcome to VELOCE
          </h1>
          <p className="text-xs text-midnight-300 font-sans">
            Sign in to track artisan orders, build custom pizzas, and unlock exclusive culinary perks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-field pl-10 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono text-midnight-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-mono text-amber-electric hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-10 text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider shadow-glow-pink"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In ⚡</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center space-y-3">
          <p className="text-xs font-mono text-midnight-300">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-neon-pink font-bold hover:underline">
              Register Now
            </Link>
          </p>

          <p className="text-[11px] font-mono text-midnight-400">
            Kitchen Supervisor?{' '}
            <Link to="/admin/login" className="text-veloce-300 hover:text-white underline">
              Admin Command Console
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
