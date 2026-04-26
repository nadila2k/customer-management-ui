import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import CustomerListPage from "../pages/customer";



function MainRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
 
        <Route index element={<Navigate to="/customers" replace />} />

        <Route path="/customers" element={<CustomerListPage />} />

       
        <Route path="*" element={<Navigate to="/customers" replace />} />
      </Route>
    </Routes>
  );
}

export default MainRoutes;