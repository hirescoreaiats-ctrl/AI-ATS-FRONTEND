import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient.js";
import { App } from "../app/App.jsx";
import "./styles/app.css";

function Root() {
  useEffect(() => {
    document.title = "HireScore AI Enterprise";
  }, []);

  return <QueryClientProvider client={queryClient}><App /></QueryClientProvider>;
}

createRoot(document.getElementById("root")).render(<Root />);
