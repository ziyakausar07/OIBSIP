import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import AdminNav from '../../components/layout/AdminNav';
import toast from 'react-hot-toast';
import {
  Layers,
  Search,
  Plus,
  Minus,
  Edit2,
  AlertTriangle,
  RefreshCw,
  Send,
  XCircle,
  Sliders,
  CheckCircle2,
  Zap,
  ShieldCheck
} from 'lucide-react';

const CATEGORIES = ['All', 'base', 'sauce', 'cheese', 'veggie'];

export default function AdminInventory() {
  const [searchParams] = useSearchParams();
  const lowStockParam = searchParams.get('lowStockOnly') === 'true';

  const { socket } = useSocket();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(lowStockParam);

  // Stock adjustment modal state
  const [adjustItem, setAdjustItem] = useState(null);
  const [delta, setDelta] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'remove'
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Threshold modal state
  const [editItem, setEditItem] = useState(null);
  const [newThreshold, setNewThreshold] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Trigger manual low-stock scan state
  const [checkingStock, setCheckingStock] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (lowStockOnly) params.lowStockOnly = 'true';

      const { data } = await api.get('/admin/inventory', { params });
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
      toast.error('Failed to load inventory stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();

    const handleUpdate = () => fetchInventory();
    socket?.on('inventory_updated', handleUpdate);

    return () => {
      socket?.off('inventory_updated', handleUpdate);
    };
  }, [selectedCategory, lowStockOnly, socket]);

  const handleManualCheck = async () => {
    setCheckingStock(true);
    try {
      const { data } = await api.post('/admin/inventory/check-low-stock');
      if (data.success) {
        toast.success(data.message || 'Low-stock check completed! Alert emails evaluated.');
        fetchInventory();
      }
    } catch (err) {
      toast.error('Failed to trigger manual low-stock check');
    } finally {
      setCheckingStock(false);
    }
  };

  const handleQuickAdd = async (item, amount) => {
    try {
      const { data } = await api.post(`/admin/inventory/${item._id}/adjust`, {
        type: 'RESTOCK',
        delta: amount,
        reason: `Quick +${amount} Restock via Command HUD`,
      });
      if (data.success) {
        toast.success(`⚡ Restocked +${amount} ${item.unit} of ${item.itemName}`);
        fetchInventory();
      }
    } catch (err) {
      toast.error('Failed to quick restock item');
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const parsedDelta = parseInt(delta, 10);
    if (isNaN(parsedDelta) || parsedDelta <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    setAdjusting(true);
    try {
      const { data } = await api.post(`/admin/inventory/${adjustItem._id}/adjust`, {
        type: adjustType === 'add' ? 'RESTOCK' : 'ADJUSTMENT',
        delta: adjustType === 'add' ? parsedDelta : -parsedDelta,
        reason: reason || (adjustType === 'add' ? 'Manual stock arrival' : 'Kitchen correction'),
      });

      if (data.success) {
        toast.success(`Successfully adjusted stock for ${adjustItem.itemName}`);
        setAdjustItem(null);
        setDelta('');
        setReason('');
        fetchInventory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const handleThresholdSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseInt(newThreshold, 10);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Please enter a valid non-negative number');
      return;
    }

    setSavingSettings(true);
    try {
      const { data } = await api.put(`/admin/inventory/${editItem._id}`, {
        lowStockThreshold: parsed,
      });

      if (data.success) {
        toast.success(`Threshold updated for ${editItem.itemName}`);
        setEditItem(null);
        fetchInventory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update threshold');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <AdminNav />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-electric animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-amber-electric uppercase tracking-widest">
              Automated Inventory Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Ingredient Reserves & Depletion Control
          </h1>
          <p className="text-xs text-midnight-300 font-sans mt-0.5">
            Real-time multi-stock deduction, automatic node-cron safety alerts, and manual overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualCheck}
            disabled={checkingStock}
            className="btn-secondary !px-4 !py-2.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-white/15 hover:border-veloce-400"
            title="Scan database and dispatch email notifications if below threshold"
          >
            <Send size={13} className={checkingStock ? 'animate-bounce' : 'text-amber-electric'} />
            <span>{checkingStock ? 'Scanning...' : 'Trigger Cron Scan'}</span>
          </button>

          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-xl bg-midnight-800 border border-white/15 text-midnight-300 hover:text-white hover:border-veloce-400 transition-all"
            title="Reload Stock Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
            placeholder="Search ingredient..."
            className="input-field pl-10 text-xs !py-2.5 font-mono"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none bg-midnight-950/80 p-1 rounded-xl border border-white/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-neon-pink to-veloce-600 text-white shadow-glow-pink'
                  : 'text-midnight-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'All' ? 'All Reserves' : cat}
            </button>
          ))}

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap border transition-all ${
              lowStockOnly
                ? 'bg-amber-molten/20 text-amber-electric border-amber-electric/40 shadow-glow-amber'
                : 'border-white/10 text-midnight-400 hover:text-white'
            }`}
          >
            ⚠️ Low Reserves
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="cyber-card overflow-hidden border-white/10">
        {loading ? (
          <div className="p-12 skeleton h-64"></div>
        ) : inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-midnight-950/80 text-midnight-400 uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-5 py-4">Ingredient Reserve</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Current Volume</th>
                  <th className="px-5 py-4">Threshold</th>
                  <th className="px-5 py-4">Health Status</th>
                  <th className="px-5 py-4 text-right">Quick Restock & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.lowStockThreshold;
                  const isOut = item.quantity === 0;

                  return (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.ingredient?.image || '📦'}</span>
                          <div>
                            <p className="font-display font-bold text-white text-sm">{item.itemName}</p>
                            <p className="text-midnight-400 text-[10px]">
                              Updated {new Date(item.lastUpdated || item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="badge-violet capitalize text-[10px]">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock Level with Neon Progress Bar */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <span
                            className={`font-display font-black text-sm ${
                              isOut ? 'text-neon-pink' : isLow ? 'text-amber-electric' : 'text-white'
                            }`}
                          >
                            {item.quantity} {item.unit}
                          </span>
                          <div className="w-28 h-1.5 bg-midnight-950 rounded-full overflow-hidden border border-white/10">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOut
                                  ? 'bg-neon-pink w-full shadow-glow-pink'
                                  : isLow
                                  ? 'bg-amber-electric shadow-glow-amber'
                                  : 'bg-emerald-400 shadow-glow-cyan'
                              }`}
                              style={{ width: `${Math.min(100, (item.quantity / (item.lowStockThreshold * 3)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="px-5 py-4 text-midnight-300 font-mono">
                        {item.lowStockThreshold} {item.unit}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        {isOut ? (
                          <span className="badge-danger text-[10px] font-bold">DEPLETED</span>
                        ) : isLow ? (
                          <span className="badge-warning text-[10px] font-bold">LOW STOCK</span>
                        ) : (
                          <span className="badge-success text-[10px]">OPTIMAL</span>
                        )}
                      </td>

                      {/* Quick Restock & Modal Triggers */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickAdd(item, 25)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-amber-electric hover:bg-amber-electric/20 hover:border-amber-electric/40 transition-all"
                            title="Instant +25 restock"
                          >
                            +25 Quick
                          </button>

                          <button
                            onClick={() => {
                              setAdjustItem(item);
                              setAdjustType('add');
                              setDelta('50');
                            }}
                            className="btn-primary !px-3 !py-1 text-xs font-mono uppercase shadow-glow-pink"
                          >
                            Adjust
                          </button>

                          <button
                            onClick={() => {
                              setEditItem(item);
                              setNewThreshold(item.lowStockThreshold.toString());
                            }}
                            className="p-1.5 rounded-lg text-midnight-300 hover:text-white hover:bg-white/10 border border-white/10"
                            title="Edit safety threshold"
                          >
                            <Sliders size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-midnight-400 text-xs font-mono">
            No ingredient reserves matching your filter query.
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="cyber-card p-6 sm:p-8 max-w-md w-full space-y-6 border-veloce-500/40 shadow-glow-violet bg-midnight-900">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-electric uppercase tracking-wider">
                  Reserve Adjustment Override
                </span>
                <h3 className="font-display font-black text-lg text-white mt-0.5">
                  {adjustItem.itemName}
                </h3>
              </div>
              <button onClick={() => setAdjustItem(null)} className="text-midnight-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-midnight-950 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    adjustType === 'add'
                      ? 'bg-emerald-500 text-white shadow-glow-cyan'
                      : 'text-midnight-300 hover:text-white'
                  }`}
                >
                  + Add Restock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('remove')}
                  className={`py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                    adjustType === 'remove'
                      ? 'bg-neon-pink text-white shadow-glow-pink'
                      : 'text-midnight-300 hover:text-white'
                  }`}
                >
                  - Deduct Stock
                </button>
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1">
                  Quantity Delta ({adjustItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  placeholder="e.g. 50"
                  className="input-field text-sm font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1">
                  Audit Reason / Ledger Note
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Farm shipment arrived"
                  className="input-field text-sm font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="btn-secondary flex-1 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="btn-primary flex-1 text-xs font-mono uppercase shadow-glow-pink"
                >
                  {adjusting ? 'Committing...' : 'Apply Update ⚡'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Threshold Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="cyber-card p-6 sm:p-8 max-w-sm w-full space-y-6 border-veloce-500/40 shadow-glow-violet bg-midnight-900">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-veloce-300 uppercase tracking-wider">
                  Telemetry Trigger
                </span>
                <h3 className="font-display font-black text-lg text-white mt-0.5">
                  {editItem.itemName}
                </h3>
              </div>
              <button onClick={() => setEditItem(null)} className="text-midnight-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleThresholdSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1">
                  Low-Stock Trigger Threshold ({editItem.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="input-field text-sm font-mono"
                  required
                />
                <p className="text-[11px] text-midnight-400 mt-1 font-sans">
                  When quantity drops at or below this value, an automated alert email will be sent to admin.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="btn-secondary flex-1 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="btn-primary flex-1 text-xs font-mono uppercase shadow-glow-pink"
                >
                  {savingSettings ? 'Saving...' : 'Save Rule ⚡'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
