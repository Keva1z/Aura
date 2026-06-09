import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Слушаем все интерфейсы (IPv4 + IPv6), чтобы сайт открывался
    // и по 127.0.0.1, и по локальной сети (удобно тестировать с телефона).
    host: true,
  },
});
