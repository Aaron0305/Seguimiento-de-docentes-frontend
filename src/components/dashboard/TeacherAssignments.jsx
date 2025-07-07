import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    Grid,
    Divider,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Schedule,
    CheckCircle,
    Warning,
    Search,
    FilterList,
    Refresh,
    Visibility,
    Done,
    Close,
    CalendarToday
} from '@mui/icons-material';
import { getTeacherAssignmentStats, getTeacherAssignments, markAssignmentCompleted } from '../../services/assignmentService';

const TeacherAssignments = () => {
    // Estados principales
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para filtros
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('-createdAt');
    
    // Estados para paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Estados para diálogos
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Cargar estadísticas al montar el componente
    useEffect(() => {
        loadStats();
    }, []);

    // Cargar asignaciones cuando cambian los filtros
    useEffect(() => {
        loadAssignments();
    }, [statusFilter, searchTerm, sortBy, page]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadStats = async () => {
        try {
            const response = await getTeacherAssignmentStats();
            if (response.success) {
                setStats(response.stats);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    const loadAssignments = async () => {
        try {
            setLoading(true);
            setError(''); // Limpiar errores anteriores
            
            const params = {
                status: statusFilter,
                search: searchTerm,
                sort: sortBy,
                page: page,
                limit: 6
            };

            console.log('🔄 TeacherAssignments - Cargando asignaciones con parámetros:', params);

            const response = await getTeacherAssignments(params);
            
            console.log('📥 TeacherAssignments - Respuesta completa:', response);
            
            if (response.success) {
                console.log('✅ Respuesta exitosa, actualizando estado con asignaciones:', response.assignments?.length || 0);
                setAssignments(response.assignments || []);
                setTotalPages(response.pagination?.totalPages || 1);
                
                // Log del estado después de actualizar
                setTimeout(() => {
                    console.log('📊 Estado actualizado - assignments.length:', assignments.length);
                }, 100);
            } else {
                console.log('❌ Respuesta no exitosa:', response);
                setError('La respuesta del servidor no fue exitosa');
            }
        } catch (error) {
            console.error('❌ Error cargando asignaciones:', error);
            setError('Error al cargar las asignaciones: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteAssignment = async (assignmentId) => {
        try {
            setActionLoading(true);
            setError(''); // Limpiar errores anteriores
            
            console.log('🔄 Marcando asignación como completada:', assignmentId);
            
            const response = await markAssignmentCompleted(assignmentId);
            
            console.log('✅ Respuesta del servidor:', response);
            
            if (response.success) {
                console.log('✅ Asignación completada exitosamente');
                await loadAssignments();
                await loadStats();
                setShowDetailDialog(false);
                
                // Mostrar mensaje de éxito
                setError(''); // Limpiar cualquier error anterior
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error completando asignación:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error al marcar como completada';
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status, dueDate, closeDate) => {
        if (status === 'completed') return 'success';
        
        const now = new Date();
        const due = new Date(dueDate);
        const close = new Date(closeDate);
        
        if (now > close) return 'error'; // Asignación cerrada
        if (now > due) return 'warning'; // Vencida pero aún abierta
        
        // Próxima a vencer
        const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 1) return 'error'; // Vence hoy o mañana
        if (daysUntilDue <= 3) return 'warning'; // Vence en 2-3 días
        
        return 'primary';
    };

    const getStatusLabel = (status, dueDate, closeDate) => {
        if (status === 'completed') return 'Completada';
        if (status === 'pending') {
            const now = new Date();
            const due = new Date(dueDate);
            const close = new Date(closeDate);
            
            if (now > close) return 'Cerrada - No entregada';
            if (now > due) return 'Vencida - Aún puede entregar';
            
            // Calcular tiempo restante
            const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue <= 0) {
                return 'Vence hoy';
            } else if (daysUntilDue === 1) {
                return 'Vence mañana';
            } else {
                return `${daysUntilDue} días restantes`;
            }
        }
        return status;
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString || dateString === 'Invalid Date') {
                return 'Fecha no válida';
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Fecha no válida';
            }
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha no válida';
        }
    };

    const formatDateWithTime = (dateString) => {
        try {
            if (!dateString || dateString === 'Invalid Date') {
                return 'Fecha no válida';
            }
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Fecha no válida';
            }
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formateando fecha con hora:', error);
            return 'Fecha no válida';
        }
    };

    const formatTimeRemaining = (dueDate, closeDate) => {
        try {
            if (!dueDate || !closeDate) {
                return 'Fechas no válidas';
            }
            
            const now = new Date();
            const due = new Date(dueDate);
            const close = new Date(closeDate);
            
            // Verificar que las fechas sean válidas
            if (isNaN(due.getTime()) || isNaN(close.getTime())) {
                return 'Fechas no válidas';
            }
            
            if (now > close) return 'Cerrada - No se puede entregar';
            if (now > due) {
                const diffTime = close - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 0) return 'Cerrada';
                if (diffDays === 0) return 'Cierra hoy - ¡Entrega tarde!';
                return `${diffDays} días para cierre - Entrega tardía`;
            }
            
            const diffTime = due - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return 'Vencida';
            if (diffDays === 0) return 'Vence hoy';
            if (diffDays === 1) return 'Vence mañana';
            return `${diffDays} días restantes`;
        } catch (error) {
            console.error('Error calculando tiempo restante:', error);
            return 'Error en fechas';
        }
    };

    // Log para debug - ver estado actual
    console.log('🎨 TeacherAssignments - Renderizando con estado:', {
        loading,
        assignmentsLength: assignments.length,
        error,
        statusFilter,
        searchTerm,
        page,
        totalPages
    });

    if (loading && assignments.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header con estadísticas */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Badge badgeContent={stats.total} color="primary" max={99}>
                                    <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
                                </Badge>
                                <Typography variant="h6">{stats.total}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Badge badgeContent={stats.pending} color="warning" max={99}>
                                    <Schedule color="warning" sx={{ fontSize: 40 }} />
                                </Badge>
                                <Typography variant="h6">{stats.pending}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Pendientes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Badge badgeContent={stats.completed} color="success" max={99}>
                                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                                </Badge>
                                <Typography variant="h6">{stats.completed}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Completadas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Badge badgeContent={stats.overdue} color="error" max={99}>
                                    <Warning color="error" sx={{ fontSize: 40 }} />
                                </Badge>
                                <Typography variant="h6">{stats.overdue}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Vencidas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Controles de filtrado */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="all">Todas</MenuItem>
                            <MenuItem value="pending">Pendientes</MenuItem>
                            <MenuItem value="completed">Completadas</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Buscar asignaciones"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Ordenar por"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="-createdAt">Más recientes</MenuItem>
                            <MenuItem value="createdAt">Más antiguas</MenuItem>
                            <MenuItem value="dueDate">Fecha de entrega</MenuItem>
                            <MenuItem value="title">Título A-Z</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={loadAssignments}
                            startIcon={<Refresh />}
                            disabled={loading}
                        >
                            Actualizar
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Lista de asignaciones */}
            {assignments.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No tienes asignaciones
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Cuando tengas asignaciones aparecerán aquí
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {assignments.map((assignment) => {
                        const isOverdue = assignment.status === 'pending' && new Date(assignment.dueDate) < new Date();
                        const status = isOverdue ? 'overdue' : assignment.status;
                        
                        return (
                            <Grid item xs={12} md={6} key={assignment._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                            <Typography variant="h6" component="h2" sx={{ flexGrow: 1, mr: 1 }}>
                                                {assignment.title}
                                            </Typography>
                                            <Chip
                                                label={getStatusLabel(status, assignment.dueDate, assignment.closeDate)}
                                                color={getStatusColor(status, assignment.dueDate, assignment.closeDate)}
                                                size="small"
                                            />
                                        </Box>
                                        
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {assignment.description.length > 100
                                                ? `${assignment.description.substring(0, 100)}...`
                                                : assignment.description
                                            }
                                        </Typography>

                                        <Box display="flex" alignItems="center" mb={1}>
                                            <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Vence: {formatDateWithTime(assignment.dueDate)}
                                            </Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center" mb={1}>
                                            <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'error.main' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Cierra: {formatDateWithTime(assignment.closeDate)}
                                            </Typography>
                                        </Box>

                                        {assignment.status === 'pending' && (
                                            <Typography
                                                variant="body2"
                                                color={isOverdue ? 'error' : 'warning.main'}
                                                sx={{ fontWeight: 'medium' }}
                                            >
                                                {formatTimeRemaining(assignment.dueDate, assignment.closeDate)}
                                            </Typography>
                                        )}

                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Creado por: {assignment.createdBy?.nombre} {assignment.createdBy?.apellidoPaterno}
                                        </Typography>
                                    </CardContent>

                                    <CardActions>
                                        <Button
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => {
                                                setSelectedAssignment(assignment);
                                                setShowDetailDialog(true);
                                            }}
                                        >
                                            Ver detalles
                                        </Button>
                                        
                                        {assignment.status === 'pending' && (
                                            (() => {
                                                const now = new Date();
                                                const closeDate = new Date(assignment.closeDate);
                                                const isClosed = now > closeDate;
                                                
                                                return (
                                                    <Button
                                                        size="small"
                                                        color={isClosed ? "error" : "success"}
                                                        startIcon={<Done />}
                                                        onClick={() => {
                                                            if (isClosed) {
                                                                setError('Esta asignación ya ha cerrado. No se pueden realizar entregas.');
                                                                setTimeout(() => setError(''), 5000);
                                                            } else {
                                                                handleCompleteAssignment(assignment._id);
                                                            }
                                                        }}
                                                        disabled={actionLoading}
                                                        variant={isClosed ? "outlined" : "contained"}
                                                    >
                                                        {isClosed ? 'Cerrada' : 'Completar'}
                                                    </Button>
                                                );
                                            })()
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Anterior
                    </Button>
                    <Typography sx={{ mx: 2, alignSelf: 'center' }}>
                        Página {page} de {totalPages}
                    </Typography>
                    <Button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Siguiente
                    </Button>
                </Box>
            )}

            {/* Diálogo de detalles */}
            <Dialog
                open={showDetailDialog}
                onClose={() => setShowDetailDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedAssignment && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">
                                    {selectedAssignment.title}
                                </Typography>
                                <IconButton onClick={() => setShowDetailDialog(false)}>
                                    <Close />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box mb={2}>
                                <Chip
                                    label={getStatusLabel(selectedAssignment.status, selectedAssignment.dueDate, selectedAssignment.closeDate)}
                                    color={getStatusColor(selectedAssignment.status, selectedAssignment.dueDate, selectedAssignment.closeDate)}
                                />
                            </Box>
                            
                            <Typography variant="body1" paragraph>
                                {selectedAssignment.description}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Fecha de entrega
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDateWithTime(selectedAssignment.dueDate)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Fecha de cierre
                                    </Typography>
                                    <Typography variant="body2" color="error.main">
                                        {formatDateWithTime(selectedAssignment.closeDate)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Creado por
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedAssignment.createdBy?.nombre} {selectedAssignment.createdBy?.apellidoPaterno}
                                        {selectedAssignment.createdBy?.role && (
                                            <Typography component="span" variant="caption" color="primary" sx={{ ml: 1 }}>
                                                ({selectedAssignment.createdBy.role === 'admin' ? 'Administrador' : 'Docente'})
                                            </Typography>
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Fecha de creación
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDate(selectedAssignment.createdAt)}
                                    </Typography>
                                </Grid>
                                {selectedAssignment.completedAt && (
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Completado el
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(selectedAssignment.completedAt)}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>

                            {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Archivos adjuntos
                                    </Typography>
                                    {selectedAssignment.attachments.map((file, index) => (
                                        <Chip
                                            key={index}
                                            label={file.fileName}
                                            onClick={() => window.open(`http://localhost:3001/${file.fileUrl}`, '_blank')}
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            {selectedAssignment.status === 'pending' && (
                                (() => {
                                    const now = new Date();
                                    const dueDate = new Date(selectedAssignment.dueDate);
                                    const closeDate = new Date(selectedAssignment.closeDate);
                                    const isClosed = now > closeDate;
                                    const isOverdue = now > dueDate && !isClosed;
                                    
                                    // Si la asignación está cerrada, no mostrar botón
                                    if (isClosed) {
                                        return null;
                                    }
                                    
                                    return (
                                        <Button
                                            color={isOverdue ? "warning" : "success"}
                                            variant="contained"
                                            startIcon={<Done />}
                                            onClick={() => handleCompleteAssignment(selectedAssignment._id)}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading 
                                                ? 'Completando...' 
                                                : (isOverdue ? 'Entregar con retraso' : 'Marcar como completada')
                                            }
                                        </Button>
                                    );
                                })()
                            )}
                            <Button onClick={() => setShowDetailDialog(false)}>
                                Cerrar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default TeacherAssignments;
