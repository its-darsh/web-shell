import "./style/index.css";
import "@fontsource/jetbrains-mono";
import "@fontsource-variable/readex-pro";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
