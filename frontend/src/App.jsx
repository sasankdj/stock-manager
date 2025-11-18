import React from 'react'
import { Route, Routes } from 'react-router-dom'

// Page Components
import LandingPage from './LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './HomePage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AdminDashboard from './pages/AdminDashboard'
import MyOrdersPage from './pages/MyOrdersPage'
import AdminOrdersPage from './pages/AdminOrdersPage'

// Core UI Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Private Routes */}
          <Route path="" element={<PrivateRoute />}><Route path="/checkout" element={<CheckoutPage />} /></Route>
          <Route path="" element={<PrivateRoute />}><Route path="/myorders" element={<MyOrdersPage />} /></Route>
          <Route path="" element={<AdminRoute />}><Route path="/admin" element={<AdminDashboard />} /></Route>
          <Route path="" element={<AdminRoute />}><Route path="/admin/orders" element={<AdminOrdersPage />} /></Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App