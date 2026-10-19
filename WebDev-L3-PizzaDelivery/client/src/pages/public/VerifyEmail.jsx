import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MailCheck, Send, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl || '');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState(user?.email || '');

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleVerify = async (tokenToUse) => {
    const finalToken = tokenToUse || tokenInput;
    if (!finalToken) {
      toast.error('Please provide a verification token');
      return;
    }

    setVerifying(true);
    try {
      const { data } = await api.post('/auth/verify-email', { token: finalToken.trim() });
      if (data.success) {
        setVerified(true);
        toast.success(data.message || 'Email successfully verified! ⚡');
        await refreshUser();
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired verification token');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      toast.error('Please enter your account email address');
      return;
    }

    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-verification', { email: resendEmail });
      if (data.success) {
        toast.success(data.message || 'Verification link sent! Check your terminal or inbox.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="pt-36 pb-28 max-w-md mx-auto px-4 sm:px-6 animate-fade-in">
      <div className="cyber-card p-8 sm:p-10 space-y-6 border-veloce-500/30 shadow-glow-violet bg-midnight-900/90">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-veloce-600/20 text-veloce-300 flex items-center justify-center mx-auto border border-veloce-500/30 shadow-glow-violet mb-3">
            <MailCheck size={30} />
          </div>
          <h1 className="text-2xl font-display font-black text-white">
            Security Verification
          </h1>
          <p className="text-xs text-midnight-300 font-sans">
            Verify your email address to unlock custom pizza checkout & live telemetry tracking.
          </p>
        </div>

        {verified ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400" />
              <p className="font-bold text-sm">Account Cryptographically Verified!</p>
              <p className="mt-1 text-midnight-300 font-sans">You now have full ordering and checkout privileges.</p>
            </div>

            <Link to="/menu" className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 font-mono text-xs uppercase shadow-glow-pink">
              <span>Start Ordering Now</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 font-mono">
              <label className="text-xs font-bold text-midnight-300 block uppercase tracking-wider">
                Verification Token Hash
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token or click email link"
                className="input-field text-xs font-mono"
              />
              <button
                onClick={() => handleVerify()}
                disabled={verifying || !tokenInput}
                className="btn-primary w-full !py-3 text-xs font-mono uppercase tracking-wider shadow-glow-pink"
              >
                {verifying ? 'Verifying Token...' : 'Verify Token ⚡'}
              </button>
            </div>

            <div className="pt-5 border-t border-white/10 space-y-3 font-mono">
              <span className="text-xs font-bold text-midnight-300 block uppercase tracking-wider">
                Need a new token?
              </span>
              <form onSubmit={handleResend} className="space-y-2.5">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter registered email"
                  className="input-field text-xs font-mono"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="btn-secondary w-full !py-2.5 text-xs font-mono uppercase flex items-center justify-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{resending ? 'Transmitting...' : 'Resend Verification Token'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link to="/dashboard" className="text-xs font-mono text-midnight-400 hover:text-white transition-colors">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
