import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8010/api/cliente";

interface ClienteFormProps {
  cliente?: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
  };
  onClose: () => void; // Prop para manejar el cierre del modal
}

const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onClose }) => {
  const [clienteState, setCliente] = useState(
    cliente || { nombre: "", apellidos: "", email: "", telefono: "" }
  );
  const [error, setError] = useState<string>("");
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const clienteEditar = JSON.parse(
        localStorage.getItem("clienteEditar") || "{}"
      );
      setCliente(clienteEditar);
    }
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // Validación de los campos
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(clienteState.nombre)) {
      setError("El nombre solo puede contener letras");
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(clienteState.apellidos)) {
      setError("Los apellidos solo pueden contener letras");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clienteState.email)) {
      setError("El email debe ser un correo válido.");
      return;
  }  

    if (!/^\d{9}$/.test(clienteState.telefono)) {
      setError("El teléfono debe tener 9 dígitos y solo contener números");
      return;
    }

    try {
      debugger;
      await axios.post(API_URL, clienteState);
      if (cliente) {
        /*await axios.put(`${API_URL}/${id}`, clienteState);*/
        alert("Cliente actualizado exitosamente.");
      } else {
        /*await axios.post(API_URL, clienteState);*/
        alert("Cliente creado exitosamente.");
      }
      localStorage.removeItem("clienteEditar");
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar el cliente:", error);
      setError("Hubo un error al guardar el cliente");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {cliente ? "Editar Cliente" : "Nuevo Cliente"}
          </h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="form-group mb-3">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              value={clienteState.nombre}
              onChange={(e) =>
                setCliente({ ...clienteState, nombre: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group mb-3">
            <label>Apellidos</label>
            <input
              type="text"
              className="form-control"
              name="apellidos"
              value={clienteState.apellidos}
              onChange={(e) =>
                setCliente({ ...clienteState, apellidos: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={clienteState.email}
              onChange={(e) =>
                setCliente({ ...clienteState, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Teléfono</label>
            <input
              type="tel"
              className="form-control"
              name="telefono"
              value={clienteState.telefono}
              onChange={(e) =>
                setCliente({ ...clienteState, telefono: e.target.value })
              }
              required
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary ">
            Guardar
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClienteForm;
