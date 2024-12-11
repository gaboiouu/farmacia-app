import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-timezone";

const API_URL = "http://localhost:8010/api/venta";
const API_URL_PRODUCTO = "http://localhost:8010/api/producto";
const API_URL_CLIENTE = "http://localhost:8010/api/cliente";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface ProductoSeleccionado extends Producto {
  cantidadSeleccionada: number;
}

interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}

interface VentaFormProps {
  onClose: () => void;
}

const VentaForm: React.FC<VentaFormProps> = ({ onClose }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [precioTotal, setPrecioTotal] = useState<number>(0);
  const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarClientes();
    cargarProductos();
  }, []);

  const cargarClientes = async () => {
    try {
      const response = await axios.get(API_URL_CLIENTE);
      setClientes(response.data);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
      setError("Error al cargar los clientes");
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await axios.get(API_URL_PRODUCTO);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      setError("Error al cargar los productos");
    }
  };

  const agregarProducto = (producto: Producto, cantidad: number) => {
    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    if (cantidad > producto.cantidad) {
      setError(`Solo hay ${producto.cantidad} unidades disponibles`);
      return;
    }

    const productoExistente = productosSeleccionados.find(p => p.id === producto.id);
    if (productoExistente) {
      setError("Este producto ya está en el carrito");
      return;
    }

    const nuevoProductoSeleccionado: ProductoSeleccionado = {
      ...producto,
      cantidadSeleccionada: cantidad
    };

    setProductosSeleccionados([...productosSeleccionados, nuevoProductoSeleccionado]);
    setPrecioTotal(prev => prev + (producto.precio * cantidad));
    setError("");
    setMostrarModalProductos(false);
  };

  const eliminarProducto = (idProducto: number) => {
    const producto = productosSeleccionados.find((p) => p.id === idProducto);
    if (producto) {
      setProductosSeleccionados(
        productosSeleccionados.filter((p) => p.id !== idProducto)
      );
      setPrecioTotal(prev => prev - (producto.precio * producto.cantidadSeleccionada));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clienteSeleccionado || productosSeleccionados.length === 0) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const fechaActual = new Date();
    const horaLima = moment(fechaActual).tz("America/Lima").format("HH:mm:ss");
    const nuevaVenta = {
      idcliente: clienteSeleccionado.id,
      fechaRegistro: fechaActual.toISOString(),
      horaRegistro: horaLima,
      precioTotal: precioTotal,
      detalles: productosSeleccionados.map((p) => ({ 
        idproducto: p.id,
        cantidad: p.cantidadSeleccionada
      })),
    };

    try {
      setLoading(true);
      await axios.post(API_URL, nuevaVenta);
      alert("Venta creada exitosamente.");
      setClienteSeleccionado(null);
      setProductosSeleccionados([]);
      setPrecioTotal(0);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error al crear la venta:", error);
      setError("Error al crear la venta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Nueva Venta</h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="form-group mb-3">
            <label htmlFor="nombre">Nombre:</label>
            <select
              className="form-control"
              id="nombre"
              required
              onChange={(e) => {
                const cliente = clientes.find(
                  (c) => c.id === parseInt(e.target.value)
                );
                setClienteSeleccionado(cliente || null);
              }}
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              disabled
              className="form-control"
              id="email"
              value={clienteSeleccionado?.email || ""}
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="telefono">Teléfono:</label>
            <input
              type="tel"
              disabled
              className="form-control"
              id="telefono"
              value={clienteSeleccionado?.telefono || ""}
            />
          </div>

          <div className="form-group mb-3">           
            <button
              type="button"
              className="btn btn-warning btn-sm"
              onClick={() => setMostrarModalProductos(true)}
            >
              Buscar Producto
            </button>
          </div>

          <div className="form-group mb-3">
            <table className="table table-bordered mt-3" id="tablaProductosSeleccionados">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosSeleccionados.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>S/{producto.precio.toFixed(2)}</td>
                    <td>{producto.cantidadSeleccionada}</td>
                    <td>S/{(producto.precio * producto.cantidadSeleccionada).toFixed(2)}</td>
                    <td>
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

          <div className="form-group mb-3">
            <label htmlFor="precioTotal">
              <i className="fas fa-coins"></i> Precio Total:
            </label>
            <input
              type="number"
              disabled
              className="form-control"
              id="precioTotal"
              value={precioTotal.toFixed(2)}
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
        </div>

        <div className="modal-footer">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cerrar
          </button>
        </div>

        {mostrarModalProductos && (
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Buscar Producto</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMostrarModalProductos(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((producto) => (
                        <tr key={producto.id}>
                          <td>{producto.id}</td>
                          <td>{producto.nombre}</td>
                          <td>S/{producto.precio.toFixed(2)}</td>
                          <td>{producto.cantidad}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min="1"
                              max={producto.cantidad}
                              defaultValue="1"
                              id={`cantidad-${producto.id}`}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                const cantidad = parseInt(
                                  (document.getElementById(`cantidad-${producto.id}`) as HTMLInputElement).value
                                );
                                agregarProducto(producto, cantidad);
                              }}
                              disabled={producto.cantidad === 0}
                            >
                              Agregar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setMostrarModalProductos(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default VentaForm;