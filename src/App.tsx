import React, { useState, useEffect } from 'react'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Login from './components/Login';
import AuthService from './services/AuthService';
import { User } from './types/Auth';

import ClienteList from './components/GestionarClientes/clientelist';
import ProductoList from './components/GestionarProductos/productolist';
import InventarioList from './components/Inventario/tablainventario';
import VentaList from './components/RealizarVentas/tablaventas';
import UsuarioList from './components/GestionarUsuario/usuariolist';

import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.min.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setUsername(user.username);
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setIsAuthenticated(true);
    setUsername(user.username);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUsername('');
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <div className="container py-4">
          {!isAuthenticated ? (
            <Login
              onLoginSuccess={(user) => {
                setIsAuthenticated(true);
                setCurrentUser(user);
              }}
            />
          ) : (
            <>
              {/* Navbar */}
              <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
                <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3" href="#">
                  Farmacia Avila
                </a>
                <span className="navbar-text d-sm-inline-block d-none">
                  Bienvenido {currentUser?.role} {currentUser?.nombre} {currentUser?.apellido} 
                </span>
                <div className="navbar-nav">
                  <div className="btn nav-item text-nowrap">
                    <a className="nav-link px-3" onClick={handleLogout}>
                      Cerrar sesión
                    </a>
                  </div>
                </div>
                <button
                  className="navbar-toggler d-md-none collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#sidebarMenu"
                  aria-controls="sidebarMenu"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>      
              </header>
              <div className="container-fluid">
                <div className="row">
                  {/* Sidebar */}
                  <nav
                    id="sidebarMenu"
                    className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
                  >
                    <div className="position-sticky pt-3">
                      <img src="../src/assets/LogoEmpresa.png" alt="Logo" style={{ width: '100px' }} className="img-fluid" />
                      <ul className="nav flex-column">
                        {/* Mostrar Productos solo si el rol es ADMIN */}
                        {currentUser?.role === 'ADMIN' && (
                          <>
                            <li className="nav-item">
                              <Link className="nav-link" to="/usuarios">
                                Usuarios
                              </Link>                  
                            </li>
                            <li className="nav-item">
                              <Link className="nav-link" to="/productos">
                                Productos
                              </Link>  
                            </li>
                          </>
                        )}
                        
                        {/* Siempre mostrar Clientes */}
                        <li className="nav-item">
                          <Link className="nav-link" to="/clientes">
                            Clientes
                          </Link>                  
                        </li>
                        
                        <li className="nav-item">
                          <Link className="nav-link" to="/ventas">
                            Ventas
                          </Link>                  
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to="/inventarios">
                            Inventarios
                          </Link>                  
                        </li>
                      </ul>
                    </div>
                  </nav>
                  {/* Contenido dinámico */}
                  <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                    <Routes>
                      {currentUser?.role === "ADMIN" ? (
                        <>
                          <Route path="/usuarios" element={<UsuarioList />} />
                          <Route path="/productos" element={<ProductoList />} />
                        </>
                      ) : null}

                      <Route path="/clientes" element={<ClienteList userRole={currentUser?.role || ''} />} />
                      <Route path="/ventas" element={<VentaList />} />
                      <Route path="/inventarios" element={<InventarioList />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;