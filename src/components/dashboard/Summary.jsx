import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Divider
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import { getSummary } from '../../services/hours';

export default function Summary() {
  const { currentUser } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!currentUser?.id) {
        console.log('No hay usuario activo');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSummary(currentUser.id);
        setSummary(data);
      } catch (error) {
        console.error('Error al cargar resumen:', error);
        setSummary({
          totalHours: 0,
          totalDays: 0,
          averageHoursPerDay: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resumen de Horas
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total de Horas
              </Typography>
              <Typography variant="h3">
                {summary.totalHours.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Días de Servicio
              </Typography>
              <Typography variant="h3">
                {summary.totalDays}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Promedio por Día
              </Typography>
              <Typography variant="h3">
                {summary.averageHoursPerDay.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" gutterBottom>
        Progreso
      </Typography>
      <Box sx={{ width: '100%', bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
        <Typography variant="body1">
          Aquí podrías incluir un gráfico de progreso (usando Chart.js o similar)
        </Typography>
      </Box>
    </Box>
  );
}