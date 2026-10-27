
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { reloadOnStaleChunk } from "./app/lib/staleChunk";

  reloadOnStaleChunk();

  createRoot(document.getElementById("root")!).render(<App />);
  