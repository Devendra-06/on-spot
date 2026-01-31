import api from '@/utils/api';

export const authService = {
    me: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    updateMe: async (data: any) => {
        const response = await api.patch('/auth/me', data);
        return response.data;
    },
};
