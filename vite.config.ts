import { sentryVitePlugin } from "@sentry/bundler-plugins/vite";
import { defineConfig,type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const privateHeaders:Plugin={name:'dah-glow-private-headers',configureServer(server){server.middlewares.use((req,res,next)=>{if(/^\/(private-control|account|settings|wallet|login|affiliate|us\/user|checkout|cart|me|wishlist|messages|scan-product|auth|oauth|integration|support|r|search|shopify\/callback)(\/|[?#]|$)/.test(req.url||''))res.setHeader('X-Robots-Tag','noindex, nofollow');next();});},configurePreviewServer(server){server.middlewares.use((req,res,next)=>{if(/^\/(private-control|account|settings|wallet|login|affiliate|us\/user|checkout|cart|me|wishlist|messages|scan-product|auth|oauth|integration|support|r|search|shopify\/callback)(\/|[?#]|$)/.test(req.url||''))res.setHeader('X-Robots-Tag','noindex, nofollow');next();});}};
export default defineConfig({
  plugins: [react(), privateHeaders, sentryVitePlugin({
    org: "dawine",
    project: "dah-glow",
    errorHandler: (error) => {
      console.warn(`[sentry-vite-plugin] Release or sourcemap upload failed; continuing build: ${error.message}`);
    }
  })],

  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { host: '0.0.0.0', port: 5173 },

  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  }
});
