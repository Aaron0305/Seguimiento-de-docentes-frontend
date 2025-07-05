import React, { useState, useEffect } from 'react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('dueDate', form.dueDate);
            formData.append('isGeneral', form.isGeneral);
            
            if (!form.isGeneral) {
                form.assignedTo.forEach(userId => {
                    formData.append('assignedTo[]', userId);
                });
            }

            form.attachments.forEach(file => {
                formData.append('attachments', file);
            });

            const response = await fetch('http://localhost:3001/api/assignments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear la asignación');
            }

            onClose();
            setForm({
                title: '',
                description: '',
                dueDate: '',
                isGeneral: false,
                assignedTo: [],
                attachments: []
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
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
                <Typography variant="h6">Nueva Asignación</Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
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
                                                    label={user ? user.nombreCompleto : value}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                            >
                                {users.map((user) => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.nombreCompleto}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <label htmlFor="file-input">
                            <Input
                                id="file-input"
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
                    <Button onClick={onClose} variant="outlined">
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear Asignación'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}



