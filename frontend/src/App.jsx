import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicMenu from './components/PublicMenu';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import Categories from './components/Categories';
import Items from './components/Items';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import AdminTables from './components/AdminTables';
import AdminSettings from './components/AdminSettings';
import AdminOrders from './components/AdminOrders';
import { ErrorBoundary } from './components/ErrorBoundary';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <CartProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            {/* Public Menu Route - Standardized to /r/:slug */}
            <Route path="/r/:slug" element={<>
              <PublicMenu />
              <CartDrawer />
            </>} />

            {/* Redirect old /restaurant/:slug if visited directly */}
            <Route path="/restaurant/:slug" element={<Navigate to={`/r/${window.location.pathname.split('/').pop()}`} replace />} />

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route path="categories" element={<Categories />} />
              <Route path="items" element={<Items />} />
              <Route path="tables" element={<AdminTables />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route index element={<Navigate to="orders" />} />
            </Route>

            <Route path="/" element={<Navigate to="/admin/login" />} />
          </Routes>
        </CartProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
