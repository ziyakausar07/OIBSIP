import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@slicecraftpizza.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter admin credentials');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        if (data.user.role !== 'admin') {
          toast.error('Unauthorized: This account does not possess administrative privileges.');
          setLoading(false);
          return;
        }
        toast.success(`⚡ Authenticated: Welcome, Admin ${data.user.name}!`);
        navigate('/admin');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 pb-28 max-w-md mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="cyber-card p-8 sm:p-10 space-y-6 border-veloce-500/40 shadow-glow-violet bg-midnight-900/90">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-pink via-veloce-600 to-amber-electric text-white flex items-center justify-center mx-auto shadow-glow-pink mb-4">
            <Shield size={32} />
          </div>
          <span className="badge bg-veloce-500/20 text-veloce-300 border border-veloce-500/30 font-mono text-[10px] tracking-widest uppercase">
            Restricted Access
          </span>
          <h1 className="text-2xl font-display font-black text-white">
            Admin Command Console
          </h1>
          <p className="text-xs text-midnight-300 font-sans">
            Authorized store managers and kitchen supervisors only.
          </p>
        </div>

        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
              Admin Identifier / Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@veloce-pizzeria.com"
                className="input-field pl-10 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
              Secret Passkey
            </label>
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
                <ShieldCheck size={16} />
                <span>Authorize & Enter Console ⚡</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center">
          <Link
            to="/login"
            className="text-xs font-mono text-midnight-400 hover:text-white transition-colors"
          >
            ← Switch to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
