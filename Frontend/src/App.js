import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            الصفحة الرئيسية
        ===================================================== */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* =====================================================
            تسجيل الدخول
        ===================================================== */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================================
            نظام التقييم
        ===================================================== */}
        <Route
          path="/step1"
          element={<Step1 />}
        />

        <Route
          path="/performance"
          element={<Performance />}
        />

        <Route
          path="/personality"
          element={<Personality />}
        />

        <Route
          path="/relations"
          element={<Relations />}
        />

        <Route
          path="/result"
          element={<Result />}
        />

        <Route
          path="/notes"
          element={<Notes />}
        />

        <Route
          path="/print"
          element={<Print />}
        />

        {/* =====================================================
            نظام الإجازات
        ===================================================== */}
        <Route
          path="/leave"
          element={<LeaveForm />}
        />

        {/* =====================================================
            الموظف
        ===================================================== */}
        <Route
          path="/employee"
          element={<EmployeeDashboard />}
        />

        {/* =====================================================
            ADMIN LAYOUT
            جميع صفحات الإدارة تستخدم Sidebar المشترك
        ===================================================== */}
        <Route element={<DashboardLayout />}>

          {/* لوحة التحكم */}
          <Route
            path="/admin-dashboard"
            element={<Dashboard />}
          />

          {/* الموظفين */}
          <Route
            path="/employees"
            element={<Employees />}
          />

          {/* إضافة موظف */}
          <Route
            path="/add-employee"
            element={<CreateEmployee />}
          />

          {/* الإجازات */}
          <Route
            path="/leaves-list"
            element={<LeavesList />}
          />

          {/* التقييمات */}
          <Route
            path="/history"
            element={<History />}
          />

          {/* المهام */}
          <Route
            path="/tasks"
            element={<SelectTask />}
          />

          {/* إضافة مهمة */}
          <Route
            path="/add-task"
            element={<AddTask />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;