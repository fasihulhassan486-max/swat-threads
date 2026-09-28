import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'; import Shop from './pages/Shop'; import Product from './pages/Product'; import Customize from './pages/Customize'
import Cart from './pages/Cart'; import Checkout from './pages/Checkout'; import Info, { Confirmation } from './pages/Info'; import Couple from './pages/Couple'; import Gifting from './pages/Gifting'
export default function App() {
  return (<Routes><Route element={<Layout />}>
    <Route index element={<Home />} /><Route path="shop" element={<Shop />} /><Route path="couple-bundle" element={<Couple />} /><Route path="gifting" element={<Gifting />} /><Route path="product/:id" element={<Product />} /><Route path="customize" element={<Customize />} />
    <Route path="cart" element={<Cart />} /><Route path="checkout" element={<Checkout />} /><Route path="order-confirmation" element={<Confirmation />} />
    {['our-story', 'contact', 'shipping', 'returns', 'privacy', 'terms'].map(p => <Route key={p} path={p} element={<Info />} />)}
  </Route></Routes>)
}
