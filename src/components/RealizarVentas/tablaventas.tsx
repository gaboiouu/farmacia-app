import React, { useEffect, useState } from 'react';
import axios from 'axios';
import $ from 'jquery';
import 'datatables.net';
import VentaForm from './registroventas';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const API_URL = 'http://localhost:8010/api/venta';
const API_URL_VENTA_DETALLE = 'http://localhost:8010/api/ventadetalle/detalle';
const API_URL_CLIENTE = 'http://localhost:8010/api/cliente';
const API_URL_PRODUCTO = 'http://localhost:8010/api/producto';

interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

interface VentaDetalle {
  id: number;
  idproducto: number;
  cantidad: number;
  producto?: Producto;
}

interface Venta {
  id: number;
  idcliente: number;
  fechaRegistro: string;
  precioTotal: number;
  detalles: VentaDetalle[];
  cliente?: Cliente;
}

const TablaVentas: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeZone = 'America/Lima'; // Cambia esto a tu zona horaria deseada

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (ventas.length > 0) {
      initializeDataTable();
    }
  }, [ventas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [clientesResponse, ventasResponse] = await Promise.all([
        axios.get(API_URL_CLIENTE),
        axios.get(API_URL)
      ]);
      setClientes(clientesResponse.data);
      setVentas(ventasResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const initializeDataTable = () => {
    if ($.fn.DataTable.isDataTable("#tablaVentas")) {
      $("#tablaVentas").DataTable().destroy();
    }

    $('#tablaVentas').DataTable({
      language: {
        lengthMenu: '_MENU_',
        info: 'Mostrando página _PAGE_ de _PAGES_',
        infoEmpty: 'Mostrando 0 registros',
        infoFiltered: '(Total de _MAX_ registro(s))',
        zeroRecords: "<div class='alert alert-info m-b-xs'>No se encontraron registros.</div>",
        paginate: {
          next: 'Siguiente',
          previous: 'Anterior',
        },
      },
      responsive: true,
    });
  };

  const verDetalle = async (venta: Venta) => {
    try {
      setLoading(true);
      setError(null);

      const ventaResponse = await axios.get(`${API_URL}/${venta.id}`);
      const ventaData = ventaResponse.data;

      const clienteResponse = await axios.get(`${API_URL_CLIENTE}/${venta.idcliente}`);
      const clienteData = clienteResponse.data;

      const ventaDetalle = await axios.get(`${API_URL_VENTA_DETALLE}/${venta.id}`);
      if (Array.isArray(ventaDetalle.data)) {
        const detallesPromises = ventaDetalle.data.map(async (detalle: VentaDetalle) => {
          try {
            const productoResponse = await axios.get(`${API_URL_PRODUCTO}/${detalle.idproducto}`);
            return {
              ...detalle,
              producto: productoResponse.data
            };
          } catch (error) {
            console.error(`Error loading product ${detalle.idproducto}:`, error);
            return {
              ...detalle,
              producto: null
            };
          }
        });

        const detallesConProductos = await Promise.all(detallesPromises);

        // Agrupar productos por id y sumar cantidades y subtotales
        const detallesAgrupados = detallesConProductos.reduce((acc: any, detalle: VentaDetalle) => {
          const productoId = detalle.idproducto;
          if (detalle.producto) {
            if (!acc[productoId]) {
              acc[productoId] = { ...detalle, cantidad: 0, subtotal: 0 };
            }
            acc[productoId].cantidad += detalle.cantidad;
            acc[productoId].subtotal += detalle.cantidad * (detalle.producto.precio || 0);
          }
          return acc;
        }, {});

        setVentaSeleccionada({
          ...ventaData,
          cliente: clienteData,
          detalles: Object.values(detallesAgrupados)
        });
        setShowDetalleModal(true);
      } else {
        throw new Error('Detalles de venta no válidos');
      }
    } catch (error) {
      console.error('Error al cargar los detalles de la venta:', error);
      setError('Error al cargar los detalles de la venta');
    } finally {
      setLoading(false);
    }
  };

  const addNuevaVenta = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    cargarDatos();
  };

  if (loading && !ventaSeleccionada) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <main className="container my-5">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">Lista de Ventas</h1>
          <div className="btn-toolbar mb-2 mb-md-0">
            <div className="btn-group me-2">
              <button
                type="button"
                onClick={addNuevaVenta}
                className="btn btn-success btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#nuevoProductoModal"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table id="tablaVentas" className="table table-custom table-striped dataTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha y Hora</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => {
                const cliente = clientes.find(c => c.id === venta.idcliente);
                return (
                  <tr key={venta.id}>
                    <td>{venta.id}</td>
                    <td>{cliente ? `${cliente.nombre} ${cliente.apellidos}` : 'Desconocido'}</td>
                    <td>{formatInTimeZone(new Date(venta.fechaRegistro), timeZone, 'dd/MM/yyyy HH:mm:ss')}</td>
                    <td>S/.{venta.precioTotal.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => verDetalle(venta)}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className=""></i>
                        )}{' '}
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <VentaForm onClose={closeModal} />
        </div>
      )}

      {showDetalleModal && ventaSeleccionada && ventaSeleccionada.detalles && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle de Venta #{ventaSeleccionada.id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetalleModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <h6>Información del Cliente</h6>
                        <p>
                          <strong>Nombre:</strong> {ventaSeleccionada.cliente?.nombre} {ventaSeleccionada.cliente?.apellidos}<br />
                          <strong>Email:</strong> {ventaSeleccionada.cliente?.email}<br />
                          <strong>Teléfono:</strong> {ventaSeleccionada.cliente?.telefono}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <h6>Información de la Venta</h6>
                        <p>
                          <strong>Fecha:</strong> {formatInTimeZone(new Date(ventaSeleccionada.fechaRegistro), timeZone, 'dd/MM/yyyy')}<br />
                          <strong>Hora:</strong> {formatInTimeZone(new Date(ventaSeleccionada.fechaRegistro), timeZone, 'HH:mm:ss')}<br />
                          <strong>Total:</strong> S/.{ventaSeleccionada.precioTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <h6>Productos</h6>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventaSeleccionada.detalles.map((detalle) => (
                          <tr key={detalle.idproducto}>
                            <td>{detalle.producto?.nombre || 'N/A'}</td>
                            <td>{detalle.cantidad}</td>
                            <td>S/.{detalle.producto?.precio?.toFixed(2) || '0.00'}</td>
                            <td>S/.{((detalle.cantidad || 0) * (detalle.producto?.precio || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetalleModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaVentas;