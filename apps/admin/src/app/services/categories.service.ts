import api from '@/utils/api';

export const categoriesService = {
    findAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    create: async (data: { name: string; description?: string; slug?: string }) => {
        const response = await api.post('/categories', data);
        return response.data;
    },

    update: async (id: string, data: { name?: string; description?: string; slug?: string }) => {
        const response = await api.patch(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};
