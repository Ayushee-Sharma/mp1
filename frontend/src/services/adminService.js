import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getDoctors: async () => {
    const response = await api.get('/admin/doctors');
    return response.data;
  },

  getPatients: async () => {
    const response = await api.get('/admin/patients');
    return response.data;
  },

  toggleDoctorStatus: async (id) => {
    const response = await api.patch(`/admin/doctors/${id}/toggle-status`);
    return response.data;
  },
};
