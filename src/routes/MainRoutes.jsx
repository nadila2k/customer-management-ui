import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";



function MainRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Default redirect */}
        <Route index element={<Navigate to="/customers" replace />} />

        {/* Customer routes */}
        <Route path="/customers" element={<CustomerListPage />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Route>
    </Routes>
  );
}

export default MainRoutes;