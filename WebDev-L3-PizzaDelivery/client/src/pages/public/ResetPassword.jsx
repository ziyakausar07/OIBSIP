import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Reset token is missing');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', {
        token: token.trim(),
        password,
      });

      if (data.success) {
        setSuccess(true);
        toast.success(data.message || 'Password reset successfully! ⚡');
      } else {
        toast.error(data.message || 'Reset failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired password reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-36 pb-28 max-w-md mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="cyber-card p-8 sm:p-10 space-y-6 border-veloce-500/30 shadow-glow-violet bg-midnight-900/90">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-veloce-600/20 text-veloce-300 flex items-center justify-center mx-auto border border-veloce-500/30 shadow-glow-violet mb-3">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-display font-black text-white">
            Set New Password
          </h1>
          <p className="text-xs text-midnight-300 font-sans">
            Enter your new credentials to regain access to your VELOCE account.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
              <p className="font-bold text-sm">Password Updated Successfully!</p>
              <p className="mt-1 text-midnight-300 font-sans">You can now sign in with your new passkey.</p>
            </div>

            <Link to="/login" className="btn-primary w-full !py-3 flex items-center justify-center gap-2 font-mono text-xs uppercase shadow-glow-pink">
              <span>Go to Sign In</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <label className="text-xs font-bold text-midnight-300 block mb-1 uppercase tracking-wider">
                Reset Token Hash
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token string"
                className="input-field text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-midnight-300 block mb-1 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="input-field pl-10 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-midnight-300 block mb-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="input-field pl-10 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider shadow-glow-pink font-bold"
            >
              <span>{loading ? 'Updating Credentials...' : 'Save New Password ⚡'}</span>
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
