import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import ClienteForm from './clienteform';

import "datatables.net-responsive";
/*import "datatables.net-responsive-dt/css/responsive.dataTables.css";*/

const API_URL = "http://localhost:8010/api/cliente";

interface ClienteListProps {
  userRole: string; // Añadimos una prop para el rol del usuario
}

const ClienteList: React.FC<ClienteListProps> = ({ userRole }) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    if (clientes.length > 0) {
      if ($.fn.DataTable.isDataTable("#tablaCliente")) {
        $("#tablaCliente").DataTable().destroy();
      }

      $("#tablaCliente").DataTable({
        language: {
          lengthMenu: "_MENU_",
          info: "Mostrando página _PAGE_ de _PAGES_",
          infoEmpty: "Mostrando 0 registros",
          infoFiltered: "(Total de _MAX_ registro(s))",
          zeroRecords:
            "<div class='alert alert-info m-b-xs'>No se encontraron registros.",
          paginate: {
            next: "Siguiente",
            previous: "Anterior",
          },
        },
        responsive: true,
      });
    }
  }, [clientes]);

  const cargarClientes = async () => {
    try {
      const response = await axios.get(API_URL);
      setClientes(response.data);
    } catch (error) {
      console.error("Error al cargar los clientes", error);
    }
  };

  const addNuevoCliente = () => {
    setClienteSeleccionado(null); // Asegúrate de que no haya cliente seleccionado
    setShowModal(true);  // Abre el modal para nuevo cliente
  };

  const closeModal = () => {
    setShowModal(false); // Cierra el modal
  };

  const editarCliente = (cliente: any) => {
    setClienteSeleccionado(cliente); // Asigna el cliente seleccionado
    setShowModal(true); // Abre el modal para editar cliente
  };

  const eliminarCliente = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        cargarClientes(); // Recarga la lista después de eliminar
      } catch (error) {
        console.error("Error al eliminar el cliente", error);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión Cliente</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button
              type="button"
              onClick={addNuevoCliente}
              className="btn btn-success btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#nuevoClienteModal"
            >
              Nuevo Cliente
            </button>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table
          id="tablaCliente"
          className="table table-custom table-striped dataTable"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente: any) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.apellidos}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefono}</td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm m-1"
                    onClick={() => editarCliente(cliente)}
                  >
                    Editar
                  </button>
                  {userRole === "ADMIN" && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarCliente(cliente.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          id="nuevoClienteModal"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <ClienteForm cliente={clienteSeleccionado} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteList;