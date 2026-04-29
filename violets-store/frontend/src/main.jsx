import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReactGA4 } from 'react-ga4'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

if (import.meta.env.PROD) {
  ReactGA4.initialize('G-XXXXXXXXXX') // .env GA_MEASUREMENT_ID
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </React.StrictMode>,
)
