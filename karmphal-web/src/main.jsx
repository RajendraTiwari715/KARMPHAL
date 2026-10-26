import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import { ChatProvider } from './context/ChatProvider.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initCapacitorPlatform } from './services/platformService'

// Initialize native StatusBar & Keyboard configuration
initCapacitorPlatform();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <ErrorBoundary isGlobal>
          <ChatProvider>
            <App />
          </ChatProvider>
        </ErrorBoundary>
      </ToastProvider>
    </AppProvider>
  </StrictMode>,
)
