import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Alert,
    CircularProgress,
    Typography,
    Box,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from '@mui/material';
import {
    Email as EmailIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';

export default function PerformanceReportsDialog({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [reportData, setReportData] = useState(null);
    const [emailResults, setEmailResults] = useState(null);
    
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        sendEmails: false
    });

    const [reminderFilters, setReminderFilters] = useState({
        daysAhead: 3,
        sendEmails: false
    });

    const resetState = () => {
        setError('');
        setSuccess('');
        setReportData(null);
        setEmailResults(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const generatePoorPerformanceReport = async () => {
        setLoading(true);
        resetState();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch('http://localhost:3001/api/assignments/reports/send-poor-performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(filters)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al generar el reporte');
            }

            setReportData(data.data);
            
            if (filters.sendEmails) {
                setEmailResults(data.data.emailResults);
                setSuccess(`Reporte generado y ${data.data.emailResults.length} emails enviados exitosamente`);
            } else {
                setSuccess('Reporte de mal desempeño generado exitosamente');
            }

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const sendReminders = async () => {
        setLoading(true);
        resetState();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch('http://localhost:3001/api/assignments/reports/send-reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reminderFilters)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al enviar recordatorios');
            }

            setReportData(data.data);
            
            if (reminderFilters.sendEmails) {
                setEmailResults(data.data.emailResults);
                setSuccess(`Recordatorios enviados a ${data.data.emailResults.length} docentes exitosamente`);
            } else {
                setSuccess('Reporte de recordatorios generado exitosamente');
            }

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Error al enviar recordatorios');
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
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <EmailIcon />
                <span>Reportes de Desempeño y Recordatorios</span>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {/* Reporte de Mal Desempeño */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="error" />
                        Reporte de Mal Desempeño
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Genera reportes de docentes que no han entregado asignaciones después de la fecha de cierre
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            label="Fecha de inicio"
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            helperText="Opcional - asignaciones cerradas desde esta fecha"
                        />
                        <TextField
                            label="Fecha de fin"
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            helperText="Opcional - asignaciones cerradas hasta esta fecha"
                        />
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters.sendEmails}
                                onChange={(e) => setFilters(prev => ({ ...prev, sendEmails: e.target.checked }))}
                                color="primary"
                            />
                        }
                        label="Enviar emails automáticamente a los docentes"
                        sx={{ mb: 2 }}
                    />

                    <Button
                        variant="contained"
                        color="error"
                        onClick={generatePoorPerformanceReport}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
                        fullWidth
                    >
                        {loading ? 'Generando reporte...' : 'Generar Reporte de Mal Desempeño'}
                    </Button>
                </Paper>

                <Divider sx={{ my: 3 }} />

                {/* Recordatorios */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon color="warning" />
                        Recordatorios de Asignaciones
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Envía recordatorios a docentes sobre asignaciones próximas a vencer
                    </Typography>

                    <TextField
                        label="Días de anticipación"
                        type="number"
                        value={reminderFilters.daysAhead}
                        onChange={(e) => setReminderFilters(prev => ({ ...prev, daysAhead: parseInt(e.target.value) }))}
                        size="small"
                        sx={{ mb: 2 }}
                        helperText="Enviar recordatorios para asignaciones que vencen en X días"
                        inputProps={{ min: 1, max: 30 }}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={reminderFilters.sendEmails}
                                onChange={(e) => setReminderFilters(prev => ({ ...prev, sendEmails: e.target.checked }))}
                                color="primary"
                            />
                        }
                        label="Enviar emails automáticamente a los docentes"
                        sx={{ mb: 2, display: 'block' }}
                    />

                    <Button
                        variant="contained"
                        color="warning"
                        onClick={sendReminders}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <ScheduleIcon />}
                        fullWidth
                    >
                        {loading ? 'Enviando recordatorios...' : 'Enviar Recordatorios'}
                    </Button>
                </Paper>

                {/* Resultados del reporte */}
                {reportData && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Resultados</Typography>
                        
                        {reportData.reports && (
                            <>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Docentes con mal desempeño:</strong> {reportData.summary?.totalTeachersWithPoorPerformance || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    <strong>Total de asignaciones no entregadas:</strong> {reportData.summary?.totalMissedAssignments || 0}
                                </Typography>
                            </>
                        )}

                        {reportData.reminders && (
                            <>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Docentes con recordatorios:</strong> {reportData.summary?.totalTeachersWithReminders || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    <strong>Total de asignaciones pendientes:</strong> {reportData.summary?.totalPendingAssignments || 0}
                                </Typography>
                            </>
                        )}

                        {emailResults && emailResults.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ mb: 2 }}>Resultados de Envío de Emails</Typography>
                                <List dense>
                                    {emailResults.map((result, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon>
                                                {result.success ? 
                                                    <CheckCircleIcon color="success" /> : 
                                                    <ErrorIcon color="error" />
                                                }
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={result.teacherName}
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2">
                                                            {result.teacherEmail}
                                                        </Typography>
                                                        {!result.success && result.error && (
                                                            <Typography variant="body2" color="error">
                                                                Error: {result.error}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                            <Chip 
                                                label={result.success ? 'Enviado' : 'Error'} 
                                                color={result.success ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        )}
                    </Paper>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose}>
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
