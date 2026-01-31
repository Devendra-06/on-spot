import api from '@/utils/api';

export interface Order {
    id: string;
    totalAmount: number;
    status: 'PENDING' | 'ACCEPTED' | 'COOKING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    items?: {
        id: string;
        quantity: number;
        price: number;
        menuItem: {
            name: string;
        };
    }[];
}

export const ordersService = {
    getAll: async () => {
        const response = await api.get('/orders');
        return response.data;
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/orders/${id}`, { status });
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    }
};
