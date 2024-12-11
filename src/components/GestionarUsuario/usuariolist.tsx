import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import UsuarioForm from "./usuarioform";

import "datatables.net-responsive";
/*import "datatables.net-responsive-dt/css/responsive.dataTables.css";*/

const API_URL = "http://localhost:8010/api/users";

const UsuarioList: React.FC = () => {
  const [usuario, setusuario] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, []);

  useEffect(() => {
    if (usuario.length > 0) {
      if ($.fn.DataTable.isDataTable("#tablaUsuarios")) {
        $("#tablaUsuarios").DataTable().destroy();
      }

      $("#tablaUsuarios").DataTable({
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
  }, [usuario]);

  const cargarUsuario = async () => {
    try {
      const response = await axios.get(API_URL);

      setusuario(response.data);
      debugger;
    } catch (error) {
      console.error("Error al cargar los usuario", error);
    }
  };

  const addNuevoUsuario = () => {
    setUsuarioSeleccionado(null); // Asegúrate de que no haya cliente seleccionado
    setShowModal(true); // Abre el modal para nuevo cliente
  };

  const closeModal = () => {
    setShowModal(false); // Cierra el modal
  };

  const editarUsuario = (usuario: any) => {
    usuario.password = "";
    setUsuarioSeleccionado(usuario); // Asigna el cliente seleccionado
    setShowModal(true); // Abre el modal para editar cliente
  };

  const eliminarUsuario = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        cargarUsuario(); // Recarga la lista después de eliminar
      } catch (error) {
        console.error("Error al eliminar el cliente", error);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión Usuarios</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button
              type="button"
              onClick={addNuevoUsuario}
              className="btn btn-success btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#nuevoUsuarioModal"
            >
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table
          id="tablaUsuarios"
          className="table table-custom table-striped dataTable"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuario.map((usuario: any) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.apellido}</td>
                <td>{usuario.email}</td>
                <td>{usuario.roles.map((rol: any) => rol.name).join(", ")}</td>
                <td className="text-center">
                  {usuario.id !== 1 && ( // Condición para mostrar los botones solo si el ID no es 1
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm m-1"
                        onClick={() => editarUsuario(usuario)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarUsuario(usuario.id)}
                      >
                        Eliminar
                      </button>
                    </>
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
            <UsuarioForm usuario={usuarioSeleccionado} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuarioList;
