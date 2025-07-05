    import React, { useState } from 'react';
    import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
    import { Edit, Delete, Menu as MenuIcon, Close as CloseIcon, PersonAdd } from '@mui/icons-material';
    import Drawer from '@mui/material/Drawer';
    import Calendar from 'react-calendar';
    import 'react-calendar/dist/Calendar.css';

    const initialSessions = [
    { id: 1, nombre: 'Juan Pérez', encargado: 'Mtro. Luis García', inicioServicio: '2025-01-15', finServicio: '', horasAcumuladas: 120 },
    { id: 2, nombre: 'Ana López', encargado: 'Mtra. Sofía Ruiz', inicioServicio: '2025-02-01', finServicio: '', horasAcumuladas: 80 },
    ];

    export default function Structure() {
    const [sessions, setSessions] = useState(initialSessions);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editSession, setEditSession] = useState(null);
    const [form, setForm] = useState({ nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [reporteDrawerOpen, setReporteDrawerOpen] = useState(false);

    const handleOpenDialog = (session = null) => {
        setEditSession(session);
        setForm(session || { nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
        setDialogOpen(true);
        setMobileDrawerOpen(false);
    };
    
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditSession(null);
        setForm({ nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
    };
    
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    
    const handleSave = () => {
        if (editSession) {
        setSessions(sessions.map(s => s.id === editSession.id ? { ...editSession, ...form } : s));
        } else {
        setSessions([...sessions, { ...form, id: Date.now() }]);
        }
        handleCloseDialog();
    };
    
    const handleDelete = id => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    const getStudentDetails = (session) => ({
        ...session,
        correo: session.nombre.toLowerCase().replace(/ /g, '.') + '@tesjo.edu.mx',
        carrera: 'Ingeniería en Sistemas Computacionales',
        semestre: 8,
        numeroControl: '20201234',
        registros: [
        { fecha: '2025-01-15', horaEntrada: '08:00', horaSalida: '12:00', actividades: 'Desarrollo de módulo de administración' }
        ]
    });

    const handleSelectStudent = (session) => {
        setSelectedStudent(getStudentDetails(session));
        setDrawerOpen(true);
    };
    
    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedStudent(null);
    };

    const registrosHistorial = selectedStudent?.registros?.map(r => ({
        ...r,
        fechaObj: new Date(r.fecha),
        horasRealizadas: ((parseInt(r.horaSalida) - parseInt(r.horaEntrada)) || 4).toFixed(2),
        descripcion: r.actividades,
        evidencias: []
    })) || [];

    const handleFechaSeleccionada = (fecha) => {
        setFechaSeleccionada(fecha);
    };
    
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
    };

    const handleDarDeBajaDesdeDashboard = (alumnoId) => {
        setSessions(sessions.map(s => s.id === alumnoId ? { ...s, finServicio: new Date().toISOString().slice(0, 10) } : s));
        setDrawerOpen(false);
        setSelectedStudent(null);
    };

    const handleOpenReporteHoras = () => {
        setReporteDrawerOpen(true);
        setMobileDrawerOpen(false);
    };

    const handleCloseReporteHoras = () => {
        setReporteDrawerOpen(false);
    };

    // Función para obtener el lunes de la semana actual
    const obtenerLunesSemana = (fecha) => {
        const d = new Date(fecha);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    // Función para generar datos de ejemplo para el reporte semanal
    const generarDatosSemana = () => {
        const lunesActual = obtenerLunesSemana(new Date());
        const semanas = [];
        
        for (let i = 0; i < 4; i++) {
        const lunesSemana = new Date(lunesActual);
        lunesSemana.setDate(lunesActual.getDate() - (i * 7));
        
        const domingoSemana = new Date(lunesSemana);
        domingoSemana.setDate(lunesSemana.getDate() + 6);
        
        const alumnosReporte = sessions.map(session => ({
            nombre: session.nombre,
            horasPorDia: {
            lunes: Math.floor(Math.random() * 8) + 1,
            martes: Math.floor(Math.random() * 8) + 1,
            miercoles: Math.floor(Math.random() * 8) + 1,
            jueves: Math.floor(Math.random() * 8) + 1,
            viernes: Math.floor(Math.random() * 8) + 1,
            sabado: 0,
            domingo: 0
            }
        }));
        
        alumnosReporte.forEach(alumno => {
            alumno.totalSemanal = Object.values(alumno.horasPorDia).reduce((sum, horas) => sum + horas, 0);
        });
        
        semanas.push({
            semana: `${lunesSemana.toLocaleDateString('es-MX')} - ${domingoSemana.toLocaleDateString('es-MX')}`,
            fechaInicio: lunesSemana,
            alumnos: alumnosReporte,
            totalGeneral: alumnosReporte.reduce((sum, alumno) => sum + alumno.totalSemanal, 0)
        });
        }
        
        return semanas;
    };

    const reporteSemanal = generarDatosSemana();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Drawer de navegación (menú hamburguesa) */}
        <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
        >
            <Box sx={{ width: 300, padding: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" color="primary">Menú de Administración</Typography>
                <IconButton onClick={() => setMobileDrawerOpen(false)}>
                <CloseIcon />
                </IconButton>
            </Box>
            
            {/* Gestión de Alumnos */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1, fontWeight: 'bold' }}>
                GESTIÓN DE ALUMNOS
            </Typography>
            
            <Button 
                startIcon={<PersonAdd />}
                fullWidth 
                variant="contained"
                sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                onClick={() => handleOpenDialog()}
            >
                Dar de Alta Alumno
            </Button>

            <Button 
                startIcon={<Delete />}
                fullWidth 
                variant="outlined"
                color="error"
                sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                Dar de Baja Alumno
            </Button>

            <Button 
                startIcon={<Edit />}
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 2, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                Nueva Contraseña de Alumno
            </Button>

            {/* Reportes y Administración */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2, fontWeight: 'bold' }}>
                REPORTES Y ADMINISTRACIÓN
            </Typography>

            <Button 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                onClick={handleOpenReporteHoras}
            >
                📊 Reportes de Horas
            </Button>

            <Button 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                📈 Estadísticas
            </Button>

            <Button 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                📋 Lista de Asistencia
            </Button>

            <Button 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 2, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                🏢 Gestión de Encargados
            </Button>

            {/* Configuración */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1, fontWeight: 'bold' }}>
                CONFIGURACIÓN
            </Typography>

            <Button 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                ⚙️ Configuración General
            </Button>

            <Button 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 1.5, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                📤 Exportar Datos
            </Button>

            <Button 
                fullWidth 
                variant="outlined"
                sx={{ justifyContent: 'flex-start', mb: 2, py: 1.2 }}
                onClick={() => setMobileDrawerOpen(false)}
            >
                🔔 Notificaciones
            </Button>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Button 
                fullWidth 
                variant="contained"
                sx={{ justifyContent: 'flex-start', mt: 'auto', py: 1.5 }}
                color="error"
                onClick={() => setMobileDrawerOpen(false)}
            >
                🚪 Cerrar Sesión
            </Button>
            </Box>
        </Drawer>

        {/* Contenido principal */}
        <Box sx={{ flex: 1, padding: 3, pt: 8 }}>
            {/* Título con botón hamburguesa integrado */}
            <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            gap: 1,
            mt: 4
            }}>
            <IconButton
                color="primary"
                aria-label="abrir menú"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ 
                mr: 1,
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                }
                }}
            >
                <MenuIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
                Panel de Administración
            </Typography>
            </Box>

            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Bienvenido al panel de administración. Desde aquí puedes gestionar los alumnos en servicio social, 
            consultar sus registros y realizar acciones administrativas.
            </Typography>

            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table>
                <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre del alumno</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Encargado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Inicio de Servicio</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fin de Servicio</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Horas acumuladas</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {sessions.map(session => (
                    <TableRow key={session.id} sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                    <TableCell>{session.nombre}</TableCell>
                    <TableCell>{session.encargado}</TableCell>
                    <TableCell>{session.inicioServicio}</TableCell>
                    <TableCell>{session.finServicio || '-'}</TableCell>
                    <TableCell>
                        <Box sx={{ 
                        display: 'inline-block', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        backgroundColor: 'primary.light', 
                        color: 'white',
                        fontSize: '0.875rem'
                        }}>
                        {session.horasAcumuladas} hrs
                        </Box>
                    </TableCell>
                    <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenDialog(session)} size="small">
                        <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(session.id)} size="small">
                        <Delete />
                        </IconButton>
                        <Button 
                        size="small" 
                        variant="outlined" 
                        sx={{ ml: 1 }} 
                        onClick={() => handleSelectStudent(session)}
                        >
                        Ver Alumno
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        </Box>

        {/* Diálogo para agregar/editar alumno */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            {editSession ? 'Editar Alumno' : 'Agregar Nuevo Alumno'}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField 
                label="Nombre del alumno" 
                name="nombre" 
                value={form.nombre} 
                onChange={handleChange} 
                fullWidth 
                required 
                variant="outlined"
            />
            <TextField 
                label="Encargado" 
                name="encargado" 
                value={form.encargado} 
                onChange={handleChange} 
                fullWidth 
                required 
                variant="outlined"
            />
            <TextField 
                label="Inicio de Servicio" 
                name="inicioServicio" 
                type="date" 
                value={form.inicioServicio} 
                onChange={handleChange} 
                fullWidth 
                required 
                variant="outlined"
                InputLabelProps={{ shrink: true }} 
            />
            <TextField 
                label="Fin de Servicio" 
                name="finServicio" 
                type="date" 
                value={form.finServicio} 
                onChange={handleChange} 
                fullWidth 
                variant="outlined"
                InputLabelProps={{ shrink: true }} 
            />
            <TextField 
                label="Horas acumuladas" 
                name="horasAcumuladas" 
                type="number" 
                value={form.horasAcumuladas} 
                onChange={handleChange} 
                fullWidth 
                required 
                variant="outlined"
            />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">Cancelar</Button>
            <Button onClick={handleSave} variant="contained">
                {editSession ? 'Actualizar' : 'Guardar'}
            </Button>
            </DialogActions>
        </Dialog>

        {/* Drawer de detalles de alumno */}
        <Drawer anchor="right" open={drawerOpen} onClose={handleCloseDrawer}>
            <Box sx={{ width: 500, p: 3, position: 'relative' }}>
            <IconButton onClick={handleCloseDrawer} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <CloseIcon />
            </IconButton>
            {selectedStudent && (
                <>
                <Typography variant="h5" gutterBottom color="primary">Datos del Alumno</Typography>
                <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography><b>Nombre:</b> {selectedStudent.nombre}</Typography>
                    <Typography><b>Correo:</b> {selectedStudent.correo}</Typography>
                    <Typography><b>Número de Control:</b> {selectedStudent.numeroControl}</Typography>
                    <Typography><b>Carrera:</b> {selectedStudent.carrera}</Typography>
                    <Typography><b>Semestre:</b> {selectedStudent.semestre}</Typography>
                </Box>
                <Typography variant="h6" gutterBottom color="primary">Historial de Sesiones</Typography>
                <Box sx={{ mb: 2 }}>
                    <Calendar
                    onChange={handleFechaSeleccionada}
                    value={fechaSeleccionada}
                    locale="es"
                    formatShortWeekday={(locale, date) => ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()]}
                    formatMonthYear={(locale, date) => {
                        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        return `${months[date.getMonth()]} ${date.getFullYear()}`;
                    }}
                    />
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Entrada</TableCell>
                            <TableCell>Salida</TableCell>
                            <TableCell>Horas</TableCell>
                            <TableCell>Actividad</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {registrosHistorial.map((registro, index) => (
                            <TableRow 
                            key={index} 
                            selected={fechaSeleccionada && registro.fechaObj.toDateString() === fechaSeleccionada.toDateString()}
                            >
                            <TableCell>{registro.fechaObj.toLocaleDateString('es-MX')}</TableCell>
                            <TableCell>{registro.horaEntrada}</TableCell>
                            <TableCell>{registro.horaSalida}</TableCell>
                            <TableCell>{registro.horasRealizadas}</TableCell>
                            <TableCell>{registro.descripcion}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </TableContainer>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="secondary">Resetear Contraseña</Button>
                    <Button
                    variant="contained"
                    color="error"
                    disabled={!!selectedStudent.finServicio}
                    onClick={() => handleDarDeBajaDesdeDashboard(selectedStudent.id)}
                    >
                    Dar de baja alumno
                    </Button>
                </Box>
                </>
            )}
            </Box>
        </Drawer>

        {/* Drawer de Reporte de Horas Semanal */}
        <Drawer anchor="right" open={reporteDrawerOpen} onClose={handleCloseReporteHoras}>
            <Box sx={{ width: 800, p: 3, position: 'relative' }}>
            <IconButton onClick={handleCloseReporteHoras} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <CloseIcon />
            </IconButton>
            
            <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
                📊 Reporte de Horas Semanal
            </Typography>
            
            {reporteSemanal.map((semana, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                    Semana: {semana.semana}
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 2, boxShadow: 2 }}>
                    <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'primary.light' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Alumno</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Lun</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Mar</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Mié</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Jue</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Vie</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Sáb</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Dom</TableCell>
                        <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', backgroundColor: 'primary.dark' }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {semana.alumnos.map((alumno, idx) => (
                        <TableRow key={idx}>
                            <TableCell sx={{ fontWeight: 'medium' }}>{alumno.nombre}</TableCell>
                            <TableCell align="center">{alumno.horasPorDia.lunes}</TableCell>
                            <TableCell align="center">{alumno.horasPorDia.martes}</TableCell>
                            <TableCell align="center">{alumno.horasPorDia.miercoles}</TableCell>
                            <TableCell align="center">{alumno.horasPorDia.jueves}</TableCell>
                            <TableCell align="center">{alumno.horasPorDia.viernes}</TableCell>
                            <TableCell align="center" sx={{ color: 'text.secondary' }}>{alumno.horasPorDia.sabado}</TableCell>
                            <TableCell align="center" sx={{ color: 'text.secondary' }}>{alumno.horasPorDia.domingo}</TableCell>
                            <TableCell align="center" sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: 'success.light',
                            color: 'success.contrastText'
                            }}>
                            {alumno.totalSemanal}h
                            </TableCell>
                        </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>TOTAL GENERAL</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {semana.alumnos.reduce((sum, a) => sum + a.horasPorDia.lunes, 0)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {semana.alumnos.reduce((sum, a) => sum + a.horasPorDia.martes, 0)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {semana.alumnos.reduce((sum, a) => sum + a.horasPorDia.miercoles, 0)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {semana.alumnos.reduce((sum, a) => sum + a.horasPorDia.jueves, 0)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {semana.alumnos.reduce((sum, a) => sum + a.horasPorDia.viernes, 0)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            {semana.alumnos.reduce((sum, a) => sum + a.horasPorDia.sabado, 0)}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                            {semana.alumnos.reduce((sum, a) => sum + a.horasPorDia.domingo, 0)}
                        </TableCell>
                        <TableCell align="center" sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            fontSize: '1.1rem'
                        }}>
                            {semana.totalGeneral}h
                        </TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </TableContainer>
                
                {/* Resumen de la semana */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 3, 
                    p: 2, 
                    backgroundColor: 'grey.50', 
                    borderRadius: 2 
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">{semana.alumnos.length}</Typography>
                    <Typography variant="caption">Alumnos Activos</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">{semana.totalGeneral}h</Typography>
                    <Typography variant="caption">Total de Horas</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">
                        {(semana.totalGeneral / semana.alumnos.length).toFixed(1)}h
                    </Typography>
                    <Typography variant="caption">Promedio por Alumno</Typography>
                    </Box>
                </Box>
                </Box>
            ))}
            
            {/* Botones de acción */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" color="primary">
                📤 Exportar a Excel
                </Button>
                <Button variant="outlined" color="primary">
                🖨️ Imprimir Reporte
                </Button>
                <Button variant="outlined" color="secondary">
                📧 Enviar por Email
                </Button>
            </Box>
            </Box>
        </Drawer>
        </Box>
    );
    }