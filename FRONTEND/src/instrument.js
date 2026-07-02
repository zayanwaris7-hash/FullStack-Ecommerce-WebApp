import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN;

if (!DSN) {
  throw new Error("Sentry DSN is not configured!");
}

const apiBase = import.meta.env.VITE_API_URL ?? "";

const tracePropagationTargets =
  apiBase.length > 0
    ? [apiBase]
    : typeof window !== "undefined"
      ? [window.location.origin]
      : [];

Sentry.init({
  dsn: DSN,
  environment: import.meta.env.MODE ?? "development",
  sendDefaultPii: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],

  tracePropagationTargets,

  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,

  enableLogs: true,
});