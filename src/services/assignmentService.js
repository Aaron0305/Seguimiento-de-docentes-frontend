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

// Obtener estadísticas de todos los profesores
export const getAllTeachersStats = async () => {
    try {
        const response = await axios.get('/api/assignments/teachers/stats');
        return response.data;
    } catch (error) {
        console.error('Error getting all teachers stats:', error);
        throw error;
    }
};

// ========== FUNCIONES PARA ADMINISTRADOR ==========

// Obtener todas las asignaciones para administrador con filtros
export const getAdminAllAssignments = async (params = {}) => {
    try {
        console.log('📤 getAdminAllAssignments - Parámetros enviados:', params);
        
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);
        if (params.teacherId) queryParams.append('teacherId', params.teacherId);
        
        const url = `${BASE_URL}/assignments/admin/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        console.log('🔗 URL construida:', url);
        console.log('🔑 Headers:', getAuthHeaders());
        
        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Respuesta recibida:', {
            success: response.data.success,
            totalAsignaciones: response.data.data?.assignments?.length || 0,
            paginacion: response.data.data?.pagination
        });
        
        return response.data;
    } catch (error) {
        console.error('❌ Error obteniendo todas las asignaciones para admin:', error);
        
        if (error.response) {
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
    }
};

// Marcar asignación como completada desde admin
export const markAssignmentCompletedByAdmin = async (assignmentId) => {
    try {
        console.log('📤 Admin marcando asignación como completada:', assignmentId);
        
        const response = await axios.patch(`${BASE_URL}/assignments/admin/${assignmentId}/complete`, {}, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Respuesta recibida:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en markAssignmentCompletedByAdmin:', error);
        
        if (error.response) {
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
    }
};

// Obtener estadísticas de asignaciones para administrador
export const getAdminAssignmentStats = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/assignments/admin/stats`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo estadísticas de asignaciones para admin:', error);
        throw error;
    }
};

// Actualizar asignación desde admin
export const updateAssignmentByAdmin = async (assignmentId, updateData) => {
    try {
        console.log('📤 Admin actualizando asignación:', assignmentId, updateData);
        
        const response = await axios.put(`${BASE_URL}/assignments/admin/${assignmentId}`, updateData, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Respuesta recibida:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en updateAssignmentByAdmin:', error);
        
        if (error.response) {
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
    }
};

// Programar una nueva asignación
export const scheduleAssignment = async (assignmentData) => {
    try {
        console.log('📤 Programando nueva asignación:', assignmentData);
        
        const response = await axios.post(`${BASE_URL}/assignments/admin/schedule`, assignmentData, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Respuesta de asignación programada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en scheduleAssignment:', error);
        
        if (error.response) {
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
    }
};

// Obtener asignaciones programadas
export const getScheduledAssignments = async (params = {}) => {
    try {
        console.log('📤 Obteniendo asignaciones programadas:', params);
        
        const queryParams = new URLSearchParams();
        
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.page) queryParams.append('page', params.page);
        
        const url = `${BASE_URL}/assignments/admin/scheduled${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await axios.get(url, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Asignaciones programadas recibidas:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en getScheduledAssignments:', error);
        
        if (error.response) {
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
    }
};

// Cancelar una asignación programada
export const cancelScheduledAssignment = async (assignmentId) => {
    try {
        console.log('📤 Cancelando asignación programada:', assignmentId);
        
        const response = await axios.delete(`${BASE_URL}/assignments/admin/scheduled/${assignmentId}`, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Asignación programada cancelada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en cancelScheduledAssignment:', error);
        
        if (error.response) {
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
    }
};

// Editar una asignación programada
export const updateScheduledAssignment = async (assignmentId, updateData) => {
    try {
        console.log('📤 Actualizando asignación programada:', assignmentId, updateData);
        
        const response = await axios.put(`${BASE_URL}/assignments/admin/scheduled/${assignmentId}`, updateData, {
            headers: getAuthHeaders()
        });
        
        console.log('📥 Asignación programada actualizada:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error en updateScheduledAssignment:', error);
        
        if (error.response) {
            const errorData = error.response.data;
            console.error('❌ Error del servidor:', errorData);
            throw {
                response: {
                    data: errorData
                },
                message: errorData.error || 'Error del servidor'
            };
        } else if (error.request) {
            console.error('❌ No hay respuesta del servidor');
            throw {
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            console.error('❌ Error al configurar la petición:', error.message);
            throw {
                message: error.message || 'Error desconocido'
            };
        }
    }
};

export default {
    getTeacherAssignmentStats,
    getTeacherAssignments,
    markAssignmentCompleted,
    getMyAssignments,
    getAssignmentById,
    getAllTeachersStats,
    // Funciones para administrador
    getAdminAllAssignments,
    markAssignmentCompletedByAdmin,
    getAdminAssignmentStats,
    updateAssignmentByAdmin,
    // Funciones para asignaciones programadas
    scheduleAssignment,
    getScheduledAssignments,
    cancelScheduledAssignment,
    updateScheduledAssignment
};
