import { defineConfig } from 'vite';

// Uso rutas relativas para que el build funcione en GitHub Pages con cualquier nombre de repo.
export default defineConfig({
  base: './'
});
