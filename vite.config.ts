import { sentryVitePlugin } from "@sentry/bundler-plugins/vite";
import { defineConfig,type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const privateHeaders:Plugin={name:'dah-glow-private-headers',configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url?.startsWith('/private-control/'))res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');next();});},configurePreviewServer(server){server.middlewares.use((req,res,next)=>{if(req.url?.startsWith('/private-control/'))res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');next();});}};
export default defineConfig({
  plugins: [react(), privateHeaders, sentryVitePlugin({
    org: "dawine",
    project: "dah-glow"
  })],

  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { host: '0.0.0.0', port: 5173 },

  build: {
    sourcemap: true
  }
});
