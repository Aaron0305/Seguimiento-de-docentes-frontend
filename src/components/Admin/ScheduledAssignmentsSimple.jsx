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
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getScheduledAssignments,
    scheduleAssignment
} from '../../services/assignmentService';

const ScheduledAssignmentsSimple = ({ open, onClose, teachers = [] }) => {
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
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        minHeight: '80vh',
                        boxShadow: theme.shadows[10]
                    }
                }}
            >
                <DialogTitle sx={{ 
                    py: 3,
                    px: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                    >
                        <Schedule sx={{ fontSize: 32 }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                            Asignaciones Programadas
                        </Typography>
                    </motion.div>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Actualizar">
                            <IconButton 
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                sx={{ 
                                    color: 'white',
                                    '&:hover': { 
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>
                        <IconButton 
                            onClick={onClose}
                            sx={{ 
                                color: 'white',
                                '&:hover': { 
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Barra de búsqueda mejorada */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Paper 
                            elevation={2}
                            sx={{ 
                                p: 3, 
                                mb: 4, 
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                                border: `1px solid ${theme.palette.divider}`
                            }}
                        >
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={9}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Buscar asignaciones programadas por título o descripción..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.background.paper,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Paper 
                                        sx={{ 
                                            p: 2, 
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            backgroundColor: theme.palette.primary.main,
                                            color: 'white'
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {filteredAssignments.length}
                                        </Typography>
                                        <Typography variant="body2">
                                            de {scheduledAssignments.length} asignaciones
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </motion.div>

                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}
                        >
                            <Box textAlign="center">
                                <CircularProgress size={80} thickness={4} />
                                <Typography sx={{ mt: 2, fontSize: '1.1rem', color: 'text.secondary' }}>
                                    {isRefreshing ? 'Actualizando asignaciones...' : 'Cargando asignaciones programadas...'}
                                </Typography>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {filteredAssignments.length === 0 ? (
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        p: 6, 
                                        textAlign: 'center', 
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`,
                                        border: `2px dashed ${theme.palette.divider}`
                                    }}
                                >
                                    <Schedule sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {searchTerm ? 'No se encontraron asignaciones' : 'No hay asignaciones programadas'}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        {searchTerm 
                                            ? 'Intenta con otros términos de búsqueda o revisa la ortografía' 
                                            : 'Crea tu primera asignación programada haciendo clic en el botón +'
                                        }
                                    </Typography>
                                    {!searchTerm && (
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={handleCreateNew}
                                            sx={{ 
                                                mt: 2,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            Crear Primera Asignación
                                        </Button>
                                    )}
                                </Paper>
                            ) : (
                                <Grid container spacing={3}>
                                    <AnimatePresence>
                                        {filteredAssignments.map((assignment, index) => (
                                            <Grid item xs={12} lg={6} key={assignment._id || index}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                                    transition={{ 
                                                        duration: 0.3, 
                                                        delay: index * 0.1,
                                                        type: "spring",
                                                        stiffness: 100
                                                    }}
                                                    whileHover={{ 
                                                        y: -5,
                                                        transition: { duration: 0.2 }
                                                    }}
                                                >
                                                    <Card 
                                                        sx={{ 
                                                            height: '100%',
                                                            borderRadius: 3,
                                                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                                                            border: `1px solid ${theme.palette.divider}`,
                                                            boxShadow: theme.shadows[2],
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                boxShadow: theme.shadows[8],
                                                                borderColor: theme.palette.primary.main,
                                                            },
                                                            position: 'relative',
                                                            overflow: 'visible'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: 4,
                                                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                                borderRadius: '12px 12px 0 0'
                                                            }}
                                                        />
                                                        <CardContent sx={{ p: 3 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                                <Typography variant="h6" sx={{ 
                                                                    fontWeight: 'bold', 
                                                                    flex: 1,
                                                                    color: theme.palette.text.primary,
                                                                    lineHeight: 1.3
                                                                }}>
                                                                    {assignment.title || 'Sin título'}
                                                                </Typography>
                                                                <Chip
                                                                    label={getStatusLabel(assignment.status)}
                                                                    color={getStatusColor(assignment.status)}
                                                                    size="small"
                                                                    sx={{ 
                                                                        ml: 2,
                                                                        fontWeight: 'bold',
                                                                        textTransform: 'uppercase',
                                                                        fontSize: '0.7rem',
                                                                        letterSpacing: 0.5
                                                                    }}
                                                                />
                                                            </Box>
                                                            
                                                            <Typography 
                                                                variant="body2" 
                                                                color="text.secondary" 
                                                                sx={{ 
                                                                    mb: 3,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 3,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    lineHeight: 1.6,
                                                                    minHeight: '3.6em'
                                                                }}
                                                            >
                                                                {assignment.description || 'Sin descripción disponible'}
                                                            </Typography>

                                                            <Divider sx={{ my: 2 }} />

                                                            <Box sx={{ mb: 2 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                                    <CalendarToday sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                        Publicación:
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {assignment.publishDate ? formatDate(assignment.publishDate) : 'Sin fecha'}
                                                                    </Typography>
                                                                </Box>

                                                                {assignment.dueDate && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                                                        <Schedule sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                            Entrega:
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            {formatDate(assignment.dueDate)}
                                                                        </Typography>
                                                                    </Box>
                                                                )}

                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Person sx={{ fontSize: 18, color: theme.palette.info.main }} />
                                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                        Docentes:
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {teachers.length} asignados
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Divider sx={{ my: 2 }} />

                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                                    <Tooltip title="Ver detalles completos">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleViewDetails(assignment)}
                                                                            sx={{
                                                                                backgroundColor: theme.palette.primary.main,
                                                                                color: 'white',
                                                                                '&:hover': {
                                                                                    backgroundColor: theme.palette.primary.dark,
                                                                                    transform: 'scale(1.1)'
                                                                                },
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                        >
                                                                            <Visibility fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Editar asignación">
                                                                        <IconButton
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: theme.palette.info.main,
                                                                                color: 'white',
                                                                                '&:hover': {
                                                                                    backgroundColor: theme.palette.info.dark,
                                                                                    transform: 'scale(1.1)'
                                                                                },
                                                                                transition: 'all 0.2s ease'
                                                                            }}
                                                                        >
                                                                            <Edit fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                                <Tooltip title="Eliminar asignación">
                                                                    <IconButton
                                                                        size="small"
                                                                        sx={{
                                                                            backgroundColor: theme.palette.error.main,
                                                                            color: 'white',
                                                                            '&:hover': {
                                                                                backgroundColor: theme.palette.error.dark,
                                                                                transform: 'scale(1.1)'
                                                                            },
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                    >
                                                                        <Delete fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            </Grid>
                                        ))}
                                    </AnimatePresence>
                                </Grid>
                            )}
                        </motion.div>
                    )}

                    {/* Botón flotante mejorado para crear nueva asignación */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                        <Fab
                            color="primary"
                            onClick={handleCreateNew}
                            sx={{
                                position: 'fixed',
                                bottom: 32,
                                right: 32,
                                zIndex: 1000,
                                width: 64,
                                height: 64,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: theme.shadows[8]
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: theme.shadows[4]
                            }}
                        >
                            <Add sx={{ fontSize: 32 }} />
                        </Fab>
                    </motion.div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de detalles mejorado */}
            <Dialog
                open={showDetailDialog}
                onClose={() => setShowDetailDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        boxShadow: theme.shadows[10]
                    }
                }}
            >
                <AnimatePresence>
                    {selectedAssignment && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
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
                                    {selectedAssignment.title}
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
                                            fontSize: '0.8rem'
                                        }}
                                    />
                                </Box>
                                
                                <Typography variant="body1" paragraph sx={{ 
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.8,
                                    fontSize: '1rem'
                                }}>
                                    {selectedAssignment.description}
                                </Typography>

                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Paper 
                                            elevation={2}
                                            sx={{ 
                                                p: 3,
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}10 100%)`,
                                                border: `1px solid ${theme.palette.primary.light}`
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ 
                                                mb: 2,
                                                fontWeight: 'bold',
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <CalendarToday />
                                                Cronograma
                                            </Typography>
                                            <Box sx={{ '& > *': { mb: 2 } }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                        Fecha de Publicación:
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedAssignment.publishDate ? formatDate(selectedAssignment.publishDate) : 'Sin fecha'}
                                                    </Typography>
                                                </Box>
                                                {selectedAssignment.dueDate && (
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                            Fecha de Entrega:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {formatDate(selectedAssignment.dueDate)}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {selectedAssignment.closeDate && (
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                            Fecha de Cierre:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
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
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${theme.palette.info.light}20 0%, ${theme.palette.info.main}10 100%)`,
                                                border: `1px solid ${theme.palette.info.light}`
                                            }}
                                        >
                                            <Typography variant="h6" sx={{ 
                                                mb: 2,
                                                fontWeight: 'bold',
                                                color: 'info.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                <Description />
                                                Detalles
                                            </Typography>
                                            <Box sx={{ '& > *': { mb: 2 } }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                        Estado:
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {getStatusLabel(selectedAssignment.status)}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                        Docentes asignados:
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {teachers.length} docentes
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                        ID de Asignación:
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
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
                                gap: 1
                            }}>
                                <Button
                                    color="info"
                                    variant="contained"
                                    startIcon={<Edit />}
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none'
                                    }}
                                >
                                    Editar Asignación
                                </Button>
                                <Button 
                                    onClick={() => setShowDetailDialog(false)}
                                    variant="outlined"
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none'
                                    }}
                                >
                                    Cerrar
                                </Button>
                            </DialogActions>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Dialog>

            {/* Diálogo de creación de nueva asignación */}
            <Dialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                        boxShadow: theme.shadows[10]
                    }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
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
                            Nueva Asignación Programada
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
                                    label="Título de la Asignación"
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
                                    label="Descripción"
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
                                    label="Fecha de Publicación"
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
                                    label="Fecha de Entrega"
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
                                    label="Fecha de Cierre"
                                    type="datetime-local"
                                    value={newAssignment.closeDate}
                                    onChange={(e) => handleInputChange('closeDate', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={newAssignment.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        label="Estado"
                                    >
                                        <MenuItem value="scheduled">Programada</MenuItem>
                                        <MenuItem value="draft">Borrador</MenuItem>
                                        <MenuItem value="active">Activa</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ 
                        p: 3,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        gap: 1
                    }}>
                        <Button
                            onClick={() => setShowCreateDialog(false)}
                            variant="outlined"
                            startIcon={<Cancel />}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none'
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateAssignment}
                            variant="contained"
                            startIcon={<Save />}
                            disabled={isCreating || !newAssignment.title || !newAssignment.description || !newAssignment.publishDate}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none'
                            }}
                        >
                            {isCreating ? 'Creando...' : 'Crear Asignación'}
                        </Button>
                    </DialogActions>
                </motion.div>
            </Dialog>
        </>
    );
};

export default ScheduledAssignmentsSimple;
