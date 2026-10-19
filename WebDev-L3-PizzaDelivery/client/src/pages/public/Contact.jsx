import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ChevronDown, Zap } from 'lucide-react';

const FAQS = [
  {
    q: 'How long does kiln baking and dispatch take?',
    a: 'Our average delivery time is 18-25 minutes from oven firing. Our couriers use heated thermal lock pouches so the pizza reaches you with molten cheese pull and crisp crust.',
  },
  {
    q: 'How does the 3D Custom Pizza Lab calculate pricing?',
    a: 'Every stone-milled crust, sauce, cheese melt, and veggie topping has verified portion pricing stored on our secure MongoDB backend. All line items and sizes are validated cryptographically.',
  },
  {
    q: 'How does the Razorpay Test Mode checkout work?',
    a: 'The checkout connects to Razorpay Sandbox. You can use standard Razorpay test card credentials or simulate instant payments safely. Real-time ingredient stock is automatically decremented upon success.',
  },
  {
    q: 'Do you offer vegan, keto, or gluten-conscious options?',
    a: 'Yes! We offer a 100% plant-based cashew melt, gluten-free stone bases, and 10+ hydroponic vegetable toppings.',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('⚡ Message transmitted to VELOCE dispatch center.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 700);
  };

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold text-amber-electric uppercase tracking-widest block">
          Dispatch Support & Communication
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white">
          Direct Line to Kitchen HQ
        </h1>
        <p className="text-midnight-300 text-xs sm:text-sm font-sans">
          Have an inquiry regarding 72-hour dough fermentation, catering dispatches, or custom presets? Reach our kitchen team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Direct Contact Info & FAQs (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="cyber-card p-6 sm:p-8 space-y-6 border-veloce-500/30">
            <h3 className="font-display font-black text-lg text-white border-b border-white/10 pb-3">
              HQ Telemetry Details
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-neon-pink/15 text-neon-pink flex items-center justify-center shrink-0 border border-neon-pink/30">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">Culinary District Hub</h4>
                  <p className="text-midnight-300 mt-0.5">
                    Sector 4, Cyber Culinary District, Mumbai 400051
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-electric/15 text-amber-electric flex items-center justify-center shrink-0 border border-amber-electric/30">
                  <Phone size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">Dispatch Hotline</h4>
                  <p className="text-midnight-300 font-mono mt-0.5">+91 98765 43210 (Direct Dispatch)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-veloce-500/15 text-veloce-300 flex items-center justify-center shrink-0 border border-veloce-500/30">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">Electronic Dispatch</h4>
                  <p className="text-midnight-300 font-mono mt-0.5">dispatch@veloce-pizzeria.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="cyber-card p-6 space-y-4 border-white/10">
            <h3 className="font-display font-black text-base text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-electric" />
              <span>Frequently Asked Inquiries</span>
            </h3>

            <div className="space-y-2.5">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-midnight-950/60">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-3.5 flex items-center justify-between text-xs font-semibold text-white hover:text-amber-electric transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={14}
                      className={`text-midnight-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="p-3.5 pt-0 text-xs text-midnight-300 font-sans border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Message Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="cyber-card p-8 sm:p-10 space-y-6 border-veloce-500/30 bg-midnight-900/90 shadow-glow-violet">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <h3 className="font-display font-black text-xl text-white">Send a Dispatch Message</h3>
              <p className="text-xs text-midnight-300 font-sans">
                Our kitchen supervisors respond within 15 minutes during operating kiln hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Marco Rossi"
                    className="input-field text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="marco@example.com"
                    className="input-field text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
                  Inquiry Topic
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Bulk catering order for Friday 8 PM"
                  className="input-field text-xs font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase tracking-wider">
                  Message Details
                </label>
                <textarea
                  rows="5"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your request..."
                  className="input-field text-xs font-sans resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider shadow-glow-pink"
              >
                <Send size={15} />
                <span>{sending ? 'Transmitting...' : 'Send Message ⚡'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
