import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LandingPage from "./landing/LandingPage";
import { readRoute } from "./landing/route";
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

/**
 * Route shell. The public landing page lives beside the app at `/welcome` and
 * never replaces the main application route. It renders without the Tauri
 * database or sync providers so it stays a plain document and cannot be blocked
 * by a database that is not present.
 */
function Root() {
  const route = readRoute();

  useEffect(() => {
    if (route === "landing") {
      const onHashChange = () => {
        if (readRoute() === "app") window.location.reload();
      };
      window.addEventListener("hashchange", onHashChange);
      return () => window.removeEventListener("hashchange", onHashChange);
    }
    // The static document metadata in index.html targets the public landing
    // page, so the in-app shell restores the product title on mount.
    document.title = "The Mainframe";
  }, [route]);

  if (route === "landing") return <LandingPage />;

  return (
    <SyncProvider>
      <App />
    </SyncProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StartupErrorBoundary>
      <Root />
    </StartupErrorBoundary>
  </React.StrictMode>,
);
