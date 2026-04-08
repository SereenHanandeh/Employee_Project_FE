import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [stats, setStats] = useState({
    employees: 0,
    evaluations: 0,
    leaves: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [empRes, evalRes, leaveRes] = await Promise.all([
        API.get("/employees"),
        API.get("/evaluations"),
        API.get("/leaves"),
      ]);

      setStats({
        employees: empRes.data?.length || 0,
        evaluations: evalRes.data?.length || 0,
        leaves: leaveRes.data?.length || 0,
      });
    } catch (err) {
      console.error(err);
      alert("فشل تحميل البيانات");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  return (
    <div style={styles.container}>

      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <h1 style={styles.heading}>لوحة تحكم الأدمن</h1>

        <button style={styles.logoutButton} onClick={handleLogout}>
          🚪 تسجيل الخروج
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div style={styles.cards}>
        <div style={{ ...styles.card, ...styles.blue }}>
          <h2 style={styles.number}>{stats.employees}</h2>
          <p style={styles.text}>الموظفين</p>
        </div>

        <div style={{ ...styles.card, ...styles.orange }}>
          <h2 style={styles.number}>{stats.evaluations}</h2>
          <p style={styles.text}>التقييمات</p>
        </div>

        <div style={{ ...styles.card, ...styles.green }}>
          <h2 style={styles.number}>{stats.leaves}</h2>
          <p style={styles.text}>الإجازات</p>
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div style={styles.buttons}>
        <button style={styles.button} onClick={() => nav("/add-employee")}>
          ➕ إضافة موظف
        </button>

        <button style={styles.button} onClick={() => nav("/leaves-list")}>
          📋 الإجازات
        </button>

        <button style={styles.button} onClick={() => nav("/employees")}>
          👨‍💼 الموظفين
        </button>

        <button style={styles.button} onClick={() => nav("/history")}>
          📊 التقييمات
        </button>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */
const styles = {
  container: {
    minHeight: "100vh",
    padding: "50px 20px",
    direction: "rtl",
    fontFamily: "Cairo, sans-serif",

    background: "linear-gradient(135deg, #0f172a, #1e293b, #0b1220)",
  },

  /* ===== HEADER ===== */
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },

  heading: {
    fontSize: "34px",
    fontWeight: "bold",
    color: "#fff",
    margin: 0,
  },

  logoutButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#fff",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    boxShadow: "0 8px 20px rgba(239,68,68,0.3)",
    transition: "0.3s",
  },

  /* ===== STATS ===== */
  cards: {
    display: "flex",
    justifyContent: "center",
    gap: "25px",
    flexWrap: "wrap",
    marginBottom: "50px",
  },

  card: {
    width: "220px",
    padding: "25px",
    borderRadius: "18px",
    textAlign: "center",
    color: "#fff",

    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",

    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },

  blue: { borderLeft: "4px solid #38bdf8" },
  orange: { borderLeft: "4px solid #fb923c" },
  green: { borderLeft: "4px solid #4ade80" },

  number: {
    fontSize: "28px",
    margin: "0",
    fontWeight: "bold",
  },

  text: {
    marginTop: "8px",
    fontSize: "14px",
    opacity: 0.8,
  },

  /* ===== BUTTONS ===== */
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  button: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#fff",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    boxShadow: "0 8px 20px rgba(59,130,246,0.3)",
    transition: "0.3s",
  },
};