import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= GENERAL =================

import Home from "./Pages/home";
import Login from "./Pages/login";

// ================= EVALUATION =================

import Step1 from "./Pages/Step1";
import Performance from "./Pages/Performance";
import Personality from "./Pages/Personality";
import Result from "./Pages/Result";
import Notes from "./Pages/Notes";
import Print from "./Pages/Print";
import Relations from "./Pages/Relations";

// ================= LEAVES =================

import LeaveForm from "./Pages/LeaveForm";
import LeavesList from "./Pages/LeavesList";

// ================= ADMIN =================

import Dashboard from "./Pages/Dashboard";
import DashboardLayout from "./Pages/DashboardLayout";
import Employees from "./Pages/Employees";
import CreateEmployee from "./Pages/CreateEmployee";
import History from "./Pages/History";
import AddTask from "./Pages/AddTask";
import SelectTask from "./Pages/SelectTask";

// ================= EMPLOYEE =================

import EmployeeDashboard from "./Pages/employeeDashboard";
import EmployeeSettings from "./Pages/EmployeeSettings";

// ================= PROTECTION =================

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            الصفحة الرئيسية
        ===================================================== */}

        <Route path="/" element={<Home />} />

        {/* =====================================================
            تسجيل الدخول
        ===================================================== */}

        <Route path="/login" element={<Login />} />

        {/* =====================================================
            PAGES FOR LOGGED-IN USERS
            Admin + Employee
        ===================================================== */}

        <Route
          element={<ProtectedRoute allowedRoles={["admin", "employee"]} />}
        >
          {/* ================= EVALUATION ================= */}

          <Route path="/step1" element={<Step1 />} />

          <Route path="/performance" element={<Performance />} />

          <Route path="/personality" element={<Personality />} />

          <Route path="/relations" element={<Relations />} />

          <Route path="/result" element={<Result />} />

          <Route path="/notes" element={<Notes />} />

          <Route path="/print" element={<Print />} />

          {/* ================= LEAVE FORM ================= */}

          <Route path="/leave" element={<LeaveForm />} />
        </Route>

        {/* =====================================================
            EMPLOYEE
            Employee فقط
        ===================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
          <Route path="/employee" element={<EmployeeDashboard />} />

          <Route path="/employee/settings" element={<EmployeeSettings />} />
        </Route>

        {/* =====================================================
            ADMIN
            Admin فقط
            جميع صفحات الإدارة تستخدم DashboardLayout
        ===================================================== */}

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            {/* ================= DASHBOARD ================= */}

            <Route path="/admin-dashboard" element={<Dashboard />} />

            {/* ================= EMPLOYEES ================= */}

            <Route path="/employees" element={<Employees />} />

            {/* ================= ADD EMPLOYEE ================= */}

            <Route path="/add-employee" element={<CreateEmployee />} />

            {/* ================= LEAVES ================= */}

            <Route path="/leaves-list" element={<LeavesList />} />

            {/* ================= HISTORY ================= */}

            <Route path="/history" element={<History />} />

            {/* ================= TASKS ================= */}

            <Route path="/tasks" element={<SelectTask />} />

            {/* ================= ADD TASK ================= */}

            <Route path="/add-task" element={<AddTask />} />
          </Route>
        </Route>

        {/* =====================================================
            PAGE NOT FOUND
        ===================================================== */}

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
