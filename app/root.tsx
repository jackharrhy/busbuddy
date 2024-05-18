import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import "./index.css";

export default function App() {
  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
