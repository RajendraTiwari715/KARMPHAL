import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import { ChatProvider } from './context/ChatProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </ToastProvider>
    </AppProvider>
  </StrictMode>,
)
