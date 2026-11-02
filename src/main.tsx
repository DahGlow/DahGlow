import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
const queryClient=new QueryClient({defaultOptions:{queries:{retry:1,refetchOnWindowFocus:true}}});
import '@/index.css';
import '@/admin.css';
import '@/customer-updates.css';
import '@/customer-spaces.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={queryClient}><App /></QueryClientProvider></React.StrictMode>);
