import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { SyncProvider } from "./context/SyncContext";

class StartupErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: 24, color: "#F2F2F0", background: "#0E0E10", minHeight: "100dvh", fontFamily: "system-ui" }}>
          <h1>The Mainframe could not start</h1>
          <p>Close and reopen the app. If this keeps happening, share this message:</p>
          <pre style={{ whiteSpace: "pre-wrap", color: "#FF8A8A" }}>{this.state.error.message}</pre>
        </main>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StartupErrorBoundary>
      <SyncProvider>
        <App />
      </SyncProvider>
    </StartupErrorBoundary>
  </React.StrictMode>,
);
