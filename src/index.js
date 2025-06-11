import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
console.table({
  api:         process.env.REACT_APP_FB_API_KEY,
  authDomain:  process.env.REACT_APP_FB_AUTH_DOMAIN
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
