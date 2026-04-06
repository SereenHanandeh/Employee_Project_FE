import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const employeeData = localStorage.getItem("employee");
  if (!employeeData) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
