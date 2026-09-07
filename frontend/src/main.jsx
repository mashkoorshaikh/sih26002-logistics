import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'
import { useThemeStore } from './store/themeStore'

// Initialize theme class on document element
useThemeStore.getState().initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
