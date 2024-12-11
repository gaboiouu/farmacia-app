// src/services/UserService.ts
import axios from 'axios';
import { User, Role } from '../types/Auth';

const API_URL = '/api/users';

class UserService {
    getUsers() {
        return axios.get<User[]>(API_URL);
    }

    getUserById(id: number) {
        return axios.get<User>(`${API_URL}/${id}`);
    }

    createUser(user: Omit<User, 'id'> & { roleId: number }) {
        const userData = {
            username: user.username,
            password: user.password,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            roles: [{ id: parseInt(user.roleId.toString()) }]
        };
        return axios.post<User>(API_URL, userData);
    }

    updateUser(id: number, user: Partial<User> & { roleId?: string }) {
        const userData: {
            username: string | undefined;
            nombre: string | undefined;
            apellido: string | undefined;
            email: string | undefined;
            roles: { id: number }[];
            password?: string;
        } = {
            username: user.username,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            roles: [{ id: parseInt(user.roleId || '1') }]
        };
        
        if (user.password) {
            userData['password'] = user.password;
        }
        
        return axios.put<User>(`${API_URL}/${id}`, userData);
    }

    deleteUser(id: number) {
        return axios.delete<void>(`${API_URL}/${id}`);
    }

    getRoles() {
        return axios.get<Role[]>('/api/roles');
    }
}

export default new UserService();