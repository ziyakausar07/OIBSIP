import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, UserPlus, Zap } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password);
      if (data.success) {
        toast.success('Registration successful! Check console/email for verification link.');
        navigate('/verify-email', { state: { email, message: data.message } });
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Email may already be in use.');
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
            Join VELOCE PIZZERIA
          </h1>
          <p className="text-xs text-midnight-300 font-sans">
            Craft custom pizzas, save recipe presets, and track delivery via live WebSocket telemetry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marco Rossi"
                className="input-field pl-10 text-xs font-mono"
              />
            </div>
          </div>

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
                placeholder="marco@example.com"
                className="input-field pl-10 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
              Create Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input-field pl-10 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
                <UserPlus size={16} />
                <span>Create Account ⚡</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-xs font-mono text-midnight-300">
            Already registered?{' '}
            <Link to="/login" className="text-neon-pink font-bold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
