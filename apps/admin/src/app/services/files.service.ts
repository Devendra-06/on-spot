import api from '@/utils/api';

export const filesService = {
    upload: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/files/upload', formData);
        return response.data;
    },
};
