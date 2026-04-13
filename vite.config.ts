import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import minifyTemplateLiterals from 'rollup-plugin-minify-template-literals';

export default defineConfig(({ mode }) => ({
  plugins: mode === 'lib' ? [minifyTemplateLiterals()] : [],
  resolve: {
    alias: {
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url))
    }
  },
  build: mode === 'lib' ? {
    lib: {
      entry: 'src/ui/index.ts',
      name: 'lens-kit',
      fileName: (format) => `lens-kit.${format}.js`
    }
  } : {}
}));
