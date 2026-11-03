import * as Sentry from '@sentry/react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';

const dsn=import.meta.env.VITE_SENTRY_DSN?.trim();

if(dsn){
  Sentry.init({
    dsn,
    environment:import.meta.env.MODE,
    sendDefaultPii:false,
    tracesSampleRate:0.1,
    integrations:[
      Sentry.reactRouterV6BrowserTracingIntegration({
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
  });
}

export { Sentry };
