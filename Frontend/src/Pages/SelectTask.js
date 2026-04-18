import { useEffect, useState } from "react";
import API from "../api/api";

export default function SelectTask() {
  const [tasks, setTasks] = useState([]);
  const emp = JSON.parse(localStorage.getItem("employee"));

  useEffect(() => {
    API.get("/tasks").then((res) => setTasks(res.data));
  }, []);

  const selectTask = async (task_id) => {
    await API.post("/tasks/assign", {
      employee_id: emp.id,
      task_id,
    });

    alert("تم اختيار المهمة ✅");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📋 اختر مهمة</h2>

      <div style={styles.grid}>
        {tasks.map((task) => (
          <div key={task.task_id} style={styles.card}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>

            <button
              style={styles.button}
              onClick={() => selectTask(task.task_id)}
            >
              اختيار
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #020617, #0f172a)",
    color: "#fff",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
    gap: "20px",
  },

  card: {
    padding: "20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },

  button: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #22c55e, #4ade80)",
    color: "#fff",
    fontWeight: "bold",
  },
};