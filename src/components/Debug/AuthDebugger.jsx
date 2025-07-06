import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const AuthDebugger = () => {
    const { currentUser, login } = useContext(AuthContext);
    const [showTest, setShowTest] = useState(false);
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    const handleTestLogin = async () => {
        try {
            console.log('🔍 Intentando login de prueba...');
            const result = await login('admin@test.com', 'admin123');
            console.log('✅ Login exitoso:', result);
        } catch (error) {
            console.error('❌ Error en login:', error);
        }
    };

    const testAssignmentCreation = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('❌ No hay token');
                return;
            }

            const formData = new FormData();
            formData.append('title', 'Asignación de Prueba Debug');
            formData.append('description', 'Prueba desde el debugger');
            formData.append('dueDate', new Date('2025-12-31').toISOString());
            formData.append('isGeneral', 'true');

            const response = await fetch('http://localhost:3001/api/assignments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            console.log('📋 Respuesta de asignación:', data);
        } catch (error) {
            console.error('❌ Error creando asignación:', error);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: 10, 
            right: 10, 
            background: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px'
        }}>
            <div><strong>Debug Auth Info:</strong></div>
            <div>Current User: {currentUser ? currentUser.email : 'null'}</div>
            <div>Token: {token ? 'Presente' : 'Ausente'}</div>
            <div>User in localStorage: {user ? 'Presente' : 'Ausente'}</div>
            <div>Role: {currentUser?.role || 'No definido'}</div>
            
            <button 
                onClick={() => setShowTest(!showTest)}
                style={{ marginTop: '5px', fontSize: '10px' }}
            >
                {showTest ? 'Ocultar' : 'Mostrar'} Tests
            </button>
            
            {showTest && (
                <div style={{ marginTop: '5px' }}>
                    <button 
                        onClick={handleTestLogin}
                        style={{ fontSize: '10px', marginRight: '5px' }}
                    >
                        Test Login
                    </button>
                    <button 
                        onClick={testAssignmentCreation}
                        style={{ fontSize: '10px' }}
                    >
                        Test Asignación
                    </button>
                </div>
            )}
        </div>
    );
};

export default AuthDebugger;
