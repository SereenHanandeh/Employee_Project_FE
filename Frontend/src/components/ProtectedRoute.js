import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // لا يوجد تسجيل دخول
  if (!token || !userData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch (error) {
    console.error("Invalid user data");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // التحقق من الصلاحية
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // الموظف يحاول دخول صفحة Admin
    if (user.role === "employee") {
      return <Navigate to="/employee" replace />;
    }

    // أي حالة أخرى
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}