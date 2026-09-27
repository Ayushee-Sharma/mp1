import api from './api';

export const hospitalService = {
  getHospitals: async () => {
    const response = await api.get('/hospitals');
    return response.data;
  },

  getHospitalById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },
};
