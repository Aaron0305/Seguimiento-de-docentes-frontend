import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Avatar, Chip, Card, CardContent, Grid, Fade, Slide, Zoom } from '@mui/material';
import { Edit, Delete, Menu as MenuIcon, Close as CloseIcon, PersonAdd, Refresh, Search, FilterList, Visibility, MoreVert, Assignment } from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import { styled, keyframes } from '@mui/material/styles';
import Asignation from './Asignation';

// Animaciones personalizadas
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.3); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8); }
  100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.3); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Componentes estilizados
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const GlowButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
  transition: 'all 0.3s ease',
  '&:hover': {
    animation: `${glow} 2s infinite`,
    transform: 'translateY(-2px)',
  },
}));

const AnimatedTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
    transform: 'scale(1.01)',
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '20px',
  padding: '20px',
  marginBottom: '24px',
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
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: `${slideIn} 3s infinite`,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  border: '3px solid #fff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    animation: `${pulse} 1s infinite`,
  },
}));

export default function Structure() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editSession, setEditSession] = useState(null);
    const [form, setForm] = useState({ nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [reporteDrawerOpen, setReporteDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [asignationOpen, setAsignationOpen] = useState(false);

    // Función optimizada para obtener usuarios con cache
    const fetchUsers = useCallback(async (force = false) => {
        if (users.length > 0 && !force) return; // Evita recargas innecesarias
        
        try {
            setRefreshing(true);
            const response = await fetch('http://localhost:3001/api/users', {
                headers: {
                    'Cache-Control': force ? 'no-cache' : 'max-age=300', // Cache por 5 minutos
                    'Pragma': force ? 'no-cache' : 'cache'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al obtener los usuarios');
            }
            
            const data = await response.json();
            
            if (!data.users || !Array.isArray(data.users)) {
                throw new Error('Formato de respuesta inválido');
            }
            
            setUsers(data.users);
            setError(null);
        } catch (err) {
            console.error('Error detallado:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [users.length]);

    // Cargar usuarios solo una vez al montar
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Función de búsqueda optimizada
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user => 
            user.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.numeroControl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.carrera?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    // Memoizar los detalles del estudiante
    const getStudentDetails = useMemo(() => (session) => ({
        ...session,
        correo: session.nombre?.toLowerCase().replace(/ /g, '.') + '@tesjo.edu.mx',
        carrera: session.carrera || 'No especificada',
        registros: session.registros || []
    }), []);

    const handleOpenDialog = useCallback((session = null) => {
        setEditSession(session);
        setForm(session || { nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
        setDialogOpen(true);
        setMobileDrawerOpen(false);
    }, []);
    
    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setEditSession(null);
        setForm({ nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
    }, []);
    
    const handleChange = useCallback((e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }, [form]);
    
    const handleSave = useCallback(() => {
        if (editSession) {
            setUsers(users.map(s => s.id === editSession.id ? { ...editSession, ...form } : s));
        } else {
            setUsers([...users, { ...form, id: Date.now() }]);
        }
        handleCloseDialog();
    }, [editSession, form, users, handleCloseDialog]);
    
    const handleDelete = useCallback((id) => {
        setUsers(users.filter(s => s.id !== id));
    }, [users]);

    const handleSelectStudent = useCallback((user) => {
        setSelectedStudent(getStudentDetails(user));
        setDrawerOpen(true);
    }, [getStudentDetails]);
    
    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false);
        setSelectedStudent(null);
    }, []);

    const handleOpenReporteHoras = useCallback(() => {
        setReporteDrawerOpen(true);
        setMobileDrawerOpen(false);
    }, []);

    const handleCloseReporteHoras = useCallback(() => {
        setReporteDrawerOpen(false);
    }, []);

    const handleRefresh = useCallback(() => {
        fetchUsers(true);
    }, [fetchUsers]);

    const handleOpenAsignation = useCallback(() => {
        setAsignationOpen(true);
        setMobileDrawerOpen(false);
    }, []);

    const handleCloseAsignation = useCallback(() => {
        setAsignationOpen(false);
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Contenido principal */}
            <Box sx={{ 
                flex: 1, 
                padding: 3, 
                pt: 10, // Aumentado el padding top para dar más espacio después del navbar
                mx: 'auto', // Centrar el contenido
                width: '100%',
                maxWidth: '1400px', // Limitar el ancho máximo para mejor legibilidad
            }}>
                {/* Header futurista */}
                <Fade in={true} timeout={1000}>
                    <HeaderBox sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // Cambiado a tonos de azul más profesionales
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px',
                        mb: 4, // Aumentado el margen inferior
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mb: 2,
                            px: 2, // Añadido padding horizontal
                        }}>
                            <IconButton
                                color="inherit"
                                onClick={() => setMobileDrawerOpen(true)}
                                sx={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography 
                                variant="h4" 
                                component="h1" 
                                sx={{ 
                                    fontWeight: 600,
                                    flexGrow: 1,
                                    letterSpacing: '0.5px',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                Panel de Administración
                            </Typography>
                            <IconButton
                                color="inherit"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                sx={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'scale(1.1)',
                                    },
                                }}
                            >
                                <Refresh sx={{ 
                                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' },
                                    },
                                }} />
                            </IconButton>
                        </Box>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                opacity: 0.9, 
                                fontWeight: 300,
                                px: 2,
                                pb: 2
                            }}
                        >
                            Gestiona docentes, consulta registros y administra el sistema
                        </Typography>
                    </HeaderBox>
                </Fade>

                {/* Controles de búsqueda */}
                <Slide direction="up" in={true} timeout={800}>
                    <StyledCard sx={{ 
                        mb: 4,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        borderRadius: '12px',
                    }}>
                        <CardContent sx={{ py: 3 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                alignItems: 'center', 
                                flexWrap: 'wrap',
                                px: 2
                            }}>
                                <TextField
                                    placeholder="Buscar por nombre, número de control, email o carrera..."
                                    variant="outlined"
                                    size="medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    sx={{ 
                                        flexGrow: 1, 
                                        minWidth: 300,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#1976d2',
                                                },
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                                    }}
                                />
                                <Chip 
                                    label={`${filteredUsers.length} usuarios`} 
                                    color="primary" 
                                    sx={{ 
                                        fontWeight: 'bold',
                                        px: 2,
                                        height: '40px',
                                        borderRadius: '20px',
                                        backgroundColor: '#1976d2',
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </StyledCard>
                </Slide>

                {/* Tabla de usuarios */}
                <Zoom in={true} timeout={1000}>
                    <StyledCard sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ 
                                        backgroundColor: '#f5f7fa',
                                        '& th': { 
                                            fontWeight: 600,
                                            color: '#1976d2',
                                            fontSize: '0.95rem',
                                            py: 2
                                        }
                                    }}>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Foto</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Número de Control</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Nombre Completo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Carrera</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <CircularProgress size={60} thickness={4} />
                                                <Typography sx={{ mt: 2, fontSize: '1.1rem' }}>
                                                    Cargando usuarios...
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography color="error" variant="h6">
                                                    ⚠️ Error: {error}
                                                </Typography>
                                                <Button 
                                                    onClick={handleRefresh} 
                                                    sx={{ mt: 2 }}
                                                    variant="outlined"
                                                >
                                                    Reintentar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    {searchTerm ? '🔍 No se encontraron usuarios' : '👥 No hay usuarios registrados'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user, index) => (
                                            <Fade in={true} timeout={300 + index * 100} key={user._id}>
                                                <AnimatedTableRow>
                                                    <TableCell>
                                                        <StyledAvatar
                                                            src={user.fotoPerfil 
                                                                ? `http://localhost:3001/uploads/perfiles/${user.fotoPerfil}?t=${Date.now()}`
                                                                : 'http://localhost:3001/uploads/perfiles/2138822222222_1749571359362.png'
                                                            }
                                                            alt={`Foto de perfil de ${user.nombreCompleto}`}
                                                            onError={(e) => {
                                                                if (!e.target.src.includes('2138822222222_1749571359362.png')) {
                                                                    e.target.onerror = null;
                                                                    e.target.src = `http://localhost:3001/uploads/perfiles/2138822222222_1749571359362.png?t=${Date.now()}`;
                                                                }
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                            {user.numeroControl}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {`${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={typeof user.carrera === 'object' ? user.carrera.nombre : user.carrera} 
                                                            size="small" 
                                                            color="secondary"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {user.email}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton 
                                                                onClick={() => handleSelectStudent(user)}
                                                                sx={{ 
                                                                    color: 'primary.main',
                                                                    '&:hover': { 
                                                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                                        transform: 'scale(1.1)',
                                                                    },
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                            <IconButton 
                                                                onClick={() => handleOpenDialog(user)}
                                                                sx={{ 
                                                                    color: 'warning.main',
                                                                    '&:hover': { 
                                                                        backgroundColor: 'rgba(237, 108, 2, 0.1)',
                                                                        transform: 'scale(1.1)',
                                                                    },
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton 
                                                                onClick={() => handleDelete(user._id)} 
                                                                sx={{ 
                                                                    color: 'error.main',
                                                                    '&:hover': { 
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                        transform: 'scale(1.1)',
                                                                    },
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </AnimatedTableRow>
                                            </Fade>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </StyledCard>
                </Zoom>
            </Box>

            {/* Drawer de navegación (menú hamburguesa) - SIN CAMBIOS */}
            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                        color: 'white',
                    },
                }}
            >
                <Box sx={{ width: 300, padding: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#4fc3f7', fontWeight: 'bold' }}>
                            Menú de Administración
                        </Typography>
                        <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    {/* Gestión de Docentes */}
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 1, fontWeight: 'bold', color: '#4fc3f7' }}>
                        GESTIÓN DE DOCENTES
                    </Typography>
                    
                    <GlowButton 
                        startIcon={<PersonAdd />}
                        fullWidth 
                        variant="contained"
                        sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                        onClick={() => handleOpenDialog()}
                    >
                        Dar de Alta Docente
                    </GlowButton>

                    <Button 
                        startIcon={<Delete />}
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 1.5, 
                            py: 1.2,
                            borderColor: 'rgba(244, 67, 54, 0.5)',
                            color: '#f44336',
                            '&:hover': {
                                borderColor: '#f44336',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        Dar de Baja Docente
                    </Button>

                    <Button 
                        startIcon={<Edit />}
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 2, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        Nueva Contraseña de Docente
                    </Button>

                    {/* Reportes y Administración */}
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 'bold', color: '#4fc3f7' }}>
                        REPORTES Y ADMINISTRACIÓN
                    </Typography>

                    <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 1.5, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={handleOpenReporteHoras}
                    >
                        📊 Reportes de Horas
                    </Button>

                    <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 1.5, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        📈 Estadísticas
                    </Button>

                    <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 1.5, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        📋 Lista de Asistencia
                    </Button>

                    <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 2, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        🏢 Gestión de Encargados
                    </Button>

                    {/* Gestión de Asignaciones */}
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 'bold', color: '#4fc3f7' }}>
                        GESTIÓN DE ASIGNACIONES
                    </Typography>

                    <Button
                        startIcon={<Assignment />}
                        fullWidth
                        variant="contained"
                        sx={{
                            justifyContent: 'flex-start',
                            mb: 1.5,
                            py: 1.2,
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                            },
                        }}
                        onClick={handleOpenAsignation}
                    >
                        Nueva Asignación
                    </Button>

                    {/* Configuración */}
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 1, fontWeight: 'bold', color: '#4fc3f7' }}>
                        CONFIGURACIÓN
                    </Typography>

                    <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 1.5, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        ⚙️ Configuración General
                    </Button>

                    <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 1.5, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        📤 Exportar Datos
                    </Button>

                    <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 2, 
                            py: 1.2,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        🔔 Notificaciones
                    </Button>
                    
                    <Box sx={{ flexGrow: 1 }} />
                    
                    <Button 
                        fullWidth 
                        variant="contained"
                        sx={{ 
                            justifyContent: 'flex-start', 
                            mt: 'auto', 
                            py: 1.5,
                            background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
                            },
                        }}
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        🚪 Cerrar Sesión
                    </Button>
                </Box>
            </Drawer>

            {/* Dialog para editar/agregar */}
            <Dialog 
                open={dialogOpen} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
                    },
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                }}>
                    {editSession ? 'Editar Docente' : 'Agregar Nuevo Docente'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="nombre"
                                label="Nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="numeroControl"
                                label="Número de Control"
                                value={form.numeroControl}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="carrera"
                                label="Carrera"
                                value={form.carrera}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{ 
                            borderRadius: '12px',
                            color: 'text.secondary',
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            '&:hover': {
                                borderColor: 'rgba(0, 0, 0, 0.24)',
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        Cancelar
                    </Button>
                    <GlowButton
                        onClick={handleSave}
                        variant="contained"
                        sx={{ ml: 2 }}
                    >
                        {editSession ? 'Guardar Cambios' : 'Crear Docente'}
                    </GlowButton>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Asignaciones */}
            <Asignation
                open={asignationOpen}
                onClose={handleCloseAsignation}
                users={users}
            />
        </Box>
    );
}