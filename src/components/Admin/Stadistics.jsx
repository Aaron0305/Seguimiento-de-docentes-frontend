import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Chip
} from '@mui/material';
import {
    Search,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    PendingActions as PendingIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Componentes estilizados
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
}));

const StatChip = styled(Chip)(({ theme, status }) => {
    const colors = {
        completed: theme.palette.success.main,
        pending: theme.palette.warning.main,
        expired: theme.palette.error.main,
        total: theme.palette.primary.main
    };
    
    return {
        fontWeight: 'bold',
        backgroundColor: colors[status],
        color: 'white',
        '& .MuiChip-icon': {
            color: 'inherit'
        }
    };
});

export default function Stadistics({ open, onClose }) {
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3001/api/stats/teachers', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al obtener las estadísticas');
                }

                const data = await response.json();
                setStatistics(data);
                setError(null);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchStatistics();
        }
    }, [open]);

    const filteredStatistics = statistics.filter(stat => 
        stat.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
                }
            }}
        >
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 3,
                    py: 2
                }}
            >
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Estadísticas de Docentes
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{ color: 'white' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Barra de búsqueda */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por nombre o ID del docente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color={searchFocused ? "primary" : "action"} />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <CloseIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 2,
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                },
                                ...(searchFocused && {
                                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                                }),
                            }
                        }}
                    />
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">
                        Error: {error}
                    </Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>ID Docente</StyledTableCell>
                                    <StyledTableCell>Nombre</StyledTableCell>
                                    <StyledTableCell align="center">Total Asignaciones</StyledTableCell>
                                    <StyledTableCell align="center">Completadas</StyledTableCell>
                                    <StyledTableCell align="center">Pendientes</StyledTableCell>
                                    <StyledTableCell align="center">Vencidas</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStatistics.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            <Typography variant="subtitle1" color="text.secondary">
                                                No se encontraron resultados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStatistics.map((stat) => (
                                        <TableRow key={stat.teacherId} hover>
                                            <TableCell>{stat.teacherId}</TableCell>
                                            <TableCell>{stat.teacherName}</TableCell>
                                            <TableCell align="center">
                                                <StatChip
                                                    icon={<AccessTimeIcon />}
                                                    label={stat.totalAssignments}
                                                    status="total"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <StatChip
                                                    icon={<CheckCircleIcon />}
                                                    label={stat.completedAssignments}
                                                    status="completed"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <StatChip
                                                    icon={<PendingIcon />}
                                                    label={stat.pendingAssignments}
                                                    status="pending"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <StatChip
                                                    icon={<WarningIcon />}
                                                    label={stat.expiredAssignments}
                                                    status="expired"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
}
