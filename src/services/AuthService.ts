// src/services/AuthService.ts
import axios from 'axios';
import { User } from '../types/Auth';

// URL base para la autenticación
const API_URL = '/authenticate';

class AuthService {
  // Método para iniciar sesión
  async login(username: string, password: string): Promise<User | null> {
    try {
      const response = await axios.post(API_URL, null, {
        params: { username, password }
      });
      
      if (response.data.token) {
        const userData: User = {
          username,
          nombre: response.data.user.nombre,
          apellido: response.data.user.apellido,
          email: response.data.user.email,
          role: response.data.user.role,
          token: response.data.token
        };
        // Guardar datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        // Configurar el token en los headers de Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        return userData;
      }
      return null;
    } catch (error) {
      throw new Error('Credenciales inválidas');
    }
  }

  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  // Método para obtener el usuario actual
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user: User = JSON.parse(userStr);
      // Restaurar el token en los headers de Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      return user;
    }
    return null;
  }
}

// Exportar una instancia única del servicio
export default new AuthService();