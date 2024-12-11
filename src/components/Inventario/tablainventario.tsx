import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery";

import "datatables.net-responsive";

const API_URL = 'http://localhost:8010/api/producto';

const TablaInventario: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);

  useEffect(() => {
    cargarInventario();
  }, []);

  useEffect(() => {
    if (productos.length > 0) {
      if ($.fn.DataTable.isDataTable("#tablaInventario")) {
        $("#tablaInventario").DataTable().destroy();
      }
      $('#tablaInventario').DataTable({
        language: {
          lengthMenu: '_MENU_',
          info: 'Mostrando página _PAGE_ de _PAGES_',
          infoEmpty: 'Mostrando 0 registros',
          infoFiltered: '(Total de _MAX_ registro(s))',
          zeroRecords: "<div class='alert alert-info m-b-xs'>No se encontraron registros.",
          paginate: {
            next: 'Siguiente',
            previous: 'Anterior',
          },
        },
        responsive: true,
      });
    }
  }, [productos]);

  const cargarInventario = async () => {
    try {
      const response = await axios.get(API_URL);
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar los productos', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión Inventario</h1>       
      </div>
      <div className="table-responsive">
        <table
          id="tablaInventario"
          className="table table-custom table-striped dataTable"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Descripción</th>
              <th>Fecha Vencimiento</th>
              <th>Categoría</th>
            </tr>
          </thead>
          <tbody>
          {productos.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.id}</td>
                      <td>{producto.nombre}</td>
                      <td>{producto.precio.toFixed(2)}</td>
                      <td>{producto.cantidad}</td> {/* Nueva celda */}
                      <td>{producto.descripcion || 'No disponible'}</td>
                      <td>{producto.fechaVencimiento || 'No disponible'}</td>
                      <td>{producto.categoria || 'No disponible'}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>      
    </div>
  );
};

export default TablaInventario;
