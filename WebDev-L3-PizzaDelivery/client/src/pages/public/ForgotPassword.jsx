import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { KeyRound, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        setSent(true);
        toast.success(data.message || 'Password reset link sent to your email!');
      } else {
        toast.error(data.message || 'Could not process request');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 pb-28 max-w-md mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="cyber-card p-8 sm:p-10 space-y-6 border-veloce-500/30 shadow-glow-violet bg-midnight-900/90">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-veloce-600/20 text-veloce-300 flex items-center justify-center mx-auto border border-veloce-500/30 shadow-glow-violet mb-3">
            <KeyRound size={28} />
          </div>
          <h1 className="text-2xl font-display font-black text-white">
            Reset Password
          </h1>
          <p className="text-xs text-midnight-300 font-sans">
            Enter your registered VELOCE email to generate a secure recovery link.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
              <p className="font-bold text-sm">Recovery Link Dispatched!</p>
              <p className="mt-1 text-midnight-300 font-sans">
                Check your inbox (or terminal console logs / Ethereal preview) for the single-use reset URL.
              </p>
            </div>

            <Link to="/login" className="btn-secondary w-full !py-2.5 text-xs font-mono uppercase">
              ← Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
                Account Email
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider shadow-glow-pink"
            >
              <Send size={14} />
              <span>{loading ? 'Transmitting Link...' : 'Send Reset Link ⚡'}</span>
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link to="/login" className="text-xs font-mono text-midnight-400 hover:text-white transition-colors">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
