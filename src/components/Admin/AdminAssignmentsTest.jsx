import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';

const AdminAssignmentsTest = ({ open, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h5">
                    Test - Gestión de Asignaciones
                </Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6">
                        🧪 Componente de prueba funcionando correctamente
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Si puedes ver esto, el problema está en el componente AdminAssignments original.
                        Vamos a identificar qué parte está causando el error.
                    </Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AdminAssignmentsTest;
