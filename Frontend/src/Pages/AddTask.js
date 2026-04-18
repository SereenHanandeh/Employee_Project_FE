import { useState } from "react";
import API from "../api/api";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const save = async () => {
    if (!title) return alert("أدخل عنوان التاسك");

    await API.post("/tasks", {
      title,
      description: desc,
    });

    alert("تمت إضافة التاسك ✅");
    setTitle("");
    setDesc("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>📝 إضافة مهمة جديدة</h2>

        <input
          style={styles.input}
          placeholder="عنوان المهمة"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          style={styles.textarea}
          placeholder="وصف المهمة"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button style={styles.button} onClick={save}>
          حفظ المهمة
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
  },

  card: {
    width: "400px",
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  heading: {
    color: "#fff",
    textAlign: "center",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },

  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    minHeight: "100px",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#fff",
    fontWeight: "bold",
  },
};