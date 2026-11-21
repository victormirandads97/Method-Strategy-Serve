import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./books.css";
import BooksPage from "./BooksPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BooksPage />
  </StrictMode>,
);
