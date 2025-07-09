import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const StatsDebugger = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testStatsAPI = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/stats/teachers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener estadísticas');
            }

            setStats(data);
            console.log('Respuesta de la API:', data);
        } catch (error) {
            setError(error.message);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper', boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Debugger de Estadísticas
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={testStatsAPI}
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    {loading ? 'Probando...' : 'Probar API de Estadísticas'}
                </Button>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        Error: {error}
                    </Typography>
                )}

                {stats && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Resultados:
                        </Typography>
                        <pre style={{ 
                            overflow: 'auto', 
                            maxHeight: '300px',
                            backgroundColor: '#f5f5f5',
                            padding: '8px',
                            borderRadius: '4px'
                        }}>
                            {JSON.stringify(stats, null, 2)}
                        </pre>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default StatsDebugger; 