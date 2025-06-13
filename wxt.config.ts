import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import remToPixel from 'postcss-rem-to-pixel';

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
    css: {
      postcss: {
        plugins: [
          remToPixel({
            rootValue: 16,           // Your base font size (16px = 1rem)
            unitPrecision: 5,        // Decimal precision
            selectorBlackList: [],   // Selectors to ignore
            propList: ['*'],         // Convert all properties (* means all)
            replace: true,           // Replace rem with px (don't keep both)
            mediaQuery: true,        // Also convert rem in media queries
            minRemValue: 0           // Convert all rem values, no minimum
          })
        ]
      }
    },
    build: {
      minify: false,
    },
  })
});
