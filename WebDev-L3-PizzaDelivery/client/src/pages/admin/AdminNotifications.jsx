import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminNav from '../../components/layout/AdminNav';
import toast from 'react-hot-toast';
import { Bell, History, Mail, AlertTriangle, RefreshCw, Send, CheckCircle2, Zap } from 'lucide-react';

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifRes, txRes] = await Promise.all([
        api.get('/admin/notifications'),
        api.get('/admin/inventory/transactions'),
      ]);

      if (notifRes.data.success) setNotifications(notifRes.data.logs);
      if (txRes.data.success) setTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Failed to load logs:', err);
      toast.error('Failed to load audit telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-cyber-cyan uppercase tracking-widest">
              Audit Telemetry & Automated Cron Alerts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            System Event Ledger & Stock Movements
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="btn-secondary !px-4 !py-2 text-xs font-mono uppercase tracking-wider self-start sm:self-auto flex items-center gap-2 border-white/15 hover:border-veloce-400"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-midnight-950/80 p-1.5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeTab === 'notifications'
              ? 'bg-gradient-to-r from-neon-pink to-veloce-600 text-white shadow-glow-pink'
              : 'text-midnight-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Mail size={14} />
          <span>Cron Alert Dispatches ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-neon-pink to-veloce-600 text-white shadow-glow-pink'
              : 'text-midnight-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <History size={14} />
          <span>Stock Delta Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="cyber-card overflow-hidden border-white/10">
        {loading ? (
          <div className="p-12 skeleton h-64"></div>
        ) : activeTab === 'notifications' ? (
          /* Notifications Tab */
          notifications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-midnight-950/80 text-midnight-400 uppercase tracking-wider font-bold border-b border-white/10">
                  <tr>
                    <th className="px-5 py-4">Timestamp</th>
                    <th className="px-5 py-4">Trigger Category</th>
                    <th className="px-5 py-4">Target Recipient</th>
                    <th className="px-5 py-4">Email Subject</th>
                    <th className="px-5 py-4">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {notifications.map((log) => (
                    <tr key={log._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-midnight-300">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge-warning text-[10px]">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-bold">
                        {log.recipient}
                      </td>
                      <td className="px-5 py-4 text-midnight-200 max-w-sm truncate font-sans">
                        {log.subject}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            log.status === 'SENT' ? 'badge-success text-[10px]' : 'badge-danger text-[10px]'
                          }
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-midnight-400 text-xs font-mono">
              No low-stock email alerts have been logged yet.
            </div>
          )
        ) : (
          /* Stock Transactions Tab */
          transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-midnight-950/80 text-midnight-400 uppercase tracking-wider font-bold border-b border-white/10">
                  <tr>
                    <th className="px-5 py-4">Timestamp</th>
                    <th className="px-5 py-4">Ingredient</th>
                    <th className="px-5 py-4">Operation Type</th>
                    <th className="px-5 py-4">Delta Movement</th>
                    <th className="px-5 py-4">Before → After</th>
                    <th className="px-5 py-4">Audit Note / Order #</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-midnight-300">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-bold text-white">
                        {tx.itemName}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            tx.type === 'DEDUCTION'
                              ? 'badge-danger text-[10px]'
                              : tx.type === 'RESTOCK'
                              ? 'badge-success text-[10px]'
                              : 'badge-info text-[10px]'
                          }
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-display font-black text-sm">
                        <span className={tx.type === 'DEDUCTION' ? 'text-neon-pink' : 'text-emerald-400'}>
                          {tx.type === 'DEDUCTION' ? '-' : '+'}
                          {tx.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-midnight-300">
                        {tx.previousStock} → {tx.newStock}
                      </td>
                      <td className="px-5 py-4 text-midnight-400 max-w-xs truncate font-sans">
                        {tx.reason || (tx.orderId ? `Order #${tx.orderId.orderNumber || tx.orderId}` : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-midnight-400 text-xs font-mono">
              No inventory movements logged yet.
            </div>
          )
        )}
      </div>
    </div>
  );
}
