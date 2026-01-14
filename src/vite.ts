import type { Plugin } from "vite";
import path from "path";

export default function aglStudio(): Plugin {
  return {
    name: "vite-plugin-agl-studio",

    config() {
      return {
        resolve: {
          alias: {
            "agl-es/studio": path.resolve(
              process.cwd(),
              "node_modules/agl-es/dist/studio/index.js"
            )
          }
        },
        optimizeDeps: {
          include: ["agl-es/studio"]
        }
      };
    },

    transformIndexHtml(html) {
      const style = `
        <style>
          body {
            margin: 0;
            background: #0d0d0d;
            color: #eee;
            font-family: Inter, sans-serif;
          }
          button {
            background: #222;
            color: #eee;
            border: 1px solid #444;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      `;

      return html.replace("</head>", `${style}</head>`);
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/agl-studio") {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8" />
                <title>AGL Studio</title>
              </head>
              <body>
                <div id="agl-root"></div>
                <script type="module">
                  import React from "react";
                  import ReactDOM from "react-dom/client";
                  import { App } from "agl-es/studio";

                  ReactDOM.createRoot(document.getElementById("agl-root"))
                    .render(React.createElement(App));
                </script>
              </body>
            </html>
          `;
          res.setHeader("Content-Type", "text/html");
          res.end(html);
          return;
        }
        next();
      });
    }
  };
}
