import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  getAppointments: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  updateStatus: async (id, status, notes = '') => {
    const response = await api.put(`/appointments/${id}/status`, { status, notes });
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  createPrescription: async (payload) => {
    const response = await api.post('/prescriptions', payload);
    return response.data;
  },

  getPrescriptions: async () => {
    const response = await api.get('/prescriptions');
    return response.data;
  },

  getPrescriptionById: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },
};
