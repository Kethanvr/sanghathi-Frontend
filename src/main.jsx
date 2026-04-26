import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { LoadingProvider } from "./context/LoadingContext";
import { registerGlobalAxiosLoader } from "./utils/registerGlobalAxiosLoader";
import AppErrorBoundary from "./components/AppErrorBoundary";

const domNode = document.getElementById("root");
const root = createRoot(domNode);

registerGlobalAxiosLoader();

root.render(
  <AuthContextProvider>
    <AppErrorBoundary>
      <HelmetProvider>
        <SettingsProvider>
          <LoadingProvider>
            <Router>
              <App />
            </Router>
          </LoadingProvider>
        </SettingsProvider>
      </HelmetProvider>
    </AppErrorBoundary>
  </AuthContextProvider>

);