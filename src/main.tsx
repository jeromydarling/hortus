import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <div>Hortus scaffold ready. See LOVABLE_HANDOFF.md for next steps.</div>
  </StrictMode>,
);
