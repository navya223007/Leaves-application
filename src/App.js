import { BrowserRouter, Routes, Route } from "react-router-dom";

import CareerPage from "./CareerPage";
import AdminUploadPage from "./AdminUploadPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CareerPage />} />

        <Route path="/admin-upload" element={<AdminUploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
