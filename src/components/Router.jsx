import { Routes, Route } from "react-router-dom";
import App from "../App";
import PublicBooking from "./PublicBooking";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/b/:slug" element={<PublicBooking />} />
    </Routes>
  );
}
