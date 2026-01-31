import api from '@/utils/api';

export interface User {
    id: number | string;
    email: string;
    firstName: string;
    lastName: string;
    role: {
        id: number;
        name: string;
    };
    status: {
        id: number;
        name: string;
    };
}

export const usersService = {
    findAll: async (page = 1, limit = 10) => {
        const response = await api.get('/users', {
            params: { page, limit },
        });
        return response.data;
    },
    delete: async (id: number | string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },
};
