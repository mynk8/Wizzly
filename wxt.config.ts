import { matches } from "lodash";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  runner: {
    startUrls: ["https://google.com"],
  },
  manifest: {
    permissions: ['storage', 'audio', 'desktopCapture', 'webRequest'],
    web_accessible_resources: [
      {
        resources: ["content/voice.png"],
        matches: ["*://*/*"]
      }
    ]
  }
});
