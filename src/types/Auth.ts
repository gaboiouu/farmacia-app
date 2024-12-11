// src/types/Auth.ts
export interface User {
    id?: number;
    username: string;
    password?: string;
    token?: string;
    nombre: string;
    apellido: string;
    email: string;
    role?: string;
}

export interface Role {
    id: number;
    name: string;
}

