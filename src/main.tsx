import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { SyncProvider } from "./context/SyncContext";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </React.StrictMode>,
);
