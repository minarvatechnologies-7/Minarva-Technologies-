import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", "coverage/**"],
  },
  {
    rules: {
      // Existing portal pages intentionally use native anchors for full-page
      // navigation and server-boundary transitions. Keep this as a project
      // convention until navigation is standardized across the portal.
      "@next/next/no-html-link-for-pages": "off",
      // These effects perform initial async data loading or synchronize form
      // state with a selected record; React's rule is too restrictive for
      // these existing portal workflows.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
