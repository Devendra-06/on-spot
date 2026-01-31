'use client';
import { Order } from '@/app/services/orders.service';

interface Props {
  order: Order;
  restaurantName?: string;
  currencySymbol?: string;
}

const OrderPrintReceipt = ({ order, restaurantName = 'Restaurant', currencySymbol = '$' }: Props) => {
  const subtotal = order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <div className="print-receipt font-mono text-sm p-4 max-w-[300px] mx-auto bg-white">
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
        <h1 className="font-bold text-xl mb-1">{restaurantName}</h1>
        <p className="text-xs text-gray-600">Order Receipt</p>
        <p className="text-xs mt-2">Order #{order.id.slice(0, 8).toUpperCase()}</p>
        <p className="text-xs">
          {new Date(order.createdAt).toLocaleDateString()}{' '}
          {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </div>

      {/* Customer Info */}
      {order.user && (
        <div className="border-b border-dashed border-gray-300 pb-3 mb-3">
          <p className="text-xs font-bold mb-1">CUSTOMER:</p>
          <p className="text-xs">
            {order.user.firstName} {order.user.lastName}
          </p>
          {order.user.email && <p className="text-xs text-gray-600">{order.user.email}</p>}
        </div>
      )}

      {/* Order Items */}
      <div className="border-b border-dashed border-gray-300 pb-3 mb-3">
        <p className="text-xs font-bold mb-2">ITEMS:</p>
        <div className="space-y-1">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-xs">
              <span>
                {item.quantity}x {item.menuItem?.name || 'Item'}
              </span>
              <span>
                {currencySymbol}
                {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-xs">
          <span>Subtotal</span>
          <span>
            {currencySymbol}
            {subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-sm border-t border-gray-400 pt-2 mt-2">
          <span>TOTAL</span>
          <span>
            {currencySymbol}
            {Number(order.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-dashed border-gray-400 pt-4">
        <p className="text-xs">Thank you for your order!</p>
        <p className="text-xs text-gray-500 mt-2">
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default OrderPrintReceipt;
