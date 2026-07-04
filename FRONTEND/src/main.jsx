import "./instrument.js"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import { ClerkProvider } from '@clerk/react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import App from './App.jsx'
import { SentryErrorFallback } from "./fallbackError/fallbackfunction.jsx";
import SyntryScynUserthings from "./fallbackError/SyntryScynUserthings.jsx"
import { BrowserRouter ,createBrowserRouter,RouterProvider} from "react-router";


const queryClient = new QueryClient();
const clerkClient = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn("Uncaught error", error, errorInfo.componentStack);
  }),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Sentry.ErrorBoundary fallback={<SentryErrorFallback />}>
          <SyntryScynUserthings />
          <App/>
        </Sentry.ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
)
