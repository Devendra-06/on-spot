'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Button } from '@/components/ui/button';

const Notifications = () => {
  const {
    notifications,
    pendingCount,
    unreadCount,
    hasPermission,
    markAsRead,
    markAllAsRead,
    requestPermission,
  } = useOrderNotifications();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative group/menu px-15">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative border-none bg-transparent p-0">
            <span
              className={`relative after:absolute after:w-10 after:h-10 after:rounded-full hover:text-primary after:-top-1/2 hover:after:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:text-primary ${
                pendingCount > 0 ? 'animate-pulse' : ''
              }`}
            >
              <Icon icon="tabler:bell-ringing" height={20} />
            </span>
            {(pendingCount > 0 || unreadCount > 0) && (
              <span className="rounded-full absolute -end-[6px] -top-[5px] text-[10px] h-5 w-5 bg-red-500 text-white flex justify-center items-center font-bold">
                {pendingCount > 0 ? pendingCount : unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-screen sm:w-[360px] py-4 rounded-sm">
          <div className="flex items-center px-4 justify-between border-b pb-3">
            <div>
              <h3 className="mb-0 text-lg font-semibold text-ld">Notifications</h3>
              {pendingCount > 0 && (
                <p className="text-xs text-orange-600">
                  {pendingCount} pending order{pendingCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {!hasPermission && (
            <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                Enable notifications to get alerts for new orders
              </p>
              <Button size="sm" variant="outline" onClick={requestPermission}>
                <Icon icon="solar:bell-bold" className="w-4 h-4 mr-1" />
                Enable
              </Button>
            </div>
          )}

          <SimpleBar className="max-h-80">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Icon
                  icon="solar:bell-off-linear"
                  className="w-10 h-10 mx-auto mb-2 opacity-50"
                />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs">New orders will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} asChild>
                  <Link
                    href="/orders"
                    onClick={() => markAsRead(notification.id)}
                    className={`px-4 py-3 flex items-start gap-3 w-full hover:bg-lightprimary hover:text-primary border-b border-gray-100 dark:border-gray-800 ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        !notification.read
                          ? 'bg-orange-100 dark:bg-orange-900/30'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Icon
                        icon="solar:bag-4-bold"
                        className={`w-5 h-5 ${
                          !notification.read
                            ? 'text-orange-600'
                            : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium truncate">
                          New Order #{notification.orderId.slice(0, 8)}
                        </h5>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        ${notification.orderAmount.toFixed(2)} from{' '}
                        {notification.customerName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </SimpleBar>

          {notifications.length > 0 && (
            <div className="px-4 pt-3 border-t">
              <Link
                href="/orders"
                className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
              >
                View all orders
                <Icon icon="solar:arrow-right-linear" className="w-4 h-4" />
              </Link>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Notifications;
