import React from "react";
import { createRoot } from "react-dom/client";
import OrbitApp from "../src/OrbitApp";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OrbitApp />
  </React.StrictMode>
);
