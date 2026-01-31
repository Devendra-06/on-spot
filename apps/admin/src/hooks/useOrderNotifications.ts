'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ordersService, Order } from '@/app/services/orders.service';
import { toast } from 'sonner';

export interface OrderNotification {
  id: string;
  orderId: string;
  orderAmount: number;
  customerName: string;
  timestamp: Date;
  read: boolean;
}

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/new-order.mp3');
      audioRef.current.volume = 0.5;

      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          setHasPermission(true);
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            setHasPermission(permission === 'granted');
          });
        }
      }
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.log('Audio play failed:', e);
      });
    }
  }, []);

  const showBrowserNotification = useCallback(
    (order: Order) => {
      if (hasPermission && 'Notification' in window) {
        const notification = new Notification('New Order!', {
          body: `Order #${order.id.slice(0, 8)} - $${Number(order.totalAmount).toFixed(2)}`,
          icon: '/favicon.ico',
          tag: order.id,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
      }
    },
    [hasPermission]
  );

  const checkForNewOrders = useCallback(async () => {
    try {
      const orders = await ordersService.getAll();
      const pendingOrders = orders.filter((o: Order) => o.status === 'PENDING');

      setPendingCount(pendingOrders.length);

      if (!isInitializedRef.current) {
        pendingOrders.forEach((order: Order) => {
          lastOrderIdsRef.current.add(order.id);
        });
        isInitializedRef.current = true;
        return;
      }

      const newOrders = pendingOrders.filter(
        (order: Order) => !lastOrderIdsRef.current.has(order.id)
      );

      if (newOrders.length > 0) {
        playNotificationSound();

        newOrders.forEach((order: Order) => {
          lastOrderIdsRef.current.add(order.id);

          const newNotification: OrderNotification = {
            id: `notif-${order.id}`,
            orderId: order.id,
            orderAmount: Number(order.totalAmount),
            customerName: order.user?.firstName || order.user?.email || 'Guest',
            timestamp: new Date(),
            read: false,
          };

          setNotifications((prev) => [newNotification, ...prev].slice(0, 10));

          showBrowserNotification(order);

          toast.success(`New Order #${order.id.slice(0, 8)}`, {
            description: `$${Number(order.totalAmount).toFixed(2)} from ${newNotification.customerName}`,
            duration: 5000,
          });
        });
      }

      orders
        .filter((o: Order) => o.status !== 'PENDING')
        .forEach((order: Order) => {
          lastOrderIdsRef.current.delete(order.id);
        });
    } catch (error) {
      console.error('Failed to check for new orders:', error);
    }
  }, [playNotificationSound, showBrowserNotification]);

  useEffect(() => {
    checkForNewOrders();

    const interval = setInterval(checkForNewOrders, 5000);

    return () => clearInterval(interval);
  }, [checkForNewOrders]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
    }
  }, []);

  return {
    notifications,
    pendingCount,
    unreadCount: notifications.filter((n) => !n.read).length,
    hasPermission,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    requestPermission,
  };
}
