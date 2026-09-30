import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import App from "./App";
import { store } from "./store/store";
import "./index.css";
import AppAlert from "./components/ui/AppAlert";

const theme = {
  token: {
    colorPrimary: "#429CA8",
    colorInfo: "#429CA8",
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    borderRadius: 8,
    controlHeight: 36,
  },
  components: {
    Table: {
      headerBg: "#f8fafb",
      headerColor: "#475569",
      rowHoverBg: "#f1f8f9",
    },
    Button: {
      primaryShadow: "none",
    },
    Modal: {
      borderRadiusLG: 12,
    },
  },
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <BrowserRouter>
            <App />
            <AppAlert />
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
);
