import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const nav = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    nav("/login");
  };

  return (
    <div style={styles.container}>
      {/* 🔐 Login / Logout */}
      {!isLoggedIn ? (
        <button style={styles.loginBtn} onClick={() => nav("/login")}>
          تسجيل الدخول
        </button>
      ) : (
        <button style={styles.logoutBtn} onClick={handleLogout}>
          تسجيل الخروج
        </button>
      )}

      {/* 💎 CARD */}
      <div style={styles.card}>
        <h1 style={styles.title}>نظام إدارة الموظفين</h1>

        <p style={styles.subtitle}>
          منصة متكاملة لإدارة الموظفين، متابعة الأداء، تنظيم الإجازات وتسهيل
          عملية التقييم بكل احترافية وسهولة.
        </p>
      </div>
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Cairo, sans-serif",
    background: "linear-gradient(135deg,#4f46e5,#3b82f6)",
    position: "relative",
  },

  loginBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  },

  logoutBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  },

  card: {
    background: "rgba(255,255,255,0.95)",
    padding: "50px",
    borderRadius: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "420px",
  },

  title: {
    marginBottom: "15px",
    color: "#1e293b",
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "30px",
    lineHeight: "1.6",
  },

  evalBtn: {
    width: "100%",
    padding: "15px",
    marginBottom: "15px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#6366f1,#3b82f6)",
    color: "#fff",
    cursor: "pointer",
  },

  leaveBtn: {
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff",
    cursor: "pointer",
  },
};
