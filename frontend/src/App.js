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

function App() {
  const location = useLocation().pathname

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
    </>
  );
}

export default App;

const renderRoutes = (routes, basePath = '') => {
  return routes.map(({ to, element, nestedRoutes, protected: isProtected, name }) => {
    const fullPath = basePath + to

    if (nestedRoutes && nestedRoutes.length > 0) {
      return (
        <Route
          key={fullPath}
          path={to}
          element={isProtected ? <Protected requiredPermission={name}>{element}</Protected> : element}
        >
          {renderRoutes(nestedRoutes)}
        </Route>
      )
    }

    return (
      <Route
        key={fullPath}
        path={fullPath}
        element={isProtected ? <Protected requiredPermission={name}>{element}</Protected> : element}
      />
    )
  })
}