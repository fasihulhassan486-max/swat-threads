import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const Product = lazy(() => import('./pages/Product'))
const Customize = lazy(() => import('./pages/Customize'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Info = lazy(() => import('./pages/Info'))
const Confirmation = lazy(() => import('./pages/Info').then(module => ({ default: module.Confirmation })))
const Couple = lazy(() => import('./pages/Couple'))
const Gifting = lazy(() => import('./pages/Gifting'))

export default function App() {
  return (
    <Suspense fallback={<div className="container-x py-16 text-center text-ink/70 font-serif">Loading page…</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="couple-bundle" element={<Couple />} />
          <Route path="gifting" element={<Gifting />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="customize" element={<Customize />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<Confirmation />} />
          {['our-story', 'contact', 'shipping', 'returns', 'privacy', 'terms'].map(path => (
            <Route key={path} path={path} element={<Info />} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  )
}
