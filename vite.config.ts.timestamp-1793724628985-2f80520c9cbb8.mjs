// vite.config.ts
import { sentryVitePlugin } from "file:///C:/DahGlow/node_modules/@sentry/bundler-plugins/build/esm/vite/index.js";
import { defineConfig } from "file:///C:/DahGlow/node_modules/vite/dist/node/index.js";
import react from "file:///C:/DahGlow/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "C:\\DahGlow";
var privateHeaders = { name: "dah-glow-private-headers", configureServer(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url?.startsWith("/private-control/")) res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    next();
  });
}, configurePreviewServer(server) {
  server.middlewares.use((req, res, next) => {
    if (req.url?.startsWith("/private-control/")) res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    next();
  });
} };
var vite_config_default = defineConfig({
  plugins: [react(), privateHeaders, sentryVitePlugin({
    org: "dawine",
    project: "dah-glow",
    errorHandler: (error) => {
      console.warn(`[sentry-vite-plugin] Release or sourcemap upload failed; continuing build: ${error.message}`);
    }
  })],
  resolve: { alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") } },
  server: { host: "0.0.0.0", port: 5173 },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxEYWhHbG93XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxEYWhHbG93XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9EYWhHbG93L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gXCJAc2VudHJ5L2J1bmRsZXItcGx1Z2lucy92aXRlXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyx0eXBlIFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5jb25zdCBwcml2YXRlSGVhZGVyczpQbHVnaW49e25hbWU6J2RhaC1nbG93LXByaXZhdGUtaGVhZGVycycsY29uZmlndXJlU2VydmVyKHNlcnZlcil7c2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLHJlcyxuZXh0KT0+e2lmKHJlcS51cmw/LnN0YXJ0c1dpdGgoJy9wcml2YXRlLWNvbnRyb2wvJykpcmVzLnNldEhlYWRlcignWC1Sb2JvdHMtVGFnJywnbm9pbmRleCwgbm9mb2xsb3csIG5vYXJjaGl2ZScpO25leHQoKTt9KTt9LGNvbmZpZ3VyZVByZXZpZXdTZXJ2ZXIoc2VydmVyKXtzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEscmVzLG5leHQpPT57aWYocmVxLnVybD8uc3RhcnRzV2l0aCgnL3ByaXZhdGUtY29udHJvbC8nKSlyZXMuc2V0SGVhZGVyKCdYLVJvYm90cy1UYWcnLCdub2luZGV4LCBub2ZvbGxvdywgbm9hcmNoaXZlJyk7bmV4dCgpO30pO319O1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBwcml2YXRlSGVhZGVycywgc2VudHJ5Vml0ZVBsdWdpbih7XHJcbiAgICBvcmc6IFwiZGF3aW5lXCIsXHJcbiAgICBwcm9qZWN0OiBcImRhaC1nbG93XCIsXHJcbiAgICBlcnJvckhhbmRsZXI6IChlcnJvcikgPT4ge1xyXG4gICAgICBjb25zb2xlLndhcm4oYFtzZW50cnktdml0ZS1wbHVnaW5dIFJlbGVhc2Ugb3Igc291cmNlbWFwIHVwbG9hZCBmYWlsZWQ7IGNvbnRpbnVpbmcgYnVpbGQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcclxuICAgIH1cclxuICB9KV0sXHJcblxyXG4gIHJlc29sdmU6IHsgYWxpYXM6IHsgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSB9IH0sXHJcbiAgc2VydmVyOiB7IGhvc3Q6ICcwLjAuMC4wJywgcG9ydDogNTE3MyB9LFxyXG5cclxuICBidWlsZDoge1xyXG4gICAgc291cmNlbWFwOiB0cnVlLFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwXHJcbiAgfVxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvTixTQUFTLHdCQUF3QjtBQUNyUCxTQUFTLG9CQUFnQztBQUN6QyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBSGpCLElBQU0sbUNBQW1DO0FBS3pDLElBQU0saUJBQXNCLEVBQUMsTUFBSyw0QkFBMkIsZ0JBQWdCLFFBQU87QUFBQyxTQUFPLFlBQVksSUFBSSxDQUFDLEtBQUksS0FBSSxTQUFPO0FBQUMsUUFBRyxJQUFJLEtBQUssV0FBVyxtQkFBbUIsRUFBRSxLQUFJLFVBQVUsZ0JBQWUsOEJBQThCO0FBQUUsU0FBSztBQUFBLEVBQUUsQ0FBQztBQUFFLEdBQUUsdUJBQXVCLFFBQU87QUFBQyxTQUFPLFlBQVksSUFBSSxDQUFDLEtBQUksS0FBSSxTQUFPO0FBQUMsUUFBRyxJQUFJLEtBQUssV0FBVyxtQkFBbUIsRUFBRSxLQUFJLFVBQVUsZ0JBQWUsOEJBQThCO0FBQUUsU0FBSztBQUFBLEVBQUUsQ0FBQztBQUFFLEVBQUM7QUFDN2EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsaUJBQWlCO0FBQUEsSUFDbEQsS0FBSztBQUFBLElBQ0wsU0FBUztBQUFBLElBQ1QsY0FBYyxDQUFDLFVBQVU7QUFDdkIsY0FBUSxLQUFLLDhFQUE4RSxNQUFNLE9BQU8sRUFBRTtBQUFBLElBQzVHO0FBQUEsRUFDRixDQUFDLENBQUM7QUFBQSxFQUVGLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTyxFQUFFLEVBQUU7QUFBQSxFQUM1RCxRQUFRLEVBQUUsTUFBTSxXQUFXLE1BQU0sS0FBSztBQUFBLEVBRXRDLE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
