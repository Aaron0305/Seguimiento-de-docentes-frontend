import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { 
    Close, 
    Schedule, 
    Add, 
    Edit, 
    Delete,
    CalendarToday,
    Person,
    Description,
    Refresh,
    Search,
    Visibility,
    Save,
    Cancel
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
    getScheduledAssignments,
    scheduleAssignment
} from '../../services/assignmentService';

const ScheduledAssignments = ({ open, onClose, teachers = [] }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [scheduledAssignments, setScheduledAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        publishDate: '',
        dueDate: '',
        closeDate: '',
        status: 'scheduled'
    });

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

    const handleCreateNew = () => {
        setShowCreateDialog(true);
    };

    const handleCreateAssignment = async () => {
        try {
            setIsCreating(true);
            
            // Validar campos obligatorios
            if (!newAssignment.title || !newAssignment.description || !newAssignment.publishDate) {
                throw new Error('Título, descripción y fecha de publicación son obligatorios');
            }

            const response = await scheduleAssignment(newAssignment);
            
            if (response.success) {
                setShowCreateDialog(false);
                setNewAssignment({
                    title: '',
                    description: '',
                    publishDate: '',
                    dueDate: '',
                    closeDate: '',
                    status: 'scheduled'
                });
                loadScheduledAssignments(); // Recargar la lista
            } else {
                throw new Error(response.error || 'Error al crear la asignación');
            }
        } catch (error) {
            console.error('❌ Error creando asignación:', error);
            setError('Error creando asignación: ' + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleInputChange = (field, value) => {
        setNewAssignment(prev => ({
            ...prev,
            [field]: value
        }));
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
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        minHeight: '85vh',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    py: 4,
                    px: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                    }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <Schedule sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                                Asignaciones Programadas
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                                Gestión avanzada de tareas programadas
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
                        <Tooltip title="Actualizar lista">
                            <IconButton 
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                sx={{ 
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': { 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        transform: 'scale(1.1) rotate(180deg)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Cerrar">
                            <IconButton 
                                onClick={onClose}
                                sx={{ 
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': { 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 4, position: 'relative', minHeight: '60vh' }}>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3, 
                                borderRadius: 2,
                                boxShadow: 2,
                                '& .MuiAlert-icon': {
                                    fontSize: '1.5rem'
                                }
                            }} 
                            onClose={() => setError('')}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Barra de búsqueda premium */}
                    <Paper 
                        elevation={3}
                        sx={{ 
                            p: 4, 
                            mb: 4, 
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                            border: `2px solid ${theme.palette.divider}`,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
                            }
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="🔍 Buscar asignaciones por título, descripción o estado..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search color="primary" sx={{ fontSize: 24 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                            backgroundColor: theme.palette.background.paper,
                                            fontSize: '1.1rem',
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main,
                                                borderWidth: 2,
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: theme.palette.primary.main,
                                                borderWidth: 2,
                                                boxShadow: `0 0 10px ${theme.palette.primary.main}40`
                                            }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Paper 
                                    elevation={2}
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center',
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        color: 'white',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(10px)'
                                        }
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
                                        {filteredAssignments.length}
                                    </Typography>
                                    <Typography variant="body1" sx={{ position: 'relative', zIndex: 1, opacity: 0.9 }}>
                                        de {scheduledAssignments.length} asignaciones
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>

                    {loading ? (
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                minHeight: '400px',
                                textAlign: 'center'
                            }}
                        >
                            <CircularProgress 
                                size={80} 
                                thickness={4} 
                                sx={{
                                    color: theme.palette.primary.main,
                                    mb: 3
                                }}
                            />
                            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                                {isRefreshing ? '🔄 Actualizando asignaciones...' : '📥 Cargando asignaciones programadas...'}
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            {filteredAssignments.length === 0 ? (
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        p: 8, 
                                        textAlign: 'center', 
                                        borderRadius: 4,
                                        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`,
                                        border: `3px dashed ${theme.palette.divider}`,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Schedule sx={{ fontSize: 100, color: theme.palette.primary.main, mb: 3, opacity: 0.7 }} />
                                    <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                                        {searchTerm ? '🔍 No se encontraron asignaciones' : '📋 No hay asignaciones programadas'}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                                        {searchTerm 
                                            ? 'Intenta con otros términos de búsqueda o revisa la ortografía. También puedes filtrar por estado o fecha.' 
                                            : 'Crea tu primera asignación programada para automatizar la distribución de tareas a los docentes.'
                                        }
                                    </Typography>
                                    {!searchTerm && (
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<Add />}
                                            onClick={handleCreateNew}
                                            sx={{ 
                                                mt: 2,
                                                borderRadius: 3,
                                                textTransform: 'none',
                                                fontSize: '1.1rem',
                                                px: 4,
                                                py: 1.5,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                                boxShadow: 3,
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: 6
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            ✨ Crear Primera Asignación
                                        </Button>
                                    )}
                                </Paper>
                            ) : (
                                <Grid container spacing={4}>
                                    {filteredAssignments.map((assignment, index) => (
                                        <Grid item xs={12} lg={6} key={assignment._id || index}>
                                            <Card 
                                                sx={{ 
                                                    height: '100%',
                                                    borderRadius: 4,
                                                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                                                    border: `2px solid ${theme.palette.divider}`,
                                                    boxShadow: 3,
                                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        boxShadow: 8,
                                                        borderColor: theme.palette.primary.main,
                                                        transform: 'translateY(-8px)'
                                                    },
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* Barra superior colorida */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: 6,
                                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`
                                                    }}
                                                />

                                                <CardContent sx={{ p: 4 }}>
                                                    {/* Header de la tarjeta */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                                        <Typography variant="h5" sx={{ 
                                                            fontWeight: 'bold', 
                                                            flex: 1,
                                                            color: theme.palette.text.primary,
                                                            lineHeight: 1.3,
                                                            pr: 2
                                                        }}>
                                                            {assignment.title || 'Sin título'}
                                                        </Typography>
                                                        <Chip
                                                            label={getStatusLabel(assignment.status)}
                                                            color={getStatusColor(assignment.status)}
                                                            size="medium"
                                                            sx={{ 
                                                                fontWeight: 'bold',
                                                                textTransform: 'uppercase',
                                                                fontSize: '0.8rem',
                                                                letterSpacing: 1,
                                                                px: 2,
                                                                boxShadow: 2
                                                            }}
                                                        />
                                                    </Box>
                                                    
                                                    {/* Descripción */}
                                                    <Typography 
                                                        variant="body1" 
                                                        color="text.secondary" 
                                                        sx={{ 
                                                            mb: 3,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            lineHeight: 1.6,
                                                            minHeight: '4.8em',
                                                            fontSize: '1rem'
                                                        }}
                                                    >
                                                        {assignment.description || 'Sin descripción disponible'}
                                                    </Typography>

                                                    <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />

                                                    {/* Información de fechas */}
                                                    <Box sx={{ mb: 3 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: theme.palette.primary.main + '20',
                                                                }}
                                                            >
                                                                <CalendarToday sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                                                    Fecha de Publicación
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {assignment.publishDate ? formatDate(assignment.publishDate) : 'Sin fecha'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        {assignment.dueDate && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                                <Box
                                                                    sx={{
                                                                        p: 1,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: theme.palette.warning.main + '20',
                                                                    }}
                                                                >
                                                                    <Schedule sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                                                        Fecha de Entrega
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {formatDate(assignment.dueDate)}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box
                                                                sx={{
                                                                    p: 1,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: theme.palette.info.main + '20',
                                                                }}
                                                            >
                                                                <Person sx={{ fontSize: 20, color: theme.palette.info.main }} />
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                                                    Docentes Asignados
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {teachers.length} docentes participantes
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />

                                                    {/* Botones de acción */}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                                            <Tooltip title="Ver detalles completos">
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() => handleViewDetails(assignment)}
                                                                    startIcon={<Visibility />}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        textTransform: 'none',
                                                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                                        '&:hover': {
                                                                            transform: 'scale(1.05)',
                                                                            boxShadow: 4
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    Ver
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title="Editar asignación">
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<Edit />}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        textTransform: 'none',
                                                                        borderColor: theme.palette.info.main,
                                                                        color: theme.palette.info.main,
                                                                        '&:hover': {
                                                                            backgroundColor: theme.palette.info.main,
                                                                            color: 'white',
                                                                            transform: 'scale(1.05)'
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    Editar
                                                                </Button>
                                                            </Tooltip>
                                                        </Box>
                                                        <Tooltip title="Eliminar asignación">
                                                            <IconButton
                                                                size="medium"
                                                                sx={{
                                                                    color: theme.palette.error.main,
                                                                    border: `2px solid ${theme.palette.error.main}20`,
                                                                    backgroundColor: theme.palette.error.main + '10',
                                                                    '&:hover': {
                                                                        backgroundColor: theme.palette.error.main,
                                                                        color: 'white',
                                                                        transform: 'scale(1.1)'
                                                                    },
                                                                    transition: 'all 0.2s ease'
                                                                }}
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

                    {/* Botón flotante premium */}
                    <Fab
                        color="primary"
                        onClick={handleCreateNew}
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32,
                            zIndex: 1000,
                            width: 72,
                            height: 72,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                            '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }
                        }}
                    >
                        <Add sx={{ fontSize: 36, position: 'relative', zIndex: 1 }} />
                    </Fab>
                </DialogContent>
            </Dialog>

            {/* Diálogo de detalles */}
            <Dialog
                open={showDetailDialog}
                onClose={() => setShowDetailDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }
                }}
            >
                {selectedAssignment && (
                    <>
                        <DialogTitle sx={{ 
                            py: 3,
                            px: 4,
                            background: `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`,
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                📋 {selectedAssignment.title}
                            </Typography>
                            <IconButton 
                                onClick={() => setShowDetailDialog(false)}
                                sx={{ color: 'white' }}
                            >
                                <Close />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 4 }}>
                            <Box mb={3}>
                                <Chip
                                    label={getStatusLabel(selectedAssignment.status)}
                                    color={getStatusColor(selectedAssignment.status)}
                                    sx={{ 
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                        fontSize: '0.9rem',
                                        px: 2,
                                        py: 1
                                    }}
                                />
                            </Box>
                            
                            <Typography variant="h6" paragraph sx={{ 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.8,
                                fontSize: '1.1rem',
                                mb: 4
                            }}>
                                {selectedAssignment.description}
                            </Typography>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper 
                                        elevation={2}
                                        sx={{ 
                                            p: 3,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}10 100%)`,
                                            border: `2px solid ${theme.palette.primary.light}40`
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ 
                                            mb: 3,
                                            fontWeight: 'bold',
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <CalendarToday />
                                            📅 Cronograma
                                        </Typography>
                                        <Box sx={{ '& > *': { mb: 2 } }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    Fecha de Publicación:
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    {selectedAssignment.publishDate ? formatDate(selectedAssignment.publishDate) : 'Sin fecha'}
                                                </Typography>
                                            </Box>
                                            {selectedAssignment.dueDate && (
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        Fecha de Entrega:
                                                    </Typography>
                                                    <Typography variant="body1" color="text.secondary">
                                                        {formatDate(selectedAssignment.dueDate)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {selectedAssignment.closeDate && (
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        Fecha de Cierre:
                                                    </Typography>
                                                    <Typography variant="body1" color="text.secondary">
                                                        {formatDate(selectedAssignment.closeDate)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper 
                                        elevation={2}
                                        sx={{ 
                                            p: 3,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${theme.palette.info.light}20 0%, ${theme.palette.info.main}10 100%)`,
                                            border: `2px solid ${theme.palette.info.light}40`
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ 
                                            mb: 3,
                                            fontWeight: 'bold',
                                            color: 'info.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Description />
                                            ℹ️ Detalles
                                        </Typography>
                                        <Box sx={{ '& > *': { mb: 2 } }}>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    Estado:
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    {getStatusLabel(selectedAssignment.status)}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    Docentes asignados:
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    {teachers.length} docentes
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    ID de Asignación:
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                    {selectedAssignment._id || 'Sin ID'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ 
                            p: 3,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            gap: 2
                        }}>
                            <Button
                                color="info"
                                variant="contained"
                                startIcon={<Edit />}
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                ✏️ Editar Asignación
                            </Button>
                            <Button 
                                onClick={() => setShowDetailDialog(false)}
                                variant="outlined"
                                sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 3
                                }}
                            >
                                🚪 Cerrar
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Diálogo de creación */}
            <Dialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    py: 3,
                    px: 4,
                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        ✨ Nueva Asignación Programada
                    </Typography>
                    <IconButton 
                        onClick={() => setShowCreateDialog(false)}
                        sx={{ color: 'white' }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="📝 Título de la Asignación"
                                value={newAssignment.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                variant="outlined"
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="📋 Descripción Detallada"
                                value={newAssignment.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                variant="outlined"
                                multiline
                                rows={4}
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="📅 Fecha de Publicación"
                                type="datetime-local"
                                value={newAssignment.publishDate}
                                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="⏰ Fecha de Entrega"
                                type="datetime-local"
                                value={newAssignment.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="🔒 Fecha de Cierre"
                                type="datetime-local"
                                value={newAssignment.closeDate}
                                onChange={(e) => handleInputChange('closeDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>📊 Estado Inicial</InputLabel>
                                <Select
                                    value={newAssignment.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    label="📊 Estado Inicial"
                                >
                                    <MenuItem value="scheduled">📋 Programada</MenuItem>
                                    <MenuItem value="draft">📝 Borrador</MenuItem>
                                    <MenuItem value="active">✅ Activa</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ 
                    p: 3,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    gap: 2
                }}>
                    <Button
                        onClick={() => setShowCreateDialog(false)}
                        variant="outlined"
                        startIcon={<Cancel />}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        ❌ Cancelar
                    </Button>
                    <Button
                        onClick={handleCreateAssignment}
                        variant="contained"
                        startIcon={<Save />}
                        disabled={isCreating || !newAssignment.title || !newAssignment.description || !newAssignment.publishDate}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                        }}
                    >
                        {isCreating ? '⏳ Creando...' : '💾 Crear Asignación'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ScheduledAssignments;
