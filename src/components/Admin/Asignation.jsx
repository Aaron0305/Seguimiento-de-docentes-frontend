import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Switch,
    FormControlLabel,
    Chip,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import { Close as CloseIcon, AttachFile, Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
    display: 'none',
});

const FilePreview = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
}));

export default function Asignation({ open, onClose, users }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        dueDate: '',
        isGeneral: false,
        assignedTo: [],
        attachments: []
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleToggleGeneral = () => {
        setForm(prev => ({
            ...prev,
            isGeneral: !prev.isGeneral,
            assignedTo: []
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const handleRemoveFile = (index) => {
        setForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const resetForm = () => {
        setForm({
            title: '',
            description: '',
            dueDate: '',
            isGeneral: false,
            assignedTo: [],
            attachments: []
        });
        setError('');
        setSuccess(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Validaciones
            if (!form.title.trim()) {
                throw new Error('El título es requerido');
            }
            if (!form.description.trim()) {
                throw new Error('La descripción es requerida');
            }
            if (!form.dueDate) {
                throw new Error('La fecha de entrega es requerida');
            }
            if (!form.isGeneral && (!form.assignedTo || form.assignedTo.length === 0)) {
                throw new Error('Debe seleccionar al menos un docente para asignaciones individuales');
            }

            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            console.log('🔍 Token encontrado:', token ? 'Sí' : 'No');
            console.log('🔍 Usuario en localStorage:', user ? 'Sí' : 'No');
            console.log('🔍 Longitud del token:', token ? token.length : 0);
            
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    console.log('👤 Datos del usuario:', userData);
                    console.log('🔑 Rol del usuario:', userData.role);
                } catch (e) {
                    console.error('❌ Error parsing user data:', e);
                }
            }
            
            if (!token) {
                throw new Error('No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
            }

            const formData = new FormData();
            formData.append('title', form.title.trim());
            formData.append('description', form.description.trim());
            formData.append('dueDate', new Date(form.dueDate).toISOString());
            formData.append('isGeneral', form.isGeneral);
            
            // Si no es general, agregar los docentes seleccionados
            if (!form.isGeneral && form.assignedTo.length > 0) {
                form.assignedTo.forEach(userId => {
                    formData.append('assignedTo[]', userId);
                });
            }

            // Agregar archivos adjuntos si existen
            if (form.attachments.length > 0) {
                form.attachments.forEach(file => {
                    formData.append('attachments', file);
                });
            }

            console.log('📤 Enviando datos:', {
                title: form.title,
                description: form.description,
                dueDate: form.dueDate,
                isGeneral: form.isGeneral,
                assignedTo: form.assignedTo,
                attachments: form.attachments.length
            });

            const response = await fetch('http://localhost:3001/api/assignments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('📥 Respuesta del servidor:', response.status, response.statusText);
            
            const data = await response.json();
            console.log('📥 Datos de respuesta:', data);
            
            if (!response.ok) {
                // Crear un error con información completa
                const error = new Error(data.error || data.message || 'Error al crear la asignación');
                error.response = {
                    status: response.status,
                    statusText: response.statusText,
                    data: data
                };
                throw error;
            }

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                // Opcional: Recargar la lista de asignaciones
                if (window.location.pathname.includes('/admin')) {
                    window.location.reload();
                }
            }, 1500);

        } catch (err) {
            console.error('Error al crear asignación:', err);
            
            // Debug: mostrar todos los detalles del error
            console.log('🔍 Detalles completos del error:');
            console.log('  - Mensaje:', err.message);
            console.log('  - Response status:', err.response?.status);
            console.log('  - Response data:', err.response?.data);
            console.log('  - Response headers:', err.response?.headers);
            
            // Si el error es de autenticación (status 401)
            if (err.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                console.log('🔄 Para continuar, cierra este diálogo y vuelve a hacer login');
            } else if (err.message.includes('Sesión') || err.message.includes('token') || err.message.includes('autenticación')) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                console.log('🔄 Para continuar, cierra este diálogo y vuelve a hacer login');
            } else {
                setError(err.message || 'Error al crear la asignación');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'primary.main',
                color: 'white'
            }}>
                <Box component="span" sx={{ typography: 'h6' }}>Nueva Asignación</Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Asignación creada exitosamente
                        </Alert>
                    )}

                    <TextField
                        name="title"
                        label="Título de la Asignación"
                        value={form.title}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        name="description"
                        label="Descripción"
                        value={form.description}
                        onChange={handleChange}
                        fullWidth
                        required
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        name="dueDate"
                        label="Fecha de Entrega"
                        type="datetime-local"
                        value={form.dueDate}
                        onChange={handleChange}
                        fullWidth
                        required
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.isGeneral}
                                onChange={handleToggleGeneral}
                                color="primary"
                            />
                        }
                        label="Asignación General (para todos los docentes)"
                        sx={{ mb: 2 }}
                    />

                    {!form.isGeneral && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Asignar a Docentes</InputLabel>
                            <Select
                                multiple
                                name="assignedTo"
                                value={form.assignedTo}
                                onChange={handleChange}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const user = users.find(u => u._id === value);
                                            return (
                                                <Chip 
                                                    key={value} 
                                                    label={user ? `${user.nombre} ${user.apellidoPaterno}` : value}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {users.map((user) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {`${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <label htmlFor="attachment-files">
                            <Input
                                id="attachment-files"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<AttachFile />}
                            >
                                Adjuntar Archivos
                            </Button>
                        </label>

                        {form.attachments.map((file, index) => (
                            <FilePreview key={index}>
                                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                                    {file.name}
                                </Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleRemoveFile(index)}
                                    color="error"
                                >
                                    <Delete />
                                </IconButton>
                            </FilePreview>
                        ))}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Creando...' : 'Crear Asignación'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}



