import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    Badge,
    Fade,
    Collapse,
    Zoom,
    useTheme,
    alpha
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
    CalendarToday,
    Sort,
    SortByAlpha,
    AccessTime,
    Description,
    Person
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeacherAssignmentStats, getTeacherAssignments, markAssignmentCompleted } from '../../services/assignmentService';

const TeacherAssignments = () => {
    const theme = useTheme();
    
    // Estados principales
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para filtros y ordenamiento
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        sortBy: '-createdAt',
        sortDirection: 'desc'
    });
    
    // Estados para paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Estados para diálogos y animaciones
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);

    useEffect(() => {
        loadStats();
        loadAssignments();
    }, [filters, page, rowsPerPage]);

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
            setError('');
            
            const params = {
                status: filters.status,
                search: filters.search,
                sort: filters.sortBy,
                page: page + 1,
                limit: rowsPerPage
            };

            const response = await getTeacherAssignments(params);
            
            if (response.success) {
                setAssignments(response.assignments || []);
            } else {
                setError('Error al cargar las asignaciones');
            }
        } catch (error) {
            setError('Error al cargar las asignaciones: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteAssignment = async (assignmentId) => {
        try {
            setActionLoading(true);
            setError('');
            
            const response = await markAssignmentCompleted(assignmentId);
            
            if (response.success) {
                await loadAssignments();
                await loadStats();
                setShowDetailDialog(false);
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            setError(error.message || 'Error al marcar como completada');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status, dueDate, closeDate) => {
        if (status === 'completed') return 'success';
        
        const now = new Date();
        const due = new Date(dueDate);
        const close = new Date(closeDate);
        
        if (now > close) return 'error';
        if (now > due) return 'warning';
        
        const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 1) return 'error';
        if (daysUntilDue <= 3) return 'warning';
        
        return 'primary';
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterClick = (filterType) => {
        setActiveFilter(filterType);
        setFilters(prev => ({
            ...prev,
            status: filterType === prev.status ? 'all' : filterType
        }));
    };

    const handleSort = (column) => {
        setFilters(prev => ({
            ...prev,
            sortBy: column,
            sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Componente de Estadísticas Animado
    const StatsCard = ({ icon: Icon, count, label, color, onClick, active }) => (
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Card 
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                    cursor: 'pointer',
                    bgcolor: active ? alpha(theme.palette[color].main, 0.1) : 'background.paper',
                    transition: 'all 0.3s ease'
                }}
                onClick={onClick}
            >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Badge badgeContent={count} color={color} max={99}>
                        <Icon sx={{ fontSize: 40, color: theme.palette[color].main }} />
                    </Badge>
                    <Typography variant="h6">{count}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {label}
                    </Typography>
                </CardContent>
            </Card>
        </Zoom>
    );

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            {/* Header con estadísticas */}
            {stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <StatsCard
                            icon={AssignmentIcon}
                            count={stats.total}
                            label="Total"
                            color="primary"
                            onClick={() => handleFilterClick('all')}
                            active={filters.status === 'all'}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatsCard
                            icon={Schedule}
                            count={stats.pending}
                            label="Pendientes"
                            color="warning"
                            onClick={() => handleFilterClick('pending')}
                            active={filters.status === 'pending'}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatsCard
                            icon={CheckCircle}
                            count={stats.completed}
                            label="Completadas"
                            color="success"
                            onClick={() => handleFilterClick('completed')}
                            active={filters.status === 'completed'}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatsCard
                            icon={Warning}
                            count={stats.overdue}
                            label="Vencidas"
                            color="error"
                            onClick={() => handleFilterClick('overdue')}
                            active={filters.status === 'overdue'}
                        />
                    </Grid>
                </Grid>
            )}

            {/* Barra de búsqueda y filtros */}
            <Paper 
                component={motion.div}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                sx={{ p: 2, mb: 3 }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Buscar asignaciones..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{ bgcolor: 'background.paper' }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                            >
                                Limpiar filtros
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={loadAssignments}
                                disabled={loading}
                            >
                                Actualizar
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabla de asignaciones */}
            <TableContainer 
                component={Paper}
                sx={{ 
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 2,
                    boxShadow: theme.shadows[3]
                }}
            >
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell 
                                onClick={() => handleSort('title')}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <Box display="flex" alignItems="center">
                                    <Description sx={{ mr: 1 }} />
                                    Título
                                    <SortByAlpha sx={{ ml: 1, fontSize: 18 }} />
                                </Box>
                            </TableCell>
                            <TableCell 
                                onClick={() => handleSort('dueDate')}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <Box display="flex" alignItems="center">
                                    <AccessTime sx={{ mr: 1 }} />
                                    Fecha de entrega
                                    <Sort sx={{ ml: 1, fontSize: 18 }} />
                                </Box>
                            </TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell 
                                onClick={() => handleSort('createdBy.nombre')}
                                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <Box display="flex" alignItems="center">
                                    <Person sx={{ mr: 1 }} />
                                    Creado por
                                    <Sort sx={{ ml: 1, fontSize: 18 }} />
                                </Box>
                            </TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <AnimatePresence>
                            {assignments.map((assignment) => (
                                <TableRow
                                    key={assignment._id}
                                    component={motion.tr}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    whileHover={{ scale: 1.01, backgroundColor: alpha(theme.palette.primary.main, 0.04) }}
                                    sx={{ 
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="subtitle2" noWrap>
                                            {assignment.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {assignment.description.substring(0, 60)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column">
                                            <Typography variant="body2">
                                                {formatDate(assignment.dueDate)}
                                            </Typography>
                                            <Typography variant="caption" color="error">
                                                Cierra: {formatDate(assignment.closeDate)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={assignment.status === 'completed' ? 'Completada' : 'Pendiente'}
                                            color={getStatusColor(assignment.status, assignment.dueDate, assignment.closeDate)}
                                            size="small"
                                            sx={{ minWidth: 100 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {assignment.createdBy?.nombre} {assignment.createdBy?.apellidoPaterno}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedAssignment(assignment);
                                                        setShowDetailDialog(true);
                                                    }}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            {assignment.status === 'pending' && (
                                                <Tooltip title="Marcar como completada">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleCompleteAssignment(assignment._id)}
                                                        disabled={actionLoading || new Date() > new Date(assignment.closeDate)}
                                                    >
                                                        <Done />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>

                {/* Estado de carga y error */}
                {loading && (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                )}
                
                {error && (
                    <Box p={2}>
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Box>
                )}

                {!loading && assignments.length === 0 && (
                    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
                        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No hay asignaciones disponibles
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Las nuevas asignaciones aparecerán aquí
                        </Typography>
                    </Box>
                )}

                {/* Paginación */}
                <TablePagination
                    component="div"
                    count={-1}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Filas por página"
                    labelDisplayedRows={({ from, to }) => `${from}-${to}`}
                />
            </TableContainer>

            {/* Diálogo de detalles */}
            <Dialog
                open={showDetailDialog}
                onClose={() => setShowDetailDialog(false)}
                maxWidth="md"
                fullWidth
                TransitionComponent={Fade}
                transitionDuration={300}
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
                                    label={selectedAssignment.status === 'completed' ? 'Completada' : 'Pendiente'}
                                    color={getStatusColor(selectedAssignment.status, selectedAssignment.dueDate, selectedAssignment.closeDate)}
                                />
                            </Box>
                            
                            <Typography variant="body1" paragraph>
                                {selectedAssignment.description}
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Fecha de entrega
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDate(selectedAssignment.dueDate)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Fecha de cierre
                                    </Typography>
                                    <Typography variant="body2" color="error">
                                        {formatDate(selectedAssignment.closeDate)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                                <Box mt={2}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Archivos adjuntos
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                        {selectedAssignment.attachments.map((file, index) => (
                                            <Chip
                                                key={index}
                                                label={file.fileName}
                                                onClick={() => window.open(`http://localhost:3001/${file.fileUrl}`, '_blank')}
                                                sx={{ 
                                                    '&:hover': { 
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            {selectedAssignment.status === 'pending' && (
                                <Button
                                    color="success"
                                    variant="contained"
                                    startIcon={<Done />}
                                    onClick={() => handleCompleteAssignment(selectedAssignment._id)}
                                    disabled={actionLoading || new Date() > new Date(selectedAssignment.closeDate)}
                                >
                                    {actionLoading ? 'Procesando...' : 'Marcar como completada'}
                                </Button>
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
