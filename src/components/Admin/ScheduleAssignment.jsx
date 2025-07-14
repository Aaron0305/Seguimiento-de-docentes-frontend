import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Typography,
    Box,
    IconButton,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
    Divider,
    Paper,
    Autocomplete,
    RadioGroup,
    Radio,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Close,
    Schedule,
    Save,
    Cancel,
    Person,
    CalendarToday,
    Assignment as AssignmentIcon,
    Description,
    People,
    Add as AddIcon,
    Delete as DeleteIcon,
    AccessTime,
    Publish,
    Event,
    ExpandMore,
    Info,
    Warning,
    CheckCircle
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useTheme } from '@mui/material/styles';

const ScheduleAssignment = ({ 
    open, 
    onClose, 
    teachers = [], 
    onSave, 
    loading = false,
    editMode = false,
    assignmentToEdit = null
}) => {
    const theme = useTheme();

    // Estados para el formulario de asignación
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
        closeDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días desde ahora
        publishDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 día desde ahora
        assignedTo: [],
        isScheduled: true,
        priority: 'normal',
        reminderEnabled: true,
        reminderDays: 2
    });

    // Estados para validación y UI
    const [errors, setErrors] = useState({});
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [assignmentType, setAssignmentType] = useState('specific'); // 'all' o 'specific'
    const [showPreview, setShowPreview] = useState(false);

    // Resetear formulario cuando se abre/cierra el diálogo
    useEffect(() => {
        if (open) {
            if (editMode && assignmentToEdit) {
                loadAssignmentData(assignmentToEdit);
            } else {
                resetForm();
            }
        }
    }, [open, editMode, assignmentToEdit, loadAssignmentData]);

    const resetForm = () => {
        const now = new Date();
        setFormData({
            title: '',
            description: '',
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            closeDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
            publishDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            assignedTo: [],
            isScheduled: true,
            priority: 'normal',
            reminderEnabled: true,
            reminderDays: 2
        });
        setSelectedTeachers([]);
        setAssignmentType('specific');
        setErrors({});
        setShowPreview(false);
    };

    const loadAssignmentData = useCallback((assignment) => {
        // Cargar datos de la asignación a editar
        setFormData({
            title: assignment.title || '',
            description: assignment.description || '',
            dueDate: assignment.dueDate ? new Date(assignment.dueDate) : new Date(),
            closeDate: assignment.closeDate ? new Date(assignment.closeDate) : new Date(),
            publishDate: assignment.publishDate ? new Date(assignment.publishDate) : new Date(),
            assignedTo: assignment.assignedTo || [],
            isScheduled: true,
            priority: assignment.priority || 'normal',
            reminderEnabled: assignment.reminderEnabled !== undefined ? assignment.reminderEnabled : true,
            reminderDays: assignment.reminderDays || 2
        });

        // Configurar tipo de asignación y docentes seleccionados
        if (assignment.assignToAll) {
            setAssignmentType('all');
            setSelectedTeachers([]);
        } else {
            setAssignmentType('specific');
            // Buscar los docentes seleccionados en la lista de docentes disponibles
            const assignedTeachers = teachers.filter(teacher => 
                assignment.assignedTo.some(assignedId => 
                    assignedId === teacher._id || assignedId.toString() === teacher._id.toString()
                )
            );
            setSelectedTeachers(assignedTeachers);
        }

        setErrors({});
        setShowPreview(false);
    }, [teachers]);

    const validateForm = () => {
        const newErrors = {};
        const now = new Date();

        // Validaciones básicas
        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es requerida';
        }

        // Validaciones de fechas
        if (formData.publishDate <= now) {
            newErrors.publishDate = 'La fecha de publicación debe ser en el futuro';
        }

        if (formData.dueDate <= formData.publishDate) {
            newErrors.dueDate = 'La fecha de entrega debe ser posterior a la fecha de publicación';
        }

        if (formData.closeDate <= formData.dueDate) {
            newErrors.closeDate = 'La fecha de cierre debe ser posterior a la fecha de entrega';
        }

        // Validación de docentes asignados
        if (assignmentType === 'specific' && selectedTeachers.length === 0) {
            newErrors.assignedTo = 'Debe seleccionar al menos un docente';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        console.log('🚀 Iniciando envío de formulario...');
        
        if (!validateForm()) {
            console.log('❌ Validación del formulario falló');
            return;
        }

        const assignmentData = {
            ...formData,
            assignedTo: assignmentType === 'all' ? [] : selectedTeachers.map(teacher => teacher._id),
            assignToAll: assignmentType === 'all',
            scheduledPublish: true
        };

        // Si estamos editando, incluir el ID de la asignación
        if (editMode && assignmentToEdit) {
            assignmentData.id = assignmentToEdit._id;
        }

        console.log('📋 Datos a enviar:', JSON.stringify(assignmentData, null, 2));
        console.log('👥 Tipo de asignación:', assignmentType);
        console.log('👨‍🏫 Docentes seleccionados:', selectedTeachers);
        console.log('🔧 Modo edición:', editMode);

        onSave(assignmentData);
    };

    const handleTeachersChange = (event, newValue) => {
        setSelectedTeachers(newValue);
        setFormData(prev => ({
            ...prev,
            assignedTo: newValue.map(teacher => teacher._id)
        }));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'normal': return 'primary';
            case 'low': return 'success';
            default: return 'primary';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return 'Alta';
            case 'normal': return 'Normal';
            case 'low': return 'Baja';
            default: return 'Normal';
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                        minHeight: '80vh'
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
                            {editMode ? 'Editar Asignación Programada' : 'Programar Asignación'}
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={onClose}
                        sx={{ color: 'white' }}
                        disabled={loading}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        {/* Información básica */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                }}>
                                    <AssignmentIcon />
                                    Información de la Asignación
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Título de la Asignación"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            error={!!errors.title}
                                            helperText={errors.title}
                                            variant="outlined"
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label="Descripción"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            error={!!errors.description}
                                            helperText={errors.description}
                                            variant="outlined"
                                            required
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Prioridad</InputLabel>
                                            <Select
                                                value={formData.priority}
                                                label="Prioridad"
                                                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                            >
                                                <MenuItem value="low">Baja</MenuItem>
                                                <MenuItem value="normal">Normal</MenuItem>
                                                <MenuItem value="high">Alta</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip
                                                label={getPriorityLabel(formData.priority)}
                                                color={getPriorityColor(formData.priority)}
                                                size="small"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Prioridad seleccionada
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Asignación de docentes */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                }}>
                                    <People />
                                    Asignación de Docentes
                                </Typography>

                                <RadioGroup
                                    value={assignmentType}
                                    onChange={(e) => setAssignmentType(e.target.value)}
                                    sx={{ mb: 2 }}
                                >
                                    <FormControlLabel 
                                        value="all" 
                                        control={<Radio />} 
                                        label="Asignar a todos los docentes"
                                    />
                                    <FormControlLabel 
                                        value="specific" 
                                        control={<Radio />} 
                                        label="Asignar a docentes específicos"
                                    />
                                </RadioGroup>

                                {assignmentType === 'specific' && (
                                    <Autocomplete
                                        multiple
                                        options={teachers}
                                        getOptionLabel={(option) => `${option.nombre} ${option.apellidoPaterno} ${option.apellidoMaterno}`}
                                        value={selectedTeachers}
                                        onChange={handleTeachersChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Seleccionar Docentes"
                                                placeholder="Buscar docentes..."
                                                error={!!errors.assignedTo}
                                                helperText={errors.assignedTo}
                                            />
                                        )}
                                        renderTags={(tagValue, getTagProps) =>
                                            tagValue.map((option, index) => (
                                                <Chip
                                                    label={`${option.nombre} ${option.apellidoPaterno}`}
                                                    {...getTagProps({ index })}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ))
                                        }
                                    />
                                )}

                                {assignmentType === 'all' && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Esta asignación será enviada a todos los docentes registrados en el sistema
                                            cuando se publique automáticamente.
                                        </Typography>
                                    </Alert>
                                )}
                            </Paper>
                        </Grid>

                        {/* Programación de fechas */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                }}>
                                    <CalendarToday />
                                    Programación de Fechas
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <DateTimePicker
                                            label="Fecha de Publicación"
                                            value={formData.publishDate}
                                            onChange={(newValue) => setFormData(prev => ({ ...prev, publishDate: newValue }))}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    error={!!errors.publishDate}
                                                    helperText={errors.publishDate}
                                                />
                                            )}
                                            minDateTime={new Date()}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <DateTimePicker
                                            label="Fecha de Entrega"
                                            value={formData.dueDate}
                                            onChange={(newValue) => setFormData(prev => ({ ...prev, dueDate: newValue }))}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    error={!!errors.dueDate}
                                                    helperText={errors.dueDate}
                                                />
                                            )}
                                            minDateTime={formData.publishDate}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <DateTimePicker
                                            label="Fecha de Cierre"
                                            value={formData.closeDate}
                                            onChange={(newValue) => setFormData(prev => ({ ...prev, closeDate: newValue }))}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    error={!!errors.closeDate}
                                                    helperText={errors.closeDate}
                                                />
                                            )}
                                            minDateTime={formData.dueDate}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 2 }}>
                                    <Alert severity="info" icon={<Info />}>
                                        <Typography variant="body2">
                                            <strong>Fecha de Publicación:</strong> Cuando la asignación será visible para los docentes.<br/>
                                            <strong>Fecha de Entrega:</strong> Fecha límite para completar la asignación.<br/>
                                            <strong>Fecha de Cierre:</strong> Fecha final, después de la cual no se aceptan entregas.
                                        </Typography>
                                    </Alert>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Configuración de recordatorios */}
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    color: 'primary.main',
                                    fontWeight: 'bold'
                                }}>
                                    <AccessTime />
                                    Configuración de Recordatorios
                                </Typography>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.reminderEnabled}
                                            onChange={(e) => setFormData(prev => ({ 
                                                ...prev, 
                                                reminderEnabled: e.target.checked 
                                            }))}
                                        />
                                    }
                                    label="Enviar recordatorios automáticos"
                                />

                                {formData.reminderEnabled && (
                                    <Box sx={{ mt: 2 }}>
                                        <FormControl sx={{ minWidth: 200 }}>
                                            <InputLabel>Días antes del vencimiento</InputLabel>
                                            <Select
                                                value={formData.reminderDays}
                                                label="Días antes del vencimiento"
                                                onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    reminderDays: e.target.value 
                                                }))}
                                            >
                                                <MenuItem value={1}>1 día</MenuItem>
                                                <MenuItem value={2}>2 días</MenuItem>
                                                <MenuItem value={3}>3 días</MenuItem>
                                                <MenuItem value={5}>5 días</MenuItem>
                                                <MenuItem value={7}>7 días</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        {/* Vista previa */}
                        <Grid item xs={12}>
                            <Accordion expanded={showPreview} onChange={(e, expanded) => setShowPreview(expanded)}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="h6" sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        color: 'primary.main',
                                        fontWeight: 'bold'
                                    }}>
                                        <Publish />
                                        Vista Previa de la Asignación
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Card sx={{ borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {formData.title || 'Título de la asignación'}
                                            </Typography>
                                            
                                            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                                                {formData.description || 'Descripción de la asignación'}
                                            </Typography>

                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                <Chip 
                                                    label={getPriorityLabel(formData.priority)} 
                                                    color={getPriorityColor(formData.priority)} 
                                                    size="small" 
                                                />
                                                <Chip 
                                                    label="Programada" 
                                                    color="secondary" 
                                                    size="small" 
                                                />
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Se publicará:</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDate(formData.publishDate)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Fecha de entrega:</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDate(formData.dueDate)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Fecha de cierre:</strong>
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {formatDate(formData.closeDate)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>

                                            <Divider sx={{ my: 2 }} />

                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Asignado a:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {assignmentType === 'all' 
                                                    ? 'Todos los docentes'
                                                    : selectedTeachers.length > 0
                                                        ? selectedTeachers.map(t => `${t.nombre} ${t.apellidoPaterno}`).join(', ')
                                                        : 'Ningún docente seleccionado'
                                                }
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ 
                    p: 3, 
                    borderTop: `1px solid ${theme.palette.divider}`,
                    gap: 2
                }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        startIcon={<Cancel />}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    
                    <Button
                        onClick={() => setShowPreview(!showPreview)}
                        variant="text"
                        startIcon={<Publish />}
                        disabled={loading}
                    >
                        {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Schedule />}
                        disabled={loading}
                        color="secondary"
                        sx={{ minWidth: 200 }}
                    >
                        {loading 
                            ? (editMode ? 'Actualizando...' : 'Programando...') 
                            : (editMode ? 'Actualizar Asignación' : 'Programar Asignación')
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default ScheduleAssignment;
