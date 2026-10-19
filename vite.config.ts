import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { HEAD_PLACEHOLDER, renderHead, renderRobots, renderSitemap } from './seo';
import { INITIAL_CLINIC_INFO, INITIAL_DOCTOR, INITIAL_FAQS } from './src/data/initialData';

// Static hosts (Vercel) never run server.ts, so the production build carries its own SEO tags,
// robots.txt and sitemap.xml. Vercel provides VERCEL_PROJECT_PRODUCTION_URL automatically.
function staticSeo(siteUrl: string): Plugin {
  return {
    name: 'static-seo',
    apply: 'build',
    transformIndexHtml(html) {
      const head = renderHead({ siteUrl, clinic: INITIAL_CLINIC_INFO, doctor: INITIAL_DOCTOR, faqs: INITIAL_FAQS });
      return html.replace(HEAD_PLACEHOLDER, head);
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: renderRobots(siteUrl) });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap(siteUrl, new Date()) });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const siteUrl = (
    env.SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
  ).replace(/\/+$/, '');

  return {
    plugins: [react(), tailwindcss(), staticSeo(siteUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
