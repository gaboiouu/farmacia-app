import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";
import ProductoForm from './productoform';

import "datatables.net-responsive";
/*import "datatables.net-responsive-dt/css/responsive.dataTables.css";*/

const API_URL = "http://localhost:8010/api/producto";

const ProductoList: React.FC = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    if (productos.length > 0) {
      if ($.fn.DataTable.isDataTable("#tablaProducto")) {
        $("#tablaProducto").DataTable().destroy();
      }

      $("#tablaProducto").DataTable({
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
  }, [productos]);

  const cargarProductos = async () => {
    try {
      const response = await axios.get(API_URL);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar los productos", error);
    }
  };

  const addNuevoProducto = () => {
    setProductoSeleccionado(null); // Asegúrate de que no haya producto seleccionado
    setShowModal(true);  // Abre el modal para nuevo producto
  };

  const closeModal = () => {
    setShowModal(false); // Cierra el modal
  };

  const editarProducto = (producto: any) => {
    setProductoSeleccionado(producto); // Asigna el producto seleccionado
    setShowModal(true); // Abre el modal para editar producto
  };

  const eliminarProducto = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        cargarProductos(); // Recarga la lista después de eliminar
      } catch (error) {
        console.error("Error al eliminar el producto", error);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión Producto</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button
              type="button"
              onClick={addNuevoProducto}
              className="btn btn-success btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#nuevoProductoModal"
            >
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table
          id="tablaProducto"
          className="table table-custom table-striped dataTable"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Fecha Vencimiento</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto: any) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.nombre}</td>
                <td>{producto.precio.toFixed(2)}</td>
                <td>{producto.cantidad}</td>
                <td>{producto.fechaVencimiento}</td>
                <td>{producto.descripcion}</td>
                <td>{producto.categoria}</td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm m-1"
                    onClick={() => editarProducto(producto)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminarProducto(producto.id)}
                  >
                    Eliminar
                  </button>
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
          id="nuevoProductoModal"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <ProductoForm producto={productoSeleccionado} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoList;