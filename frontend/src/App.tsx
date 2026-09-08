import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import SystemSelectPage from './features/SystemSelectPage';
import ProductListPage from './features/products/ProductListPage';
import ProductDetailPage from './features/products/ProductDetailPage';
import StoreProductListPage from './features/store/StoreProductListPage';
import StoreProductDetailPage from './features/store/StoreProductDetailPage';
import OrderHistoryPage from './features/orders/OrderHistoryPage';
import OrderDetailPage from './features/orders/OrderDetailPage';
import ImsLayout from './layouts/ImsLayout';
import OmsLayout from './layouts/OmsLayout';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SystemSelectPage />} />

          <Route path="/ims" element={<ImsLayout />}>
            <Route index element={<Navigate to="products" replace />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
          </Route>

          <Route path="/oms" element={<OmsLayout />}>
            <Route index element={<Navigate to="catalog" replace />} />
            <Route path="catalog" element={<StoreProductListPage />} />
            <Route path="catalog/:id" element={<StoreProductDetailPage />} />
            <Route path="orders" element={<OrderHistoryPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
