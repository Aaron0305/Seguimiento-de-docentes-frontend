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
        console.log('📤 getTeacherAssignments - Parámetros enviados:', params);
        
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);
        
        const url = `${BASE_URL}/assignments/teacher/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        console.log('🔗 URL construida:', url);
        console.log('🔑 Headers:', getAuthHeaders());
        
        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Respuesta recibida:', {
            success: response.data.success,
            totalAsignaciones: response.data.assignments?.length || 0,
            paginacion: response.data.pagination
        });
        
        if (response.data.assignments?.length > 0) {
            console.log('📝 Primeras asignaciones recibidas:');
            response.data.assignments.slice(0, 3).forEach((assignment, index) => {
                console.log(`   ${index + 1}. ${assignment.title} - ${assignment.status}`);
            });
        } else {
            console.log('❌ No se recibieron asignaciones');
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ Error obteniendo asignaciones del docente:', error);
        throw error;
    }
};

// Marcar asignación como completada
export const markAssignmentCompleted = async (assignmentId) => {
    try {
        console.log('📤 Enviando petición para completar asignación:', assignmentId);
        
        const response = await axios.patch(`${BASE_URL}/assignments/teacher/${assignmentId}/complete`, {}, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Respuesta recibida:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en markAssignmentCompleted:', error);
        
        // Mejorar el manejo de errores
        if (error.response) {
            // El servidor respondió con un código de error
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            // La petición se hizo pero no hubo respuesta
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            // Algo más pasó al configurar la petición
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
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
