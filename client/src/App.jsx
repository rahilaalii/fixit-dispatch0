import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";
import Home from "./pages/public/Home";
import Services from "./pages/public/Services";
import Providers from "./pages/public/Providers";
import ProviderProfile from "./pages/public/ProviderProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewJob from "./pages/customer/NewJob";
import MyJobs from "./pages/customer/MyJobs";
import Queue from "./pages/provider/Queue";
import Dashboard from "./pages/admin/Dashboard";
import AdminProviders from "./pages/admin/Providers";
import Categories from "./pages/admin/Categories";

export default function App() {
  return (
    <Routes>
      {/* Public pages: anyone can open these without logging in */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/providers/:id" element={<ProviderProfile />} />
      </Route>

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
        <Route path="/admin/providers" element={<AdminProviders />} />
        <Route path="/admin/categories" element={<Categories />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
