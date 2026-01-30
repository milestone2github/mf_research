import React from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "./App.css";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import Protected from "./components/common/Protected";
import { appRoutes } from "./routes/RouteConfig";

// Toastify imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation().pathname;

  return (
    <>
      <div className="App">
        <Header />
        <div className="app-body">
          <Sidebar />
          <main style={{ height: location.endsWith('/login') ? 'auto' : 'calc(100vh - 60px)' }} className="app-content">
            <Routes>
              {renderRoutes(appRoutes)}
            </Routes>
          </main>
        </div>
      </div>

      {/* Toast Container globally available */}
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;

const renderRoutes = (routes, basePath = '') => {
  return routes
    .filter(r => !r.external)
    .map(({ to, element, nestedRoutes, protected: isProtected, requiredPermission, requiredInternalRole }) => {
    const fullPath = basePath + to;

    if (nestedRoutes && nestedRoutes.length > 0) {
      return (
        <Route
          key={fullPath}
          path={to}
          element={isProtected ? <Protected requiredPermission={requiredPermission} requiredInternalRole={requiredInternalRole}>{element}</Protected> : element}
        >
          {renderRoutes(nestedRoutes)}
        </Route>
      );
    }

    return (
      <Route
        key={fullPath}
        path={fullPath}
        element={isProtected ? <Protected requiredPermission={requiredPermission} requiredInternalRole={requiredInternalRole}>{element}</Protected> : element}
      />
    );
  });
};
