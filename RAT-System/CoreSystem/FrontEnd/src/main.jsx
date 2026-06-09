import React from "react";
import { createRoot } from "react-dom/client";
import "./css/tailwind.css";
import "antd/dist/reset.css";
import App from "./app/App";

createRoot(document.getElementById("root")).render(<App />);
