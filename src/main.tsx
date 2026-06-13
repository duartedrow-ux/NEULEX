import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './cart.tsx'
import { ProductsProvider } from './products.tsx'
import { AuthProvider } from './auth.tsx'
import { SettingsProvider } from './settings.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ProductsProvider>
          <SettingsProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </SettingsProvider>
        </ProductsProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
