import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import SessionHistory from './SessionHistory';
import './ActiveSession.css'; 
import { TextField } from '@mui/material';

const ActiveSession = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  // Estados principales
  const [userReady, setUserReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [openWelcome, setOpenWelcome] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
    // Estados para la sesión actual
  const [actividades, setActividades] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('--:--');
  const [horaSalida, setHoraSalida] = useState('--:--');
  const [tiempoAcumulado, setTiempoAcumulado] = useState('0 horas y 0 minutos');
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [sesionFinalizada, setSesionFinalizada] = useState(false);
  const [evidencias, setEvidencias] = useState([]);
  const [actividadNumero, setActividadNumero] = useState(1);
  const [titulo, setTitulo] = useState('');
  const fileInputRef = useRef(null);
  
  // Estados para el historial
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [mostrarTabla, setMostrarTabla] = useState(true);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [fechaInicioServicio, setFechaInicioServicio] = useState(null);
  const [fechaFinServicio, setFechaFinServicio] = useState(null);
  
  // Estado para los registros
  const [registrosHistorial, setRegistrosHistorial] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  
  // Estados para manejar múltiples actividades y evidencias
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState({
  titulo: '',
  descripcion: '',
  observaciones: '',
  evidencias: []
  });

  const isActivityValid = () => {
    return currentActivity.titulo.trim() !== '' && 
          currentActivity.descripcion.trim() !== '' && 
          currentActivity.evidencias.length > 0;
  };

  const handleAddActivity = () => {
    if (isActivityValid()) {
      setActivities([...activities, { ...currentActivity }]);
      setCurrentActivity({ titulo: '', descripcion: '', evidencias: [] });
    }
  };

  const removeActivity = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const removeCurrentEvidencia = (index) => {
    setCurrentActivity(prev => ({
      ...prev,
      evidencias: prev.evidencias.filter((_, i) => i !== index)
    }));
  };
  const handleSaveAll = () => {
    if (activities.length > 0) {
      setActividades(activities.map(a => a.descripcion).join('\n\n'));
      // Guardar las observaciones junto con las evidencias
      const observacionesTexto = activities.map(a => a.observaciones || '').filter(obs => obs).join('\n\n');
      setObservaciones(observacionesTexto);
      setEvidencias(activities.flatMap(a => a.evidencias));
      setShowEvidenceModal(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setCurrentActivity(prev => ({
      ...prev,
      evidencias: [...prev.evidencias, ...files]
    }));
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch(extension) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📑';
      default: return '📁';
    }
  };

  // Detectar cuando el usuario está completamente cargado y recargar la página
  useEffect(() => {
    if (!loading && currentUser) {
      console.log('✅ Usuario completamente cargado:', currentUser);
      console.log('📁 Foto de perfil disponible:', currentUser.fotoPerfil);
      
      // Verificar si ya se recargó la página para este usuario
      const lastUserReload = sessionStorage.getItem('lastUserReload');
      const currentUserKey = `${currentUser._id}-${currentUser.fotoPerfil}`;
      
      if (lastUserReload !== currentUserKey) {
        console.log('🔄 Recargando página para mostrar imagen actualizada...');
        
        // Guardar la clave del usuario actual en sessionStorage
        sessionStorage.setItem('lastUserReload', currentUserKey);
        
        // Recargar la página después de un pequeño delay
        setTimeout(() => {
          window.location.reload();
        }, 5);
        
        return; 
      }
      
      setUserReady(true);
      
    } else if (!loading && !currentUser) {
      console.log('❌ No hay usuario autenticado');
      setUserReady(true);
    }
  }, [loading, currentUser?.fotoPerfil, currentUser?._id]);

  // Cargar registros al montar el componente
  useEffect(() => {
    const cargarRegistros = async () => {
      if (!currentUser?._id) {
        setLoadingRegistros(false);
        return;
      }

      try {
        setLoadingRegistros(true);
        console.log('🔄 Cargando registros para usuario:', currentUser._id);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch(`http://localhost:3001/api/records/user/${currentUser._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Respuesta completa de la API:', data);
        console.log('📊 Tipo de datos recibidos:', typeof data);
        console.log('📊 Es array:', Array.isArray(data));
        
        // Verificar si la respuesta tiene la estructura esperada
        let registrosArray = [];
        
        if (Array.isArray(data)) {
          // Si data es directamente un array
          registrosArray = data;
        } else if (data && Array.isArray(data.data)) {
          // Si la respuesta viene envuelta en un objeto con propiedad 'data'
          registrosArray = data.data;
        } else if (data && Array.isArray(data.records)) {
          // Si la respuesta viene con propiedad 'records'
          registrosArray = data.records;
        } else if (data && typeof data === 'object') {
          // Si es un objeto, intentar encontrar el array
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            registrosArray = possibleArrays[0];
          }
        }
        
        console.log('📊 Array de registros extraído:', registrosArray);
        console.log('📊 Cantidad de registros:', registrosArray.length);
        
        // Si no hay registros, usar array vacío
        if (!Array.isArray(registrosArray)) {
          console.log('⚠️ No se encontraron registros válidos, usando array vacío');
          registrosArray = [];
        }
        
        // Formatear registros correctamente
        const registrosFormateados = registrosArray.map((registro, index) => {
          try {
            const fechaObj = new Date(registro.fecha);
            
            // Validar que la fecha sea válida
            if (isNaN(fechaObj.getTime())) {
              console.warn(`⚠️ Fecha inválida en registro ${index}:`, registro.fecha);
              // Usar fecha actual como fallback
              fechaObj.setTime(Date.now());
            }
            
            return {
              ...registro,
              fechaObj: fechaObj,
              fecha: fechaObj.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }),
              // Asegurar que horasRealizadas sea un string
              horasRealizadas: registro.horasRealizadas?.toString() || '0.00',
              // Formatear evidencias si existen
              evidencias: Array.isArray(registro.evidencias) ? registro.evidencias : []
            };
          } catch (error) {
            console.error(`❌ Error procesando registro ${index}:`, error, registro);
            // Retornar un registro por defecto en caso de error
            return {
              ...registro,
              fechaObj: new Date(),
              fecha: new Date().toLocaleDateString('es-MX'),
              horasRealizadas: '0.00',
              evidencias: []
            };
          }
        });
        
        // Ordenar por fecha descendente (más reciente primero)
        registrosFormateados.sort((a, b) => b.fechaObj - a.fechaObj);
        
        console.log('✅ Registros formateados correctamente:', registrosFormateados);
        setRegistrosHistorial(registrosFormateados);
        
      } catch (error) {
        console.error('❌ Error al cargar registros:', error);
        setError(`Error al cargar el historial: ${error.message}`);
        setRegistrosHistorial([]); // Asegurar que sea array vacío en caso de error
      } finally {
        setLoadingRegistros(false);
      }
    };

    cargarRegistros();
  }, [currentUser?._id]);

  // Establecer fecha de inicio al primer registro
  useEffect(() => {
    if (registrosHistorial.length > 0 && !fechaInicioServicio) {
      // El primer registro cronológicamente (ordenado por fecha ascendente)
      const registrosOrdenados = [...registrosHistorial].sort((a, b) => a.fechaObj - b.fechaObj);
      setFechaInicioServicio(registrosOrdenados[0].fechaObj);
      console.log('📅 Fecha de inicio del servicio establecida:', registrosOrdenados[0].fechaObj);
    }
  }, [registrosHistorial, fechaInicioServicio]);

  // Función para mostrar el diálogo
  const showConfirmDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  // Función para iniciar contador
  const iniciarContador = () => {
    showConfirmDialog('start');
  };

  // Función para finalizar servicio
  const finalizarServicio = () => {
    showConfirmDialog('end');
  };

  // Función para manejar la confirmación del diálogo
  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError('');

    if (dialogType === 'start') {
      const ahora = new Date();
      const hora = ahora.getHours().toString().padStart(2, '0');
      const minutos = ahora.getMinutes().toString().padStart(2, '0');
      setHoraEntrada(`${hora}:${minutos}`);
      setSesionIniciada(true);
      setSesionFinalizada(false);
      setTiempoAcumulado('0 horas y 0 minutos');
      setIsSubmitting(false);
    } else if (dialogType === 'end') {
      if (!actividades.trim()) {
        setError("Llena el apartado 'Actividades realizadas' para poder continuar");
        setIsSubmitting(false);
        return;
      }
      
      try {
        const ahora = new Date();
        const horaSalida = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
        
        let horasTrabajadas = 0;
        if (horaEntrada !== '--:--') {
          const [horaEntradaHoras, minutosEntrada] = horaEntrada.split(':').map(x => parseInt(x));
          const [horaSalidaHora, horaSalidaMinutos] = horaSalida.split(':').map(x => parseInt(x));
          horasTrabajadas = (horaSalidaHora - horaEntradaHoras) + (horaSalidaMinutos - minutosEntrada) / 60;
        }

        const formData = new FormData();
        formData.append('fecha', ahora.toISOString());
        formData.append('horaEntrada', horaEntrada);
        formData.append('horaSalida', horaSalida);
        formData.append('horasRealizadas', horasTrabajadas.toFixed(2));
        formData.append('titulo', activities.map(a => a.titulo).join('\n\n'));
        formData.append('descripcion', actividades);
        
        // Agregar las observaciones al formData correctamente
        if (activities && activities.length > 0) {
          const observacionesTexto = activities.map(a => a.observaciones || '').filter(obs => obs).join('\n\n');
          formData.append('observaciones', observacionesTexto);
        }

        // Agregar cada evidencia al formData
        evidencias.forEach(file => {
          formData.append('evidencias', file);
        });

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch('http://localhost:3001/api/records/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al guardar el registro');
        }

        console.log('✅ Registro guardado exitosamente:', data.data);

        // Actualizar el historial de registros con el nuevo registro
        const fechaObj = new Date(data.data.fecha);
        const nuevoRegistro = {
          ...data.data,
          fechaObj: fechaObj,
          fecha: fechaObj.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          horasRealizadas: data.data.horasRealizadas?.toString() || horasTrabajadas.toFixed(2),
          evidencias: data.data.evidencias || []
        };
        
        setRegistrosHistorial(prev => [nuevoRegistro, ...prev]);
        setSesionIniciada(false);
        setSesionFinalizada(true);
        setHoraSalida(horaSalida);
        const horasEnteras = Math.floor(horasTrabajadas);
        const minutosDecimal = (horasTrabajadas - horasEnteras) * 60;
        const minutos = Math.round(minutosDecimal);
        setTiempoAcumulado(`${horasEnteras} horas y ${minutos} minutos`);
        setActividades('');
        setEvidencias([]);
        setActividadNumero(prev => prev + 1);

      } catch (error) {
        console.error('❌ Error al guardar registro:', error);
        setError(error.message || 'Error al guardar el registro. Por favor intenta de nuevo.');
      } finally {
        setIsSubmitting(false);
      }
    }
    setOpenDialog(false);
  };

  // Calcular el total de horas y verificar si se completaron 500 horas
  const totalHoras = useCallback(() => {
    if (!Array.isArray(registrosHistorial) || registrosHistorial.length === 0) {
      return '0 horas y 0 minutos';
    }

    const total = registrosHistorial.reduce((sum, registro) => {
      const horas = parseFloat(registro.horasRealizadas) || 0;
      return sum + horas;
    }, 0);
    
    // Verificar si se completaron 500 horas
    if (total >= 500 && !fechaFinServicio) {
      // El último registro cronológicamente
      const registrosOrdenados = [...registrosHistorial].sort((a, b) => b.fechaObj - a.fechaObj);
      if (registrosOrdenados.length > 0) {
        setFechaFinServicio(registrosOrdenados[0].fechaObj);
        console.log('🎉 ¡500 horas completadas! Fecha de fin:', registrosOrdenados[0].fechaObj);
      }
    }
    
    // Convertir el total a horas y minutos
    const horasEnteras = Math.floor(total);
    const minutosDecimal = (total - horasEnteras) * 60;
    const minutos = Math.round(minutosDecimal);
    
    return `${horasEnteras} horas y ${minutos} minutos`;
  }, [registrosHistorial, fechaFinServicio]);

  // Función para manejar la selección de fecha en el calendario
  const handleFechaSeleccionada = useCallback((fecha) => {
    console.log('📅 Fecha seleccionada en calendario:', fecha);
    setFechaSeleccionada(fecha);
    
    // Buscar el registro que coincida con la fecha seleccionada
    const registro = registrosHistorial.find(reg => {
      const regFecha = reg.fechaObj;
      const mismaFecha = regFecha.getDate() === fecha.getDate() && 
                        regFecha.getMonth() === fecha.getMonth() && 
                        regFecha.getFullYear() === fecha.getFullYear();
      return mismaFecha;
    });
    
    console.log('🔍 Registro encontrado para la fecha:', registro);

    if (registro) {
      // Asegurar que el campo evidencias esté definido y tenga el formato correcto
      const evidenciasFormateadas = registro.evidencias.map(evidencia => ({
        ...evidencia,
        nombre: evidencia.nombre || evidencia.ruta?.split('/').pop() || 'Archivo'
      }));

      const registroFormateado = {
        ...registro,
        evidencias: evidenciasFormateadas
      };

      setRegistroSeleccionado(registroFormateado);
    } else {
      setRegistroSeleccionado(null);
    }
    
    setMostrarTabla(false);
    setMostrarDetalle(true);
  }, [registrosHistorial]);

  const volverATabla = () => {
    setMostrarTabla(true);
    setMostrarDetalle(false);
    setFechaSeleccionada(null);
    setRegistroSeleccionado(null);
  };

  // Función para marcar fechas especiales en el calendario
  const tileClassName = useCallback(({ date, view }) => {
    if (view === 'month') {
      const clases = [];
      
      // Fechas con registros
      const tieneRegistro = registrosHistorial.some(registro => {
        const regFecha = registro.fechaObj;
        return regFecha.getDate() === date.getDate() && 
              regFecha.getMonth() === date.getMonth() && 
              regFecha.getFullYear() === date.getFullYear();
      });
      if (tieneRegistro) clases.push('fecha-con-registro');
      
      // Fecha de inicio
      if (fechaInicioServicio && 
          fechaInicioServicio.getDate() === date.getDate() && 
          fechaInicioServicio.getMonth() === date.getMonth() && 
          fechaInicioServicio.getFullYear() === date.getFullYear()) {
        clases.push('fecha-inicio-servicio');
      }
      
      // Fecha de fin (500 horas completadas)
      if (fechaFinServicio && 
          fechaFinServicio.getDate() === date.getDate() && 
          fechaFinServicio.getMonth() === date.getMonth() && 
          fechaFinServicio.getFullYear() === date.getFullYear()) {
        clases.push('fecha-fin-servicio');
      }
      
      return clases.join(' ');
    }
  }, [registrosHistorial, fechaInicioServicio, fechaFinServicio]);

  // Función para formatear la fecha en formato legible
  const formatearFecha = useCallback((fecha) => {
    if (!fecha) return '';
    
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  }, []);

  // Limpieza de recursos
  useEffect(() => {
    return () => {
      registrosHistorial.forEach(registro => {
        registro.evidencias?.forEach(evidencia => {
          if (evidencia.url?.startsWith('blob:')) {
            URL.revokeObjectURL(evidencia.url);
          }
        });
      });
    };
  }, [registrosHistorial]);

  useEffect(() => {
    // Cerrar el mensaje de bienvenida después de 5 segundos
    const timer = setTimeout(() => {
      setOpenWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const renderEvidenceSection = () => (
    <div className="evidence-section">
      <button 
        className="add-evidence-btn"
        onClick={() => setShowEvidenceModal(true)}
      >
        + Agregar evidencias
      </button>
      
      {showEvidenceModal && (
<div className="evidence-modal">
          <div className="modal-content"style={{marginTop: '120px'}}>
            <div className="modal-header">
              <h3>Registro de Actividades</h3>
              <button 
                className="close-modal"
                onClick={() => setShowEvidenceModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="activities-form">
                <div className="form-group">
                  <TextField
                    id="Titulo-outlined"
                    label="Titulo de la Actividad"
                    variant="outlined"
                    multiline
                    rows={1}
                    value={currentActivity.titulo}
                    onChange={(e) => setCurrentActivity(prev => ({...prev, titulo: e.target.value}))}
                    placeholder="Describe detalladamente la actividad realizada"
                    fullWidth
                    required
                    style={{ marginBottom: '16px', marginTop: '16px' }}
                  />
                  
                  <TextField 
                    id="descripcion-outlined"
                    label="Descripción"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={currentActivity.descripcion}
                    onChange={(e) => setCurrentActivity(prev => ({...prev, descripcion: e.target.value}))}
                    placeholder="Describe detalladamente la actividad realizada"
                    fullWidth
                    required
                    style={{ marginBottom: '16px', marginTop: '16px' }}
                  />

                  <TextField 
                    id="observaciones-outlined"
                    label="Observaciones"
                    variant="outlined"
                    multiline
                    rows={3}
                    value={currentActivity.observaciones || ''}
                    onChange={(e) => setCurrentActivity(prev => ({...prev, observaciones: e.target.value}))}
                    placeholder="Observaciones adicionales (opcional)"
                    fullWidth
                    style={{ marginBottom: '16px' }}
                  />
                  
                  <div className="evidence-upload">
                    <button 
                      className="upload-button"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Seleccionar archivos
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="*/*"
                      multiple
                      style={{ display: 'none' }}
                    />
                    {currentActivity.evidencias.length > 0 && (
                      <div className="current-evidence-list">
                        {currentActivity.evidencias.map((evidencia, index) => (
                          <div key={index} className="evidence-item">
                            <span className="evidence-info">
                              {getFileIcon(evidencia.name)} {evidencia.name}
                            </span>
                            <button 
                              className="remove-evidence"
                              onClick={() => removeCurrentEvidencia(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    className="add-activity-btn"
                    onClick={handleAddActivity}
                    disabled={!isActivityValid()}
                  >
                    Agregar Actividad
                  </button>
                </div>
              </div>

              <div className="activities-table">
                <table style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>N°</th>
                      <th style={{ width: '20%' }}>Título</th>
                      <th style={{ width: '30%' }}>Descripción</th>
                      <th style={{ width: '25%' }}>Observaciones</th>
                      <th style={{ width: '15%' }}>Evidencias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td style={{ wordBreak: 'break-word' }}>{activity.titulo}</td>
                        <td style={{ wordBreak: 'break-word' }}>{activity.descripcion}</td>
                        <td style={{ wordBreak: 'break-word' }}>{activity.observaciones || 'N/A'}</td>
                        <td>
                          {activity.evidencias.map((ev, i) => (
                            <div key={i} className="evidence-tag">
                              {getFileIcon(ev.name)} {ev.name}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="save-all"
                onClick={handleSaveAll}
                disabled={activities.length === 0}
              >
                Guardar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Mostrar loading mientras se cargan los datos
  if (loading || !userReady || loadingRegistros) {
    return (
      <div className="loading-container" style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>
          {loading ? 'Cargando datos del usuario...' : 
           loadingRegistros ? 'Cargando historial de registros...' : 
           'Preparando interfaz...'}
        </div>
        <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
          {loading ? 'Cargando usuario...' : 
           loadingRegistros ? 'Obteniendo registros de la base de datos...' :
           'Preparando interfaz...'}
        </div>
      </div>
    );
  }

  return (
    <div className="active-session-container">
      <div className="user-profile-header" style={{marginTop: '50px'}}>
        <div className="user-profile-container">         
          <div className="user-avatar">
            <img
              key={`user-${currentUser?._id}-${currentUser?.fotoPerfil}`}
              src={currentUser?.fotoPerfil && currentUser.fotoPerfil !== '' 
                ? `http://localhost:3001/uploads/perfiles/${currentUser.fotoPerfil}?t=${Date.now()}`
                : 'http://localhost:3001/uploads/perfiles/2138822222222_1749571359362.png'
              }
              alt={`Foto de perfil de ${currentUser?.nombre || 'Usuario'}`}
              className="profile-image"
              onLoad={(e) => {
                console.log('✅ IMAGEN CARGADA CORRECTAMENTE:');
                console.log('📸 URL:', e.target.src);
                console.log('👤 Usuario:', currentUser?.nombre);
                console.log('📁 Archivo:', currentUser?.fotoPerfil);
                
                e.target.style.opacity = '1';
                e.target.style.display = 'block';
              }}
              onError={(e) => {
                console.error('❌ ERROR CARGANDO IMAGEN:');
                console.error('🔗 URL fallida:', e.target.src);
                
                if (!e.target.src.includes('2138822222222_1749571359362.png')) {
                  e.target.onerror = null;
                  e.target.src = `http://localhost:3001/uploads/perfiles/2138822222222_1749571359362.png?t=${Date.now()}`;
                }
              }}
              style={{
                transition: 'opacity 0.3s ease',
                opacity: 1,
                display: 'block'
              }}
            />
          </div>
          <div className="user-info">
            <h2>{`${currentUser?.nombre || ''} ${currentUser?.apellidoPaterno || ''} ${currentUser?.apellidoMaterno || ''}`}</h2>
            <div className="user-details" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '16px',
              lineHeight: '1.5'
            }}>               
              <p style={{ margin: '0', wordBreak: 'break-word' }}>
                <strong>Número de Control:</strong> {currentUser?.numeroControl}
              </p>               
              <p style={{ margin: '0', wordBreak: 'break-word' }}>
                <strong>Correo:</strong> {currentUser?.email}
              </p>               
              <p style={{ margin: '0', wordBreak: 'break-word' }}>
                <strong>Carrera:</strong> {currentUser?.carrera?.nombre}
              </p>               
              <p style={{ margin: '0', wordBreak: 'break-word' }}>
                <strong>Semestre:</strong> {currentUser?.semestre}°
              </p>             
            </div>
          </div>
        </div>
      </div>

      <h2>Registro de Horas de Servicio Social</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button className="close-error" onClick={() => setError('')}>×</button>
        </div>
      )}

      {openWelcome && currentUser && (
        <div className="welcome-message">
          ¡Bienvenido(a) {`${currentUser.nombre} ${currentUser.apellidoPaterno}`}! Iniciaste sesión correctamente.
        </div>
      )}
      
      <div className="session-table-container">
        <div className="connection-status">
          <span className="status-dot"></span>
          <span>Conectado a la red</span>
        </div>
        
        <table className="session-table">
          <thead>
            <tr>
              <th colSpan="2">Sesión Actual</th>
              <th>Historial de Registros</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="2">
                <div className="session-details">
                  <div className="session-info">
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td><strong>Fecha:</strong></td>
                          <td>{new Date().toLocaleDateString('es-MX')}</td>
                        </tr>
                        <tr>
                          <td><strong>Hora de entrada:</strong></td>
                          <td>{horaEntrada}</td>
                        </tr>
                        <tr>
                          <td><strong>Hora de salida:</strong></td>
                          <td>{horaSalida}</td>
                        </tr>
                        <tr>
                          <td><strong>Tiempo acumulado:</strong></td>
                          <td>{tiempoAcumulado}</td>
                        </tr>
                        <tr>
                          <td><strong>Total horas acumuladas:</strong></td>
                          <td>{totalHoras()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  
                  {renderEvidenceSection()}
                  
                  <div className="session-status">
                    {sesionFinalizada ? 'Sesión finalizada' : 
                    sesionIniciada ? 'Sesión en progreso' : 'No hay horas registradas hoy'}
                    {fechaFinServicio && <div className="servicio-completado">¡Servicio social completado!</div>}
                  </div>
                  
                  <div className="button-group">
                    {!sesionIniciada && !sesionFinalizada && !fechaFinServicio && (
                      <button 
                        className="start-button"
                        onClick={iniciarContador}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Cargando...' : 'Registrar Hora de Entrada'}
                      </button>
                    )}
                    
                    {sesionIniciada && !sesionFinalizada && (
                      <button 
                        className="stop-button"
                        onClick={finalizarServicio}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Cargando...' : 'Finalizar servicio diario'}
                      </button>
                    )}
                  </div>
                </div>
              </td>              
              <td>
                <SessionHistory
                  handleFechaSeleccionada={handleFechaSeleccionada}
                  fechaSeleccionada={fechaSeleccionada}
                  tileClassName={tileClassName}
                  mostrarTabla={mostrarTabla}
                  registrosHistorial={registrosHistorial}
                  totalHoras={totalHoras}
                  mostrarDetalle={mostrarDetalle}
                  volverATabla={volverATabla}
                  formatearFecha={formatearFecha}
                  registroSeleccionado={registroSeleccionado}
                  getFileIcon={getFileIcon}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Diálogo de confirmación */}
      {openDialog && (
        <div className="dialog-overlay">
          <div className="dialog-container">
            <div className="dialog-header">
              <h3>{dialogType === 'start' ? 'Iniciar registro de horas' : 'Finalizar servicio diario'}</h3>
            </div>
            <div className="dialog-content">
              <p>
                {dialogType === 'start' 
                  ? "Al iniciar el contador de horas tu tiempo empezará a ser contado y no podrá ser corregido. Si lo iniciaste antes de tiempo, solicita ayuda a tu administrador para corregir tu hora."
                  : "Al presionar este botón finalizarás el conteo de tus horas diarias de servicio y no podrás volver a iniciarlo. ¿Deseas finalizar el conteo de horas de servicio?"
                }
              </p>
            </div>
            <div className="dialog-actions">
              <button 
                className="dialog-cancel"
                onClick={() => !isSubmitting && setOpenDialog(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                className={`dialog-confirm ${dialogType === 'start' ? 'confirm-primary' : 'confirm-error'}`}
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSession;