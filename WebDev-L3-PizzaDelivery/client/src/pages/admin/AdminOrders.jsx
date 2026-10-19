import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import AdminNav from '../../components/layout/AdminNav';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  XCircle,
  Eye,
  RefreshCw,
  ChevronDown,
  Activity,
  Zap
} from 'lucide-react';

const STATUSES = ['All', 'Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status update modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get('/admin/orders', { params });
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleNewOrder = () => fetchOrders();
    const handleStatusUpdate = () => fetchOrders();

    socket?.on('new_order_admin', handleNewOrder);
    socket?.on('order_status_update', handleStatusUpdate);

    return () => {
      socket?.off('new_order_admin', handleNewOrder);
      socket?.off('order_status_update', handleStatusUpdate);
    };
  }, [statusFilter, page, socket]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setStatusNote('');
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === selectedOrder.orderStatus) {
      toast.error('Please select a different status');
      return;
    }

    setUpdating(true);
    try {
      const { data } = await api.patch(`/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote || `Status changed to ${newStatus} by Dispatch Command`,
      });

      if (data.success) {
        toast.success(`⚡ Order #${selectedOrder.orderNumber} updated to '${newStatus}'!`);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-neon-pink uppercase tracking-widest">
              Kitchen Dispatch Queue
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Order Fulfillment & Live Courier Telemetry
          </h1>
          <p className="text-xs text-midnight-300 font-sans mt-0.5">
            Transitions trigger instant WebSocket updates on the customer tracker screen.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn-secondary !px-4 !py-2 text-xs font-mono uppercase tracking-wider self-start sm:self-auto flex items-center gap-2 border-white/15 hover:border-veloce-400"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="input-field pl-10 text-xs !py-2.5 font-mono"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none bg-midnight-950/80 p-1 rounded-xl border border-white/10">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-neon-pink to-veloce-600 text-white shadow-glow-pink'
                  : 'text-midnight-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="cyber-card overflow-hidden border-white/10">
        {loading ? (
          <div className="p-12 skeleton h-64"></div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-midnight-950/80 text-midnight-400 uppercase tracking-wider font-bold border-b border-white/10">
                <tr>
                  <th className="px-5 py-4">Order ID & Timestamp</th>
                  <th className="px-5 py-4">Customer & Phone</th>
                  <th className="px-5 py-4">Artisan Items</th>
                  <th className="px-5 py-4">Settlement</th>
                  <th className="px-5 py-4">Lifecycle Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    {/* Order ID & Time */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-white text-sm">#{order.orderNumber}</span>
                      <span className="text-[10px] text-midnight-400 block mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="px-5 py-4">
                      <p className="font-display font-bold text-white font-sans">{order.deliveryAddress?.fullName || order.user?.name}</p>
                      <p className="text-midnight-300 text-[11px]">{order.deliveryAddress?.phone}</p>
                      <p className="text-midnight-400 text-[10px] mt-0.5 max-w-xs truncate font-sans">
                        {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="px-5 py-4 font-sans">
                      <div className="space-y-1 max-w-xs">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-midnight-200">
                            <span className="font-bold text-white">{item.quantity}x {item.name}</span>
                            <span className="text-midnight-400 text-[10px] block font-mono">
                              {item.size} • {item.base?.name} • {item.sauce?.name}
                              {item.veggies?.length > 0 && ` • +${item.veggies.length} toppings`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Payment Total */}
                    <td className="px-5 py-4">
                      <span className="font-display font-extrabold text-white text-sm block">
                        ₹{order.pricing?.total}
                      </span>
                      <span
                        className={
                          order.paymentStatus === 'Paid'
                            ? 'badge-success text-[10px]'
                            : 'badge-danger text-[10px]'
                        }
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Current Status */}
                    <td className="px-5 py-4">
                      <span
                        className={
                          order.orderStatus === 'Delivered'
                            ? 'badge-success'
                            : order.orderStatus === 'In Kitchen'
                            ? 'badge-warning'
                            : order.orderStatus === 'Sent to Delivery'
                            ? 'badge-info'
                            : order.orderStatus === 'Cancelled'
                            ? 'badge-danger'
                            : 'badge bg-midnight-800 text-midnight-300'
                        }
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openStatusModal(order)}
                        className="btn-primary !px-3.5 !py-1.5 text-xs font-mono uppercase tracking-wider shadow-glow-pink"
                      >
                        Update Status ⚡
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-midnight-400 text-xs font-mono">
            No orders found matching the filter criteria.
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-midnight-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary !px-3 !py-1 text-xs disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn-secondary !px-3 !py-1 text-xs disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="cyber-card p-6 sm:p-8 max-w-md w-full space-y-5 border-veloce-500/40 shadow-glow-violet bg-midnight-900">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-neon-pink uppercase tracking-wider">
                  Live Dispatch Override
                </span>
                <h3 className="font-display font-black text-lg text-white mt-0.5">
                  Update Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-midnight-400 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5">
                  Target Lifecycle Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-midnight-950 border border-white/15 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-veloce-400"
                >
                  <option value="Order Received">Order Received (Central Queue)</option>
                  <option value="In Kitchen">In Kitchen (Baking in 480°C Kiln)</option>
                  <option value="Sent to Delivery">Sent to Delivery (Rider Dispatched)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                  <option value="Cancelled">Cancelled (Abort)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5">
                  Rider / Dispatch Note (Sent to Customer via WebSocket)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. In thermal lock with Rider Marco #8872"
                  className="input-field text-xs font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary !px-4 !py-2 text-xs font-mono uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdateStatus}
                  className="btn-primary !px-6 !py-2 text-xs font-mono uppercase shadow-glow-pink"
                >
                  {updating ? 'Broadcasting...' : 'Emit Update ⚡'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
