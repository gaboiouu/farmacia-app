import React from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Importa FontAwesome
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap
import './Principal.css'; 

const Principal: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="hero-section mb-5">
        <h1>Bienvenido a Farmacia Ávila</h1>
        <p className="lead">Seleccione una opción:</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-4 mb-4">
          <Link to="/gestionar-productos" className="list-group-item list-group-item-action text-center">
            <i className="fas fa-box fa-2x me-3"></i>
            <span className="h5">Gestionar Productos</span>
          </Link>
        </div>
        <div className="col-md-4 mb-4">
          <Link to="/cliente-list" className="list-group-item list-group-item-action text-center">
            <i className="fas fa-user fa-2x me-3"></i>
            <span className="h5">Gestionar Clientes</span>
          </Link>
        </div>
        <div className="col-md-4 mb-4">
          <Link to="/tablaventas" className="list-group-item list-group-item-action text-center">
            <i className="fas fa-shopping-cart fa-2x me-3"></i>
            <span className="h5">Realizar Venta</span>
          </Link>
        </div>
        <div className="col-md-4 mb-4">
          <Link to="/tablainventario" className="list-group-item list-group-item-action text-center">
            <i className="fas fa-clipboard-list fa-2x me-3"></i>
            <span className="h5">Ver Inventario</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Principal;