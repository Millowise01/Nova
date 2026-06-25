import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SearchPage } from '@/pages/SearchPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderPage } from '@/pages/OrderPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SellerDashboardPage } from '@/pages/SellerDashboardPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { SellerProductsPage } from '@/pages/SellerProductsPage';
import { SellerOrdersPage } from '@/pages/SellerOrdersPage';
import { SellerAnalyticsPage } from '@/pages/SellerAnalyticsPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AdminSellersPage } from '@/pages/AdminSellersPage';
import { AdminOrdersPage } from '@/pages/AdminOrdersPage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/home', element: <HomePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order/:id', element: <OrderPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/seller/dashboard', element: <SellerDashboardPage /> },
      { path: '/seller/products', element: <SellerProductsPage /> },
      { path: '/seller/orders', element: <SellerOrdersPage /> },
      { path: '/seller/analytics', element: <SellerAnalyticsPage /> },
      { path: '/admin/dashboard', element: <AdminDashboardPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/sellers', element: <AdminSellersPage /> },
      { path: '/admin/orders', element: <AdminOrdersPage /> },
      { path: '/admin/analytics', element: <AdminAnalyticsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);