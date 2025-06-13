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
            rootValue: 16,
            unitPrecision: 5,
            selectorBlackList: [],
            propList: ['*'],
            replace: true,
            mediaQuery: true,
            minRemValue: 0
          })
        ]
      }
    },
    build: {
      minify: false,
    },
  })
});
