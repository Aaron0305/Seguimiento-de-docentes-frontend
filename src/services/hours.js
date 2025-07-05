import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const getSummary = async (userId) => {
  try {
    if (!userId) {
      throw new Error('Usuario no proporcionado');
    }

    const response = await axios.get(`${API_URL}/hours/summary/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el resumen:', error);
    // Devolver datos por defecto si hay error
    return {
      totalHours: 0,
      totalDays: 0,
      averageHoursPerDay: 0
    };
  }
};

export const createHourRecord = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/hours/record`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al registrar horas');
  }
};
