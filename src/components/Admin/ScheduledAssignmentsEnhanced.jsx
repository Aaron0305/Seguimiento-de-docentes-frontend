import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    IconButton,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Grid,
    TextField,
    Fab,
    Tooltip,
    Paper,
    Divider,
    InputAdornment,
    DialogActions
} from '@mui/material';
import { 
    Close, 
    Schedule, 
    Add, 
    Edit, 
    Delete,
    CalendarToday,
    Person,
    Refresh,
    Search,
    Visibility
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
    getScheduledAssignments
} from '../../services/assignmentService';

const ScheduledAssignments = ({ open, onClose, teachers = [] }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [scheduledAssignments, setScheduledAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (open) {
            loadScheduledAssignments();
        }
    }, [open]);

    const loadScheduledAssignments = async () => {
        try {
            setLoading(true);
            setError('');
            setIsRefreshing(true);
            console.log('🔄 Cargando asignaciones programadas...');
            
            const response = await getScheduledAssignments();
            console.log('📥 Respuesta recibida:', response);
            
            if (response.success) {
                setScheduledAssignments(response.data?.assignments || []);
                console.log('✅ Asignaciones programadas cargadas:', response.data?.assignments?.length || 0);
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error cargando asignaciones programadas:', error);
            setError('Error cargando asignaciones programadas: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadScheduledAssignments();
    };

    const handleViewDetails = (assignment) => {
        setSelectedAssignment(assignment);
        setShowDetailDialog(true);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'draft': return 'warning';
            case 'scheduled': return 'info';
            case 'expired': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Activa';
            case 'draft': return 'Borrador';
            case 'scheduled': return 'Programada';
            case 'expired': return 'Expirada';
            default: return status || 'Sin estado';
        }
    };

    // Filtrar asignaciones según el término de búsqueda
    const filteredAssignments = scheduledAssignments.filter(assignment =>
        assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                        minHeight: '70vh'
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
                            Asignaciones Programadas (Mejorado)
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Actualizar">
                            <IconButton 
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                sx={{ color: 'white' }}
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                        <IconButton 
                            onClick={onClose}
                            sx={{ color: 'white' }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {/* Barra de búsqueda y controles */}
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
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
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                    Total: {filteredAssignments.length} de {scheduledAssignments.length} asignaciones
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <CircularProgress size={60} />
                            <Typography sx={{ ml: 2 }}>
                                {isRefreshing ? 'Actualizando...' : 'Cargando asignaciones programadas...'}
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            {filteredAssignments.length === 0 ? (
                                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                                    <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        {searchTerm ? 'No se encontraron asignaciones' : 'No hay asignaciones programadas'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Las asignaciones programadas aparecerán aquí'}
                                    </Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={2}>
                                    {filteredAssignments.map((assignment, index) => (
                                        <Grid item xs={12} md={6} key={assignment._id || index}>
                                            <Card 
                                                sx={{ 
                                                    height: '100%',
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: theme.shadows[4],
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
                                                            {assignment.title || 'Sin título'}
                                                        </Typography>
                                                        <Chip
                                                            label={getStatusLabel(assignment.status)}
                                                            color={getStatusColor(assignment.status)}
                                                            size="small"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                    
                                                    <Typography 
                                                        variant="body2" 
                                                        color="text.secondary" 
                                                        sx={{ 
                                                            mb: 2,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {assignment.description || 'Sin descripción'}
                                                    </Typography>

                                                    <Divider sx={{ my: 2 }} />

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            Publicación: {assignment.publishDate ? formatDate(assignment.publishDate) : 'Sin fecha'}
                                                        </Typography>
                                                    </Box>

                                                    {assignment.dueDate && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                Entrega: {formatDate(assignment.dueDate)}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {teachers.length > 0 && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                            <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" color="text.secondary">
                                                                Para {teachers.length} docente(s)
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                        <Tooltip title="Ver detalles">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewDetails(assignment)}
                                                                color="primary"
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                color="info"
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Botón para agregar nueva asignación programada */}
                    <Fab
                        color="primary"
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32,
                            zIndex: 1000
                        }}
                    >
                        <Add />
                    </Fab>
                </DialogContent>
            </Dialog>

            {/* Diálogo de detalles de asignación programada */}
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
                            background: `linear-gradient(to right, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
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
                                    label={getStatusLabel(selectedAssignment.status)}
                                    color={getStatusColor(selectedAssignment.status)}
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
                                        Fechas Programadas
                                    </Typography>
                                    <Box sx={{ 
                                        p: 2,
                                        borderRadius: 2,
                                        background: theme.palette.grey[50],
                                        boxShadow: theme.shadows[1]
                                    }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Fecha de Publicación:</strong> {selectedAssignment.publishDate ? formatDate(selectedAssignment.publishDate) : 'Sin fecha'}
                                        </Typography>
                                        {selectedAssignment.dueDate && (
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Fecha de Entrega:</strong> {formatDate(selectedAssignment.dueDate)}
                                            </Typography>
                                        )}
                                        {selectedAssignment.closeDate && (
                                            <Typography variant="body2">
                                                <strong>Fecha de Cierre:</strong> {formatDate(selectedAssignment.closeDate)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ 
                                        mb: 2,
                                        fontWeight: 'bold',
                                        color: 'primary.main'
                                    }}>
                                        Información Adicional
                                    </Typography>
                                    <Box sx={{ 
                                        p: 2,
                                        borderRadius: 2,
                                        background: theme.palette.grey[50],
                                        boxShadow: theme.shadows[1]
                                    }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Estado:</strong> {getStatusLabel(selectedAssignment.status)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Docentes asignados:</strong> {teachers.length}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>ID:</strong> {selectedAssignment._id || 'Sin ID'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ 
                            p: 2,
                            borderTop: `1px solid ${theme.palette.divider}`
                        }}>
                            <Button
                                color="info"
                                variant="contained"
                                startIcon={<Edit />}
                                sx={{ mr: 1 }}
                            >
                                Editar
                            </Button>
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
