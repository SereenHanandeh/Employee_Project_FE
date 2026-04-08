import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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

  // ================= DATA FOR CHARTS =================
  const barData = [
    { name: "الموظفين", value: stats.employees },
    { name: "التقييمات", value: stats.evaluations },
    { name: "الإجازات", value: stats.leaves },
  ];

  const pieData = [
    { name: "الموظفين", value: stats.employees },
    { name: "التقييمات", value: stats.evaluations },
    { name: "الإجازات", value: stats.leaves },
  ];

  const COLORS = ["#38bdf8", "#fb923c", "#4ade80"];

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/");
  };

  return (
    <div style={styles.container}>
      {/* ===== HEADER ===== */}
      <div style={styles.header}>
        <h1 style={styles.heading}>لوحة تحكم الأدمن</h1>

        <button style={styles.logoutButton} onClick={handleLogout}>
          🚪 تسجيل الخروج
        </button>
      </div>

      {/* ===== CHARTS ===== */}
      <div style={styles.chartsContainer}>
        {/* ===== BAR CHART ===== */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>إحصائيات النظام</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===== PIE CHART ===== */}
        <div style={styles.chartBox}>
          <h3 style={styles.chartTitle}>توزيع البيانات</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== BUTTONS ===== */}
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
  },

  logoutButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    background: "#ef4444",
  },

  chartsContainer: {
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "50px",
  },

  chartBox: {
    width: "450px",
    padding: "20px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  chartTitle: {
    color: "#fff",
    marginBottom: "15px",
    textAlign: "center",
  },

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
    background: "#3b82f6",
  },
};