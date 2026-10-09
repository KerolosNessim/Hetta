import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreLayout } from '@/components/store/store-layout'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/lib/cart'
import { SettingsProvider } from '@/lib/settings'
import NotFoundPage from '@/pages/not-found'
import HomePage from '@/pages/store/home'
import ProductPage from '@/pages/store/product'
import ShopPage from '@/pages/store/shop'

// The dashboard is split into its own bundle so shoppers never download it.
const AdminLayout = lazy(() => import('@/components/admin/admin-layout').then((m) => ({ default: m.AdminLayout })))
const LoginPage = lazy(() => import('@/pages/admin/login'))
const AdminProductsPage = lazy(() => import('@/pages/admin/products'))
const AdminProductFormPage = lazy(() => import('@/pages/admin/product-form'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/categories'))
const AdminReviewsPage = lazy(() => import('@/pages/admin/reviews'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <SettingsProvider>
        <CartProvider>
          <AuthProvider>
            <Suspense fallback={<div className="grid min-h-svh place-items-center text-muted-foreground">بيحمّل…</div>}>
              <Routes>
                <Route element={<StoreLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="p/:slug" element={<ProductPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="admin/login" element={<LoginPage />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="products" replace />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/:id" element={<AdminProductFormPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </CartProvider>
      </SettingsProvider>
    </BrowserRouter>
    </MotionConfig>
  )
}
