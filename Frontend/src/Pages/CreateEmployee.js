import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AddEmployee() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    password: "",
  });

  const handleSubmit = async () => {
    try {
      await API.post("/employees", {
        ...form,
        role: "employee",
      });

      alert("تم إضافة الموظف");
      nav("/dashboard");
    } catch (err) {
      console.log(err);
      alert("خطأ");
    }
  };

  const goBack = () => {
    nav(-1);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>➕ إضافة موظف جديد</h2>

        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="الاسم"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="الإيميل"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="القسم"
            onChange={(e) =>
              setForm({ ...form, department: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="الوظيفة"
            onChange={(e) =>
              setForm({ ...form, position: e.target.value })
            }
          />

          <input
            style={styles.input}
            placeholder="كلمة المرور"
            type="password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button style={styles.button} onClick={handleSubmit}>
            حفظ الموظف
          </button>
        </div>
      </div>

      {/* زر الرجوع العائم */}
      <button style={styles.floatingBackBtn} onClick={goBack}>
        ⬅ رجوع
      </button>
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#1e293b,#0f172a)",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
    padding: "20px",
  },

  card: {
    width: "420px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "700",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    outline: "none",
    fontSize: "15px",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "16px",
    boxShadow: "0 8px 20px rgba(59,130,246,0.3)",
    transition: "0.3s",
  },

  floatingBackBtn: {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    background: "linear-gradient(135deg,#64748b,#334155)",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "50px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    zIndex: 999,
  },
};