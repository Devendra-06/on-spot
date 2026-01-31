'use client';
import { Order } from '@/app/services/orders.service';

interface Props {
  order: Order;
}

const OrderKitchenTicket = ({ order }: Props) => {
  return (
    <div className="print-kitchen-ticket font-mono text-sm p-4 max-w-[300px] mx-auto bg-white">
      {/* Header - Large and Bold */}
      <div className="text-center border-b-4 border-black pb-3 mb-4">
        <p className="text-2xl font-black">KITCHEN</p>
        <p className="text-3xl font-black mt-2">#{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Time Info */}
      <div className="flex justify-between border-b-2 border-dashed border-gray-400 pb-2 mb-4">
        <div>
          <p className="text-xs text-gray-500">ORDER TIME</p>
          <p className="font-bold">{new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">DATE</p>
          <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer Name - if available */}
      {order.user && (
        <div className="bg-gray-100 p-2 mb-4 text-center">
          <p className="font-bold text-lg">
            {order.user.firstName} {order.user.lastName}
          </p>
        </div>
      )}

      {/* Order Items - Large and Clear */}
      <div className="space-y-3 mb-4">
        {order.items?.map((item, index) => (
          <div key={item.id} className="border-b border-gray-200 pb-2">
            <div className="flex items-start gap-3">
              <span className="bg-black text-white font-bold px-2 py-1 text-lg min-w-[40px] text-center">
                {item.quantity}x
              </span>
              <span className="font-bold text-lg flex-1">
                {item.menuItem?.name || 'Item'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Items Count */}
      <div className="border-t-4 border-black pt-3 text-center">
        <p className="text-xs text-gray-500">TOTAL ITEMS</p>
        <p className="text-2xl font-black">
          {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
        </p>
      </div>

      {/* Print Time */}
      <div className="text-center mt-4 text-xs text-gray-400">
        Printed: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default OrderKitchenTicket;
