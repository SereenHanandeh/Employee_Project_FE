import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/home";
import Step1 from "./Pages/Step1";
import Performance from "./Pages/Performance";
import Personality from "./Pages/Personality";
import Result from "./Pages/Result";
import Notes from "./Pages/Notes";
import Print from "./Pages/Print";
import Relations from "./Pages/Relations";
import LeaveForm from "./Pages/LeaveForm";
import LeavesList from "./Pages/LeavesList";
import Dashboard from "./Pages/Dashboard";
import History from "./Pages/History";
import Login from "./Pages/login";
import CreateEmployee from "./Pages/CreateEmployee";
import EmployeeDashboard from "./Pages/employeeDashboard";
import Employees from "./Pages/Employees";
import AddTask from "./Pages/AddTask";
import SelectTask from "./Pages/SelectTask";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* الصفحة الرئيسية */}
        <Route path="/" element={<Home />} />

        {/* تسجيل الدخول والتسجيل */}
        <Route path="/login" element={<Login />} />

        {/* نظام التقييم */}
        <Route path="/step1" element={<Step1 />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/personality" element={<Personality />} />
        <Route path="/relations" element={<Relations />} />
        <Route path="/result" element={<Result />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/result" element={<Result />} />
        <Route path="/print" element={<Print />} />

        {/* نظام الإجازات */}
        <Route path="/leave" element={<LeaveForm />} />
        <Route path="/leaves-list" element={<LeavesList />} />

        {/* لوحة التحكم */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-employee" element={<CreateEmployee />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employees" element={<Employees />} />

        {/* سجل التقييمات */}
        <Route path="/history" element={<History />} />

        <Route path="/add-task" element={<AddTask />} />
        <Route path="/tasks" element={<SelectTask />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
