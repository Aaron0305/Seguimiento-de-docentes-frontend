import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../../contexts/AuthContext';

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
    const { verifyToken } = useContext(AuthContext);
    const [form, setForm] = useState({
        title: '',
        description: '',
        dueDate: '',
        closeDate: '',
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
            closeDate: '',
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
            if (!form.closeDate) {
                throw new Error('La fecha de cierre es requerida');
            }
            
            // Validar que la fecha de cierre sea posterior o igual a la fecha de entrega
            const dueDate = new Date(form.dueDate);
            const closeDate = new Date(form.closeDate);
            if (closeDate < dueDate) {
                throw new Error('La fecha de cierre debe ser posterior o igual a la fecha de entrega');
            }
            
            if (!form.isGeneral && (!form.assignedTo || form.assignedTo.length === 0)) {
                throw new Error('Debe seleccionar al menos un docente para asignaciones individuales');
            }

            // Verificar token antes de proceder
            await verifyToken();
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
            }

            const formData = new FormData();
            formData.append('title', form.title.trim());
            formData.append('description', form.description.trim());
            formData.append('dueDate', new Date(form.dueDate).toISOString());
            formData.append('closeDate', new Date(form.closeDate).toISOString());
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

            const response = await fetch('http://localhost:3001/api/assignments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Error al crear la asignación');
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
            setError(err.message || 'Error al crear la asignación');
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
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Nueva Asignación</Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
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
                        fullWidth
                        label="Título"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Descripción"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={4}
                        required
                    />

                    <Box display="flex" gap={2} mt={2}>
                        <TextField
                            type="datetime-local"
                            label="Fecha de Entrega"
                            name="dueDate"
                            value={form.dueDate}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            type="datetime-local"
                            label="Fecha de Cierre"
                            name="closeDate"
                            value={form.closeDate}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.isGeneral}
                                onChange={handleToggleGeneral}
                                name="isGeneral"
                            />
                        }
                        label="Asignación General (para todos los docentes)"
                        sx={{ mt: 2 }}
                    />

                    {!form.isGeneral && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Asignar a Docentes</InputLabel>
                            <Select
                                multiple
                                value={form.assignedTo}
                                onChange={handleChange}
                                name="assignedTo"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const user = users.find(u => u._id === value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={`${user?.nombre} ${user?.apellidoPaterno}`}
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

                    <Box mt={2}>
                        <label htmlFor="file-upload">
                            <Input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                            <Button
                                component="span"
                                variant="outlined"
                                startIcon={<AttachFile />}
                            >
                                Adjuntar Archivos
                            </Button>
                        </label>

                        {form.attachments.map((file, index) => (
                            <FilePreview key={index}>
                                <Typography noWrap>{file.name}</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveFile(index)}
                                >
                                    <Delete />
                                </IconButton>
                            </FilePreview>
                        ))}
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Crear Asignación'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}



