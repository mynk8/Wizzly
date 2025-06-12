import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ['audio', 'storage', 'tabs', 'activeTab'],
    action: {
      default_popup: 'popup.html',
      default_title: 'Wizzly Teaching Assistant'
    },
    web_accessible_resources: [
      {
        resources: ['worklets/*.js', 'teach.html'],
        matches: ['<all_urls>'],
      },
    ],
  },
  modules: ['@wxt-dev/module-react'],
  // @ts-ignore
  vite: () => ({
    plugins: [tailwindcss()],
  })
});
