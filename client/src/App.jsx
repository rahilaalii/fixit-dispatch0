import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewJob from "./pages/customer/NewJob";
import MyJobs from "./pages/customer/MyJobs";
import Queue from "./pages/provider/Queue";
import Dashboard from "./pages/admin/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Each group is protected by role */}
      <Route element={<Layout role="customer" />}>
        <Route path="/customer" element={<MyJobs />} />
        <Route path="/customer/new" element={<NewJob />} />
      </Route>
      <Route element={<Layout role="provider" />}>
        <Route path="/provider" element={<Queue />} />
      </Route>
      <Route element={<Layout role="admin" />}>
        <Route path="/admin" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}