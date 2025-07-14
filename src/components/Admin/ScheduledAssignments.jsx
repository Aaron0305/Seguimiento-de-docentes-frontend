import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
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
    Badge,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    Fab
} from '@mui/material';
import {
    Schedule,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility,
    Search,
    Refresh,
    CalendarToday,
    AccessTime,
    Warning,
    CheckCircle,
    Pending,
    Close,
    Event,
    Publish,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { 
    getScheduledAssignments, 
    cancelScheduledAssignment,
    scheduleAssignment,
    updateScheduledAssignment
} from '../../services/assignmentService';
import ScheduleAssignment from './ScheduleAssignment';

const ScheduledAssignments = ({ open, onClose, teachers = [] }) => {
    const theme = useTheme();
    
    // Estados principales
    const [scheduledAssignments, setScheduledAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para filtros
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('-publishDate');
    
    // Estados para paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Estados para diálogos
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [assignmentToEdit, setAssignmentToEdit] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Cargar datos cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            loadScheduledAssignments();
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Recargar asignaciones cuando cambian los filtros
    useEffect(() => {
        if (open) {
            loadScheduledAssignments();
        }
    }, [statusFilter, searchTerm, sortBy, page, open]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadScheduledAssignments = async () => {
        try {
            setLoading(true);
            setError('');
            
            const params = {
                status: statusFilter,
                search: searchTerm,
                sort: sortBy,
                page: page,
                limit: 10
            };

            const response = await getScheduledAssignments(params);
            
            if (response.success) {
                setScheduledAssignments(response.data?.assignments || []);
                setTotalPages(response.data?.pagination?.pages || 1);
            } else {
                setError('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error loading scheduled assignments:', error);
            setError('Error cargando asignaciones programadas: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadScheduledAssignments();
    };

    const handleNewScheduledAssignment = async (assignmentData) => {
        try {
            setActionLoading(true);
            setError('');
            
            const response = await scheduleAssignment(assignmentData);
            
            if (response.success) {
                await loadScheduledAssignments();
                setShowScheduleDialog(false);
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error scheduling assignment:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error programando asignación';
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelScheduledAssignment = async (assignmentId) => {
        try {
            setActionLoading(true);
            setError('');
            
            const response = await cancelScheduledAssignment(assignmentId);
            
            if (response.success) {
                await loadScheduledAssignments();
                setShowDetailDialog(false);
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error canceling scheduled assignment:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error cancelando asignación';
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditAssignment = (assignment) => {
        console.log('📝 Editando asignación:', assignment);
        setAssignmentToEdit(assignment);
        setShowEditDialog(true);
    };

    const handleUpdateScheduledAssignment = async (assignmentData) => {
        try {
            setActionLoading(true);
            setError('');
            
            console.log('🔄 Actualizando asignación programada:', assignmentData);
            
            const response = await updateScheduledAssignment(assignmentData.id, assignmentData);
            
            if (response.success) {
                console.log('✅ Asignación actualizada exitosamente');
                await loadScheduledAssignments();
                setShowEditDialog(false);
                setAssignmentToEdit(null);
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error actualizando asignación programada:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error actualizando asignación';
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseEditDialog = () => {
        setShowEditDialog(false);
        setAssignmentToEdit(null);
    };

    const getStatusColor = (status, publishDate) => {
        const now = new Date();
        const publishTime = new Date(publishDate);
        
        switch (status) {
            case 'scheduled':
                if (publishTime <= now) return 'warning'; // Debería haberse publicado
                return 'primary';
            case 'published':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status, publishDate) => {
        const now = new Date();
        const publishTime = new Date(publishDate);
        
        switch (status) {
            case 'scheduled': {
                if (publishTime <= now) {
                    return 'Pendiente de publicación';
                }
                const hoursUntilPublish = Math.ceil((publishTime - now) / (1000 * 60 * 60));
                if (hoursUntilPublish < 24) {
                    return `Se publica en ${hoursUntilPublish}h`;
                }
                const daysUntilPublish = Math.ceil(hoursUntilPublish / 24);
                return `Se publica en ${daysUntilPublish} días`;
            }
            case 'published':
                return 'Publicada';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString || dateString === 'Invalid Date') return 'Fecha inválida';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Fecha inválida';
        }
    };

    const getStatusStats = () => {
        return {
            total: scheduledAssignments.length,
            scheduled: scheduledAssignments.filter(a => a.status === 'scheduled').length,
            published: scheduledAssignments.filter(a => a.status === 'published').length,
            cancelled: scheduledAssignments.filter(a => a.status === 'cancelled').length
        };
    };

    const stats = getStatusStats();

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                        minHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    py: 2,
                    px: 3,
                    background: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Schedule sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Asignaciones Programadas
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={onClose}
                        sx={{ color: 'white' }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {/* Estadísticas */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                            { 
                                icon: <Event sx={{ fontSize: 32 }} />, 
                                value: stats.total, 
                                label: 'Total',
                                color: 'primary',
                                filterValue: 'all'
                            },
                            { 
                                icon: <Pending sx={{ fontSize: 32 }} />, 
                                value: stats.scheduled, 
                                label: 'Programadas',
                                color: 'warning',
                                filterValue: 'scheduled'
                            },
                            { 
                                icon: <CheckCircle sx={{ fontSize: 32 }} />, 
                                value: stats.published, 
                                label: 'Publicadas',
                                color: 'success',
                                filterValue: 'published'
                            },
                            { 
                                icon: <CancelIcon sx={{ fontSize: 32 }} />, 
                                value: stats.cancelled, 
                                label: 'Canceladas',
                                color: 'error',
                                filterValue: 'cancelled'
                            }
                        ].map((stat, index) => (
                            <Grid item xs={6} sm={3} key={index}>
                                <Card 
                                    onClick={() => {
                                        setStatusFilter(stat.filterValue);
                                        setPage(1);
                                    }}
                                    sx={{ 
                                        height: '100%', 
                                        borderRadius: 2,
                                        boxShadow: theme.shadows[3],
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: statusFilter === stat.filterValue ? `2px solid ${theme.palette[stat.color].main}` : 'none',
                                        '&:hover': {
                                            boxShadow: theme.shadows[6],
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                        <Badge 
                                            badgeContent={stat.value} 
                                            color={stat.color} 
                                            max={999}
                                        >
                                            {React.cloneElement(stat.icon, { 
                                                color: stat.color,
                                                sx: { fontSize: 32 }
                                            })}
                                        </Badge>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            {stat.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Controles de filtros */}
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Buscar asignaciones programadas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Estado"
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <MenuItem value="all">Todos</MenuItem>
                                        <MenuItem value="scheduled">Programadas</MenuItem>
                                        <MenuItem value="published">Publicadas</MenuItem>
                                        <MenuItem value="cancelled">Canceladas</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Ordenar por</InputLabel>
                                    <Select
                                        value={sortBy}
                                        label="Ordenar por"
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <MenuItem value="-publishDate">Fecha de publicación (desc)</MenuItem>
                                        <MenuItem value="publishDate">Fecha de publicación (asc)</MenuItem>
                                        <MenuItem value="-createdAt">Más recientes</MenuItem>
                                        <MenuItem value="createdAt">Más antiguas</MenuItem>
                                        <MenuItem value="title">Título A-Z</MenuItem>
                                        <MenuItem value="-title">Título Z-A</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    startIcon={<Refresh />}
                                >
                                    Actualizar
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setShowScheduleDialog(true)}
                                    startIcon={<AddIcon />}
                                >
                                    Nueva
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Mensajes de error */}
                    <AnimatePresence>
                        {error && (
                            <Alert 
                                severity="error" 
                                sx={{ mb: 2 }} 
                                onClose={() => setError('')}
                                variant="filled"
                            >
                                {error}
                            </Alert>
                        )}
                    </AnimatePresence>

                    {/* Tabla de asignaciones programadas */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                            <CircularProgress size={60} />
                        </Box>
                    ) : scheduledAssignments.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                            <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No hay asignaciones programadas
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Programa tu primera asignación para publicación automática
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<AddIcon />}
                                onClick={() => setShowScheduleDialog(true)}
                            >
                                Programar Asignación
                            </Button>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Publicación</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Entrega</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Docentes Asignados</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {scheduledAssignments.map((assignment) => (
                                        <TableRow 
                                            key={assignment._id}
                                            hover
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                borderLeft: `4px solid ${theme.palette[getStatusColor(assignment.status, assignment.publishDate)].main}`
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                                                    {assignment.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ 
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {assignment.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(assignment.status, assignment.publishDate)}
                                                    color={getStatusColor(assignment.status, assignment.publishDate)}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {formatDate(assignment.publishDate)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {formatDate(assignment.dueDate)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {assignment.assignToAll 
                                                        ? 'Todos los docentes'
                                                        : `${assignment.assignedTo?.length || 0} docentes`
                                                    }
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title="Ver Detalles">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedAssignment(assignment);
                                                                setShowDetailDialog(true);
                                                            }}
                                                            color="primary"
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                    </Tooltip>
                                                    
                                                    {assignment.status === 'scheduled' && (
                                                        <>
                                                            <Tooltip title="Editar">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleEditAssignment(assignment)}
                                                                    color="info"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancelar">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleCancelScheduledAssignment(assignment._id)}
                                                                    color="error"
                                                                    disabled={actionLoading}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <Box display="flex" justifyContent="center" mt={2}>
                            <Button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                variant="outlined"
                                sx={{ mr: 2 }}
                            >
                                Anterior
                            </Button>
                            <Typography sx={{ px: 2, py: 1, alignSelf: 'center' }}>
                                Página {page} de {totalPages}
                            </Typography>
                            <Button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                variant="outlined"
                                sx={{ ml: 2 }}
                            >
                                Siguiente
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Diálogo para programar nueva asignación */}
            <ScheduleAssignment
                open={showScheduleDialog}
                onClose={() => setShowScheduleDialog(false)}
                teachers={teachers}
                onSave={handleNewScheduledAssignment}
                loading={actionLoading}
            />

            {/* Diálogo para editar asignación programada */}
            <ScheduleAssignment
                open={showEditDialog}
                onClose={handleCloseEditDialog}
                teachers={teachers}
                onSave={handleUpdateScheduledAssignment}
                loading={actionLoading}
                editMode={true}
                assignmentToEdit={assignmentToEdit}
            />

            {/* Diálogo de detalles */}
            <Dialog
                open={showDetailDialog}
                onClose={() => setShowDetailDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`
                    }
                }}
            >
                {selectedAssignment && (
                    <>
                        <DialogTitle sx={{ 
                            py: 2,
                            px: 3,
                            background: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {selectedAssignment.title}
                            </Typography>
                            <IconButton 
                                onClick={() => setShowDetailDialog(false)}
                                sx={{ color: 'white' }}
                            >
                                <Close />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 3 }}>
                            <Box mb={2}>
                                <Chip
                                    label={getStatusLabel(selectedAssignment.status, selectedAssignment.publishDate)}
                                    color={getStatusColor(selectedAssignment.status, selectedAssignment.publishDate)}
                                    sx={{ 
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1
                                    }}
                                />
                            </Box>
                            
                            <Typography variant="body1" paragraph sx={{ 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6
                            }}>
                                {selectedAssignment.description}
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ 
                                        mb: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.main'
                                    }}>
                                        Fechas de Programación
                                    </Typography>
                                    <Box sx={{ 
                                        p: 2,
                                        borderRadius: 2,
                                        background: theme.palette.grey[50],
                                        boxShadow: theme.shadows[1]
                                    }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Publicación:</strong> {formatDate(selectedAssignment.publishDate)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Entrega:</strong> {formatDate(selectedAssignment.dueDate)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Cierre:</strong> {formatDate(selectedAssignment.closeDate)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ 
                                        mb: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.main'
                                    }}>
                                        Asignación de Docentes
                                    </Typography>
                                    <Box sx={{ 
                                        p: 2,
                                        borderRadius: 2,
                                        background: theme.palette.grey[50],
                                        boxShadow: theme.shadows[1]
                                    }}>
                                        {selectedAssignment.assignToAll ? (
                                            <Typography variant="body2">
                                                Todos los docentes registrados en el sistema
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2">
                                                {selectedAssignment.assignedTo?.length || 0} docentes específicos
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ 
                            p: 2,
                            borderTop: `1px solid ${theme.palette.divider}`
                        }}>
                            {selectedAssignment.status === 'scheduled' && (
                                <Button
                                    color="error"
                                    variant="contained"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleCancelScheduledAssignment(selectedAssignment._id)}
                                    disabled={actionLoading}
                                    sx={{ mr: 1 }}
                                >
                                    {actionLoading ? 'Cancelando...' : 'Cancelar Programación'}
                                </Button>
                            )}
                            <Button 
                                onClick={() => setShowDetailDialog(false)}
                                variant="outlined"
                            >
                                Cerrar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
};

export default ScheduledAssignments;
