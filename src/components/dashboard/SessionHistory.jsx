import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade,
  Grow,
  styled,
  Modal,
  Chip,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack, 
  Event, 
  Description, 
  AttachFile,
  PlayCircleFilled,
  CheckCircle,
  Today,
  CloudUpload,
  Delete
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Estilos personalizados
const StyledCalendarContainer = styled(Paper)(() => ({
  padding: '16px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  '.react-calendar': {
    border: 'none',
    width: '100%',
    background: 'transparent',
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    borderRadius: '8px',
    '& button': {
      margin: '4px',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: '#e3f2fd',
        color: '#1976d2',
      }
    }
  }
}));

// Estilos personalizados para la tabla
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  '& .MuiTable-root': {
    borderCollapse: 'separate',
    borderSpacing: '0 8px'
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 'none',
  padding: theme.spacing(2),
  '&.header': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '0.95rem'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.005)',
    transition: 'transform 0.2s ease'
  },
  '& > td': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:first-of-type': {
      borderTopLeftRadius: '8px',
      borderBottomLeftRadius: '8px'
    },
    '&:last-of-type': {
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px'
    }
  }
}));

const EvidenceCard = styled(Card)(() => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  }
}));

const ActivityCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.light
  }
}));

const StyledModal = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  maxHeight: '90vh',
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  outline: 'none'
}));

const DetailHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  position: 'sticky',
  top: 0,
  zIndex: 1
}));

const DetailContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: '12px',
  '& > *:not(:last-child)': {
    marginBottom: theme.spacing(3)
  }
}));

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

const ActivityDetails = ({ registro }) => {
  return (
    <ActivityCard>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Título de la Actividad
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
        {registro.titulo}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Actividades Realizadas
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {registro.descripcion?.split('\n').map((linea, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              • {linea}
            </Box>
          ))}
        </Typography>
      </Box>

      {registro.observaciones && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="secondary" gutterBottom>
            Observaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {registro.observaciones?.split('\n').map((linea, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                ◦ {linea}
              </Box>
            ))}
          </Typography>
        </Box>
      )}

      {registro.evidencias?.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Evidencias Adjuntas
          </Typography>
          <Grid container spacing={1}>
            {registro.evidencias.map((evidencia, index) => (
              <Grid item key={index}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFile />}
                  href={`http://localhost:3001${evidencia.url}`}
                  target="_blank"
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                >
                  {evidencia.nombre}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </ActivityCard>
  );
};

const SessionHistory = ({
  handleFechaSeleccionada,
  fechaSeleccionada,
  tileClassName,
  mostrarTabla,
  registrosHistorial,
  totalHoras,
  mostrarDetalle,
  volverATabla,
  formatearFecha,
  registroSeleccionado,
  getFileIcon
}) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/assignments/my-assignments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las asignaciones');
      }

      const data = await response.json();
      setAssignments(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUploadDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setUploadDialogOpen(true);
    setSelectedFiles([]);
    setUploadError('');
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedAssignment(null);
    setSelectedFiles([]);
    setUploadError('');
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitFiles = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Por favor, selecciona al menos un archivo');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`http://localhost:3001/api/assignments/${selectedAssignment._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir los archivos');
      }

      handleCloseUploadDialog();
      fetchAssignments();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (now > due) return 'error';
    if (now.getTime() + (24 * 60 * 60 * 1000) > due.getTime()) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Asignaciones Pendientes
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Título</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Entrega</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Archivos Adjuntos</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="subtitle1" sx={{ py: 3 }}>
                    No hay asignaciones pendientes
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment._id} hover>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.description}</TableCell>
                  <TableCell>
                    {format(new Date(assignment.dueDate), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.status === 'completed' ? 'Completada' : 'Pendiente'}
                      color={getStatusColor(assignment.dueDate)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {assignment.attachments.map((file, index) => (
                      <Chip
                        key={index}
                        icon={<Description />}
                        label={file.fileName}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                        onClick={() => window.open(`http://localhost:3001/${file.fileUrl}`, '_blank')}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      onClick={() => handleOpenUploadDialog(assignment)}
                      disabled={assignment.status === 'completed'}
                    >
                      Subir Entrega
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de subida de archivos */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Subir Entrega
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}

          <Typography variant="subtitle1" gutterBottom>
            {selectedAssignment?.title}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <label htmlFor="upload-files">
              <Input
                id="upload-files"
                type="file"
                multiple
                onChange={handleFileSelect}
              />
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFile />}
              >
                Seleccionar Archivos
              </Button>
            </label>

            {selectedFiles.map((file, index) => (
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
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseUploadDialog}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitFiles}
            disabled={uploadLoading || selectedFiles.length === 0}
            startIcon={uploadLoading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploadLoading ? 'Subiendo...' : 'Subir Archivos'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionHistory;
