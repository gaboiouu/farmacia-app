import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8010/api/producto';

interface ProductoFormProps {
  producto?: {
    nombre: string;
    precio: string;
    cantidad: string;
    fechaVencimiento: string;
    descripcion: string;
    categoria: string;
  };
  onClose: () => void; // Prop para manejar el cierre del modal
}

const ProductoForm: React.FC<ProductoFormProps> = ({ producto, onClose }) => {
  const [productoState, setProducto] = useState(
    producto || {
      nombre: "",
      precio: "",
      cantidad: "",
      fechaVencimiento: "",
      descripcion: "",
      categoria: ""
    }
  );
  const [error, setError] = useState<string>('');
  const { id } = useParams<{ id: string }>();
  const [nuevaCategoria, setNuevaCategoria] = useState<string>("");
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState<boolean>(false);
  const [categorias, setCategorias] = useState<string[]>([
    "Antibioticos",
    "Medicamentos Pediatricos",
    "Antivirales",
    "Vitaminas y Suplementos",
    "Dermatologia",
    "Antiinflamatorios y Analgesicos",
    "Sistema Respiratorio (Broncodilatadores)",
    "Productos de Aseo y Cuidado Personal",
    "Antigripales y Resfriados",
    "Cardiologia",
    "Gastrointestinales",
    "Oftalmologia",
    "Ginecologia"
  ]);

  useEffect(() => {
    if (id) {
      const productoEditar = JSON.parse(localStorage.getItem('productoEditar') || '{}');
      setProducto(productoEditar);
    }
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Validación de los campos
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]{1,50}$/.test(productoState.nombre)) {
      setError('El nombre solo puede contener letras, números, espacios, y un máximo de 50 caracteres');
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(productoState.precio)) {
      setError('El precio solo puede contener números y debe ser un valor decimal válido');
      return;
    }

    if (!/^\d+$/.test(productoState.cantidad)) {
      setError('La cantidad solo puede contener números');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(productoState.fechaVencimiento)) {
      setError('La fecha de vencimiento debe tener el formato YYYY-MM-DD');
      return;
    }

    if (productoState.descripcion.length > 200) {
      setError('La descripción puede tener un máximo de 200 caracteres');
      return;
    }

    try {
      await axios.post(API_URL, productoState);
      if (producto) {        
        alert('Producto actualizado exitosamente.');
      } else {
        alert('Producto creado exitosamente.');
      }
      localStorage.removeItem('productoEditar');
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      setError('Hubo un error al guardar el producto');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formattedDate = today.toISOString().split('T')[0];

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "Agregar nueva categoría") {
      setMostrarNuevaCategoria(true);
      setNuevaCategoria("");
    } else {
      setProducto({ ...productoState, categoria: value });
      setMostrarNuevaCategoria(false);
      setNuevaCategoria("");
    }
  };

  const handleNuevaCategoriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaCategoria(e.target.value);
  };

  const handleAceptarNuevaCategoria = () => {
    if (nuevaCategoria && !categorias.includes(nuevaCategoria)) {
      setCategorias([...categorias, nuevaCategoria]);
      setProducto({ ...productoState, categoria: nuevaCategoria });
      setMostrarNuevaCategoria(false);
    }
  };

  const handleCancelarNuevaCategoria = () => {
    setMostrarNuevaCategoria(false);
    setNuevaCategoria("");
    setProducto({ ...productoState, categoria: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="producto-form">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {producto ? "Editar Producto" : "Nuevo Producto"}
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
            <label> Nombre del Producto</label>
            <input
              type="text"
              className="form-control"
              name="nombre"
              value={productoState.nombre}
              onChange={(e) => setProducto({ ...productoState, nombre: e.target.value })}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Precio</label>
            <input
              type="text"
              className="form-control"
              name="precio"
              value={productoState.precio}
              onChange={(e) => setProducto({ ...productoState, precio: e.target.value })}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Cantidad</label>
            <input
              type="text"
              className="form-control"
              name="cantidad"
              value={productoState.cantidad}
              onChange={(e) => setProducto({ ...productoState, cantidad: e.target.value })}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Fecha de Vencimiento</label>
            <input
              type="date"
              className="form-control"
              name="fechaVencimiento"
              value={productoState.fechaVencimiento}
              onChange={(e) => setProducto({ ...productoState, fechaVencimiento: e.target.value })}
              min={formattedDate} // Establecer el valor mínimo como la fecha actual
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Descripción</label>
            <textarea
              className="form-control"
              name="descripcion"
              value={productoState.descripcion}
              onChange={(e) => setProducto({ ...productoState, descripcion: e.target.value })}
              maxLength={200}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Categoría</label>
            <select
              className="form-control"
              name="categoria"
              value={productoState.categoria}
              onChange={handleCategoriaChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
              <option value="Agregar nueva categoría">Agregar nueva categoría</option>
            </select>
          </div>

          {mostrarNuevaCategoria && (
            <div className="form-group mb-3">
              <label>Nueva Categoría</label>
              <input
                type="text"
                className="form-control"
                value={nuevaCategoria}
                onChange={handleNuevaCategoriaChange}
                required
              />
              <div className="mt-2">
                <button type="button" className="btn btn-primary btn-sm me-2" onClick={handleAceptarNuevaCategoria}>
                  Aceptar
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancelarNuevaCategoria}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary">
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

export default ProductoForm;