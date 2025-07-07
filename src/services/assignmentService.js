import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

// Configurar interceptor para incluir el token automáticamente
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtener estadísticas de asignaciones del docente
export const getTeacherAssignmentStats = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/assignments/teacher/stats`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo estadísticas de asignaciones:', error);
        throw error;
    }
};

// Obtener asignaciones del docente con filtros
export const getTeacherAssignments = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);
        
        const url = `${BASE_URL}/assignments/teacher/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo asignaciones del docente:', error);
        throw error;
    }
};

// Marcar asignación como completada
export const markAssignmentCompleted = async (assignmentId) => {
    try {
        const response = await axios.patch(`${BASE_URL}/assignments/teacher/${assignmentId}/complete`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error marcando asignación como completada:', error);
        throw error;
    }
};

// Obtener todas las asignaciones del docente (endpoint original)
export const getMyAssignments = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/assignments/my-assignments`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo mis asignaciones:', error);
        throw error;
    }
};

// Obtener detalles de una asignación específica
export const getAssignmentById = async (assignmentId) => {
    try {
        const response = await axios.get(`${BASE_URL}/assignments/${assignmentId}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo detalles de la asignación:', error);
        throw error;
    }
};

export default {
    getTeacherAssignmentStats,
    getTeacherAssignments,
    markAssignmentCompleted,
    getMyAssignments,
    getAssignmentById
};
