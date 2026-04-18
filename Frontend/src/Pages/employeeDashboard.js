import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const nav = useNavigate();

  useEffect(() => {
    fetchEmployee();
    fetchLeaves();
    fetchTasks();
  }, []);

  // ================= EMPLOYEE =================
  const fetchEmployee = async () => {
    try {
      const res = await API.get("/employees/me");
      setEmployee(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LEAVES =================
  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leaves/my-leaves");
      setLeaves(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const chooseTask = async (task) => {
    try {
      await API.post("/tasks/assign", {
        employee_id: employee.employee_id,
        task_id: task.task_id,
      });

      setSelectedTask(task);

      alert("تم اختيار المهمة ✅");
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FORMAT DATE =================
  const formatDate = (date) => {
    if (!date) return "";
    return date.split("T")[0];
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>HR System</h2>

        <button onClick={() => nav("/leave")} style={styles.sideBtn}>
          ➕ طلب إجازة
        </button>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 تسجيل خروج
        </button>

        <div style={styles.userBox}>
          <p style={{ margin: 0, color: "#94a3b8" }}>مرحباً</p>
          <b>{employee?.name || "..."}</b>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h1 style={styles.h1}>لوحة الموظف</h1>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.card}>
            <h3>الإجازات</h3>
            <p>{leaves.length}</p>
          </div>
        </div>

        {/* LEAVES */}
        <h2 style={styles.section}>📅 الإجازات</h2>

        {leaves.length === 0 ? (
          <p style={styles.empty}>لا يوجد إجازات</p>
        ) : (
          leaves.map((l, index) => (
            <div key={index} style={styles.box}>
              <h4>{l.type}</h4>

              <p style={{ margin: "5px 0", color: "#cbd5e1" }}>
                📅 {formatDate(l.from_date)} → {formatDate(l.to_date)}
              </p>

              <p style={{ margin: "5px 0", color: "#94a3b8" }}>
                🕒 {l.days} أيام
              </p>

              <span
                style={{
                  ...styles.badge,
                  background:
                    l.status === "approved"
                      ? "#dcfce7"
                      : l.status === "rejected"
                        ? "#fee2e2"
                        : "#fef9c3",
                  color:
                    l.status === "approved"
                      ? "#166534"
                      : l.status === "rejected"
                        ? "#991b1b"
                        : "#854d0e",
                }}
              >
                {l.status}
              </span>
            </div>
          ))
        )}
        <h2 style={styles.section}>📋 المهام</h2>

        {tasks.length === 0 ? (
          <p style={styles.empty}>لا توجد مهام</p>
        ) : (
          <div style={styles.tasksGrid}>
            {tasks.map((task) => (
              <div
                key={task.task_id}
                style={{
                  ...styles.taskCard,
                  border:
                    selectedTask?.task_id === task.task_id
                      ? "2px solid #22c55e"
                      : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <h4>{task.title}</h4>
                <p style={{ color: "#94a3b8" }}>{task.description}</p>

                <button
                  style={{
                    ...styles.taskBtn,
                    background:
                      selectedTask?.task_id === task.task_id
                        ? "#22c55e"
                        : "linear-gradient(135deg,#3b82f6,#6366f1)",
                  }}
                  onClick={() => chooseTask(task)}
                >
                  {selectedTask?.task_id === task.task_id
                    ? "✔ مختارة"
                    : "اختيار"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLE ================= */
const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Cairo, sans-serif",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "#e2e8f0",
  },

  sidebar: {
    width: "250px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    padding: "25px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    borderRight: "1px solid rgba(255,255,255,0.1)",
  },

  logo: {
    color: "#60a5fa",
    marginBottom: "20px",
    fontWeight: "700",
  },

  sideBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "white",
    fontWeight: "600",
  },

  logoutBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ef4444",
    cursor: "pointer",
    background: "transparent",
    color: "#ef4444",
    fontWeight: "600",
  },

  userBox: {
    marginTop: "auto",
    padding: "15px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "10px",
    textAlign: "center",
  },

  main: {
    flex: 1,
    padding: "30px",
  },

  h1: {
    marginBottom: "25px",
    fontSize: "26px",
    fontWeight: "700",
    color: "#f1f5f9",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(1,1fr)",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "14px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
  },

  section: {
    marginTop: "25px",
    marginBottom: "10px",
    color: "#93c5fd",
    fontWeight: "600",
  },

  box: {
    background: "rgba(255,255,255,0.08)",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(6px)",
    marginBottom: "15px",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block",
    marginTop: "10px",
  },

  empty: {
    color: "#94a3b8",
  },

  tasksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
    gap: "15px",
  },

  taskCard: {
    padding: "15px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(6px)",
  },

  taskBtn: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontWeight: "600",
  },
};
