'use client';
import { useEffect, useState, useRef } from 'react';
import CardBox from '@/app/components/shared/CardBox';
import { ordersService, Order } from '@/app/services/orders.service';
import { Icon } from '@iconify/react';
import { useNotificationSound } from '@/app/hooks/useNotificationSound';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  COOKING: 'bg-orange-100 text-orange-800',
  READY: 'bg-green-100 text-green-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'COOKING',
  COOKING: 'READY',
  READY: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'COMPLETED',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const { play: playNotification } = useNotificationSound();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAll();

      // Check for new orders (only after first load)
      if (!isFirstLoadRef.current && soundEnabled) {
        const currentIds = new Set(data.map((o: Order) => o.id));
        const newOrders = data.filter(
          (o: Order) => !previousOrderIdsRef.current.has(o.id) && o.status === 'PENDING'
        );
        if (newOrders.length > 0) {
          playNotification();
        }
      }

      // Update tracking refs
      previousOrderIdsRef.current = new Set(data.map((o: Order) => o.id));
      isFirstLoadRef.current = false;

      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await ordersService.updateStatus(id, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <CardBox>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Live Orders</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={playNotification}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title="Test notification sound"
          >
            <Icon icon="solar:bell-bing-bold" width={24} />
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full transition-colors ${
              soundEnabled
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
            }`}
            title={soundEnabled ? 'Sound notifications ON' : 'Sound notifications OFF'}
          >
            <Icon
              icon={soundEnabled ? 'solar:volume-loud-bold' : 'solar:volume-cross-bold'}
              width={24}
            />
          </button>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Refresh orders"
          >
            <Icon icon="solar:refresh-linear" width={24} />
          </button>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="text-center py-10">
          <Icon icon="svg-spinners:ring-resize" className="w-8 h-8 mx-auto" />
          <p className="mt-2 text-gray-500">Loading orders...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Time</th>
                <th className="p-4 font-semibold">Actions</th>
                <th className="p-4 font-semibold">Print</th>
                <th className="p-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    <Icon
                      icon="solar:cart-large-minimalistic-linear"
                      className="w-12 h-12 mx-auto mb-2 opacity-50"
                    />
                    <p>No active orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </CardBox>
  );
}

function OrderRow({
  order,
  onStatusUpdate,
}: {
  order: Order;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - Order #${order.id.slice(0, 8)}</title>
            <style>
              body { font-family: monospace; margin: 0; padding: 20px; }
              .print-receipt { max-width: 300px; margin: 0 auto; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .text-xl { font-size: 1.25rem; }
              .text-2xl { font-size: 1.5rem; }
              .text-xs { font-size: 0.75rem; }
              .text-sm { font-size: 0.875rem; }
              .border-b { border-bottom: 1px solid #ddd; }
              .border-t { border-top: 1px solid #ddd; }
              .border-dashed { border-style: dashed; }
              .pb-4 { padding-bottom: 1rem; }
              .pt-4 { padding-top: 1rem; }
              .mb-4 { margin-bottom: 1rem; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mt-2 { margin-top: 0.5rem; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="print-receipt">
              <div class="text-center border-b border-dashed pb-4 mb-4">
                <h1 class="font-bold text-xl">Restaurant</h1>
                <p class="text-xs">Order Receipt</p>
                <p class="text-xs mt-2">Order #${order.id.slice(0, 8).toUpperCase()}</p>
                <p class="text-xs">${new Date(order.createdAt).toLocaleString()}</p>
              </div>
              ${order.user ? `
              <div class="border-b border-dashed pb-4 mb-4">
                <p class="text-xs font-bold">CUSTOMER:</p>
                <p class="text-xs">${order.user.firstName || ''} ${order.user.lastName || ''}</p>
                ${order.user.email ? `<p class="text-xs">${order.user.email}</p>` : ''}
              </div>
              ` : ''}
              <div class="border-b border-dashed pb-4 mb-4">
                <p class="text-xs font-bold mb-2">ITEMS:</p>
                ${order.items?.map(item => `
                  <div class="flex justify-between text-xs" style="margin-bottom: 4px;">
                    <span>${item.quantity}x ${item.menuItem?.name || 'Item'}</span>
                    <span>₹${(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                `).join('') || '<p class="text-xs">No items</p>'}
              </div>
              <div class="font-bold text-sm border-t pt-4">
                <div class="flex justify-between">
                  <span>TOTAL</span>
                  <span>₹${Number(order.totalAmount).toFixed(0)}</span>
                </div>
              </div>
              <div class="text-center border-t border-dashed pt-4 mt-4">
                <p class="text-xs">Thank you for your order!</p>
              </div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintKitchen = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Kitchen - Order #${order.id.slice(0, 8)}</title>
            <style>
              body { font-family: monospace; margin: 0; padding: 20px; }
              .print-kitchen { max-width: 300px; margin: 0 auto; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .text-3xl { font-size: 1.875rem; }
              .text-2xl { font-size: 1.5rem; }
              .text-xl { font-size: 1.25rem; }
              .text-lg { font-size: 1.125rem; }
              .text-xs { font-size: 0.75rem; }
              .border-b { border-bottom: 4px solid #000; }
              .border-t { border-top: 4px solid #000; }
              .pb-3 { padding-bottom: 0.75rem; }
              .pt-3 { padding-top: 0.75rem; }
              .mb-4 { margin-bottom: 1rem; }
              .mt-4 { margin-top: 1rem; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .gap-3 { gap: 0.75rem; }
              .bg-black { background: #000; }
              .text-white { color: #fff; }
              .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
              .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
              .item-row { display: flex; align-items: start; gap: 12px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ddd; }
              .qty-badge { background: #000; color: #fff; font-weight: bold; padding: 4px 8px; min-width: 40px; text-align: center; font-size: 1.125rem; }
              .item-name { font-weight: bold; font-size: 1.125rem; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="print-kitchen">
              <div class="text-center border-b pb-3 mb-4">
                <p class="font-bold text-2xl">KITCHEN</p>
                <p class="font-bold text-3xl" style="margin-top: 8px;">#${order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div class="flex justify-between" style="border-bottom: 2px dashed #999; padding-bottom: 8px; margin-bottom: 16px;">
                <div>
                  <p class="text-xs" style="color: #666;">ORDER TIME</p>
                  <p class="font-bold">${new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div style="text-align: right;">
                  <p class="text-xs" style="color: #666;">DATE</p>
                  <p class="font-bold">${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              ${order.user ? `
              <div style="background: #f0f0f0; padding: 8px; margin-bottom: 16px; text-align: center;">
                <p class="font-bold text-lg">${order.user.firstName || ''} ${order.user.lastName || ''}</p>
              </div>
              ` : ''}
              <div style="margin-bottom: 16px;">
                ${order.items?.map(item => `
                  <div class="item-row">
                    <span class="qty-badge">${item.quantity}x</span>
                    <span class="item-name">${item.menuItem?.name || 'Item'}</span>
                  </div>
                `).join('') || '<p>No items</p>'}
              </div>
              <div class="text-center border-t pt-3">
                <p class="text-xs" style="color: #666;">TOTAL ITEMS</p>
                <p class="font-bold text-2xl">${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
              </div>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <>
      <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="p-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
        <td className="p-4">
          {order.user
            ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email
            : 'Guest'}
        </td>
        <td className="p-4 font-bold">₹{Number(order.totalAmount).toFixed(0)}</td>
        <td className="p-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}
          >
            {order.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="p-4 text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleTimeString()}
        </td>
        <td className="p-4">
          <div className="flex gap-2">
            {NEXT_STATUS[order.status] && (
              <button
                onClick={() => onStatusUpdate(order.id, NEXT_STATUS[order.status])}
                className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 transition-colors"
              >
                Mark {NEXT_STATUS[order.status].replace(/_/g, ' ')}
              </button>
            )}
            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
              <button
                onClick={() => onStatusUpdate(order.id, 'CANCELLED')}
                className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </td>
        <td className="p-4">
          <div className="flex gap-1">
            <button
              onClick={handlePrintReceipt}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Print Receipt"
            >
              <Icon icon="solar:printer-bold" className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handlePrintKitchen}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Print Kitchen Ticket"
            >
              <Icon icon="solar:chef-hat-bold" className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </td>
        <td className="p-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon
              icon={expanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
              width={20}
            />
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b dark:border-gray-700">
          <td colSpan={8} className="p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 shadow-sm">
              <h4 className="text-sm font-bold mb-3 border-b dark:border-gray-700 pb-2">
                Order Items
              </h4>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex gap-4">
                      <span className="font-semibold w-8 text-gray-400">x{item.quantity}</span>
                      <span>{item.menuItem?.name}</span>
                    </div>
                    <span className="font-mono text-gray-600 dark:text-gray-400">
                      ₹{(Number(item.price) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <div className="text-sm text-gray-500 italic">
                    No item data recorded for this legacy order.
                  </div>
                )}
              </div>
              <div className="mt-4 pt-2 border-t dark:border-gray-700 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{Number(order.totalAmount).toFixed(0)}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
