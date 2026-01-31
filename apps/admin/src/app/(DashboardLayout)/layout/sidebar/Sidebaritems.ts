import { uniqueId } from 'lodash';

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  isPro?: boolean;
}

const SidebarContent: MenuItem[] = [
  {
    heading: 'Home',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-add-line-duotone',
        id: uniqueId(),
        url: '/',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Restaurant',
    children: [
      {
        name: 'Live Orders',
        icon: 'solar:cart-large-linear',
        id: uniqueId(),
        url: '/orders',
      },
      {
        name: 'Restaurant Profile',
        icon: 'solar:shop-linear',
        id: uniqueId(),
        url: '/restaurant-profile',
      },
    ],
  },
  {
    heading: 'Menu',
    children: [
      {
        name: 'Categories',
        icon: 'solar:layers-minimalistic-linear',
        id: uniqueId(),
        url: '/menu/categories',
      },
      {
        name: 'Menu Items',
        icon: 'solar:hamburger-menu-linear',
        id: uniqueId(),
        url: '/menu/items',
      },
      {
        name: 'Inventory',
        icon: 'solar:box-linear',
        id: uniqueId(),
        url: '/menu/inventory',
      },
    ],
  },
  {
    heading: 'Operations',
    children: [
      {
        name: 'Delivery Zones',
        icon: 'solar:map-point-linear',
        id: uniqueId(),
        url: '/delivery-zones',
      },
    ],
  },
  {
    heading: 'Settings',
    children: [
      {
        name: 'General Settings',
        icon: 'solar:settings-linear',
        id: uniqueId(),
        url: '/settings',
      },
      {
        name: 'Users',
        icon: 'solar:users-group-rounded-linear',
        id: uniqueId(),
        url: '/users',
      },
    ],
  },
];

export default SidebarContent;
