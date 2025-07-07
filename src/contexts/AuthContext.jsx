import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import setupAxiosInterceptors from '../utils/axiosDebugger';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurar interceptors de axios para debugging
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true, user };
      }
      
      throw new Error('Credenciales inválidas');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Datos de registro:', userData);
      
      const response = await axios.post('http://localhost:3001/api/auth/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('✅ Respuesta del servidor:', response.data);

      if (response.data.success) {
        return { success: true, user: response.data.user, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Error inesperado durante el registro');
      }
    } catch (error) {
      console.error('❌ Error detallado:', error);
      console.error('❌ Respuesta del servidor:', error.response?.data);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error al registrar usuario. Por favor, intenta de nuevo.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ✨ También remover user del localStorage
    setCurrentUser(null);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('🔍 Verificando token y obteniendo datos actualizados...');
          const response = await axios.get('http://localhost:3001/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const userData = response.data.user;
          console.log('✅ Datos del usuario actualizados:', userData);
          console.log('📁 Foto de perfil:', userData?.fotoPerfil);
          
          // Actualizar localStorage con datos frescos
          localStorage.setItem('user', JSON.stringify(userData));
          
          // ✨ Pequeño delay para asegurar que todo esté listo
          setTimeout(() => {
            setCurrentUser(userData);
            setLoading(false);
          }, 100);
          
        } catch (error) {
          console.error('❌ Error verificando token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
          setLoading(false);
        }
      } else {
        localStorage.removeItem('user');
        setCurrentUser(null);
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // ✨ NUEVO: Función para actualizar el perfil del usuario
  const updateUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (token && currentUser) {
      try {
        console.log('🔄 Actualizando perfil del usuario...');
        const response = await axios.get('http://localhost:3001/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        console.log('✅ Perfil actualizado:', userData);
        
        return userData;
      } catch (error) {
        console.error('❌ Error actualizando perfil:', error);
        return null;
      }
    }
  };

  // ✨ NUEVO: Función para solicitar recuperación de contraseña
  const forgotPassword = async (email) => {
    try {
      console.log('📧 Enviando solicitud de recuperación para:', email);
      const response = await axios.post('http://localhost:3001/api/auth/forgot-password', {
        email
      });
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      return { 
        success: true, 
        message: response.data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico' 
      };
    } catch (error) {
      console.error('❌ Error en forgotPassword:', error);
      console.error('❌ Respuesta del error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al procesar la solicitud');
    }
  };

  // ✨ NUEVO: Función para restablecer contraseña
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/reset-password', {
        token,
        newPassword
      });
      
      return { 
        success: true, 
        message: response.data.message || 'Contraseña restablecida exitosamente' 
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al restablecer la contraseña');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        login, 
        register, 
        logout,
        loading,
        updateUserProfile, // ✨ Nueva función disponible
        forgotPassword,    // ✨ Nueva función para recuperar contraseña
        resetPassword      // ✨ Nueva función para restablecer contraseña
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};