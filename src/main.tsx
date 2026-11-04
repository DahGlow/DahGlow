import React from 'react';
import ReactDOM from 'react-dom/client';
import { Sentry } from '@/lib/sentry';
import App from '@/App';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
const queryClient=new QueryClient({defaultOptions:{queries:{retry:1,refetchOnWindowFocus:true}}});
import '@/index.css';
import '@/admin.css';
import '@/customer-updates.css';
import '@/customer-spaces.css';
import '@/storefront-desktop.css';
import '@/visual-search.css';
import '@/tidio-support.css';
import '@/affiliate.css';
import '@/style-inspiration.css';
import '@/about-dahglow.css';

const root=ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><QueryClientProvider client={queryClient}><App /></QueryClientProvider></React.StrictMode>);
