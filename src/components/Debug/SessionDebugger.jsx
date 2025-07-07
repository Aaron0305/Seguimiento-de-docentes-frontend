import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Alert,
    Divider,
    Chip
} from '@mui/material';

const SessionDebugger = () => {
    const { currentUser } = useContext(AuthContext);
    const [debugInfo, setDebugInfo] = useState(null);
    const [lastError, setLastError] = useState(null);

    // Función para probar el flujo completo
    const testCompleteFlow = async () => {
        console.log('🔍 INICIANDO PRUEBA COMPLETA DEL FLUJO');
        setLastError(null);
        
        try {
            // 1. Verificar localStorage
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            console.log('📋 Estado del localStorage:');
            console.log('  - Token presente:', token ? 'Sí' : 'No');
            console.log('  - Usuario presente:', user ? 'Sí' : 'No');
            console.log('  - Longitud del token:', token ? token.length : 0);
            
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    console.log('  - Datos del usuario válidos:', userData.email);
                    console.log('  - Rol del usuario:', userData.role);
                } catch (parseError) {
                    console.error('  - ERROR: Datos del usuario malformados:', parseError);
                }
            }

            if (!token) {
                throw new Error('No hay token en localStorage');
            }

            // 2. Probar creación de asignación exactamente como el componente real
            console.log('🔧 Probando creación de asignación...');
            
            const formData = new FormData();
            formData.append('title', 'Prueba Debug Sesión');
            formData.append('description', 'Prueba para debuggear el error de sesión expirada');
            formData.append('dueDate', new Date('2025-12-31').toISOString());
            formData.append('isGeneral', 'true');

            console.log('📤 Headers que se enviarán:');
            console.log('  - Authorization:', `Bearer ${token.substring(0, 20)}...`);

            const response = await fetch('http://localhost:3001/api/assignments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('📥 Respuesta recibida:');
            console.log('  - Status:', response.status);
            console.log('  - StatusText:', response.statusText);
            console.log('  - Headers:', response.headers);

            const data = await response.json();
            console.log('  - Data:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }

            setDebugInfo({
                success: true,
                message: 'Asignación creada exitosamente',
                tokenLength: token.length,
                userEmail: currentUser?.email,
                assignmentId: data.data?._id,
                status: response.status
            });

        } catch (error) {
            console.error('❌ ERROR en el flujo:', error);
            setLastError(error.message);
            setDebugInfo({
                success: false,
                error: error.message,
                tokenPresent: !!localStorage.getItem('token'),
                userPresent: !!localStorage.getItem('user'),
                currentUserEmail: currentUser?.email
            });
        }
    };

    // Función para verificar el token
    const verifyToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLastError('No hay token en localStorage');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/auth/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setDebugInfo({
                    tokenValid: true,
                    user: data.user
                });
            } else {
                const errorData = await response.json();
                setLastError(`Token inválido: ${errorData.message}`);
            }
        } catch (error) {
            setLastError(`Error verificando token: ${error.message}`);
        }
    };

    return (
        <Card sx={{ margin: 2, maxWidth: 600 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    🔍 Debugger de Sesión
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        Usuario actual: {currentUser ? currentUser.email : 'No autenticado'}
                    </Typography>
                    <Typography variant="body2">
                        Token en localStorage: {localStorage.getItem('token') ? '✅ Presente' : '❌ Ausente'}
                    </Typography>
                    <Typography variant="body2">
                        Usuario en localStorage: {localStorage.getItem('user') ? '✅ Presente' : '❌ Ausente'}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button 
                        variant="contained" 
                        size="small" 
                        onClick={verifyToken}
                    >
                        Verificar Token
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="small" 
                        onClick={testCompleteFlow}
                    >
                        Probar Creación
                    </Button>
                </Box>

                {lastError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Error:</strong> {lastError}
                        </Typography>
                    </Alert>
                )}

                {debugInfo && (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Resultado de la prueba:
                            </Typography>
                            
                            {debugInfo.success !== undefined && (
                                <Chip 
                                    label={debugInfo.success ? 'ÉXITO' : 'ERROR'} 
                                    color={debugInfo.success ? 'success' : 'error'}
                                    sx={{ mb: 1 }}
                                />
                            )}

                            <Box component="pre" sx={{ 
                                fontSize: '0.75rem', 
                                backgroundColor: '#f5f5f5', 
                                padding: 1, 
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: 200
                            }}>
                                {JSON.stringify(debugInfo, null, 2)}
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
};

export default SessionDebugger;
