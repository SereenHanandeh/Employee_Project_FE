import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [data, setData] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const res = await API.get("/evaluations");
      setData(res.data || []);
    } catch (err) {
      alert("فشل تحميل التقييمات");
    }
  };

  const deleteOne = async (id) => {
    try {
      await API.delete(`/evaluations/${id}`);
      setData((prev) => prev.filter((e) => e.evaluation_id !== id));
    } catch {
      alert("فشل الحذف");
    }
  };

  const goToAddEvaluation = () => nav("/step1");
  const goBack = () => nav(-1);

  const gradeStyle = (grade) => {
    if (!grade) return {};
    if (grade.includes("ممتاز"))
      return { background: "rgba(34,197,94,0.15)", color: "#22c55e" };
    if (grade.includes("جيد جداً"))
      return { background: "rgba(59,130,246,0.15)", color: "#60a5fa" };
    if (grade.includes("جيد"))
      return { background: "rgba(245,158,11,0.15)", color: "#fbbf24" };
    if (grade.includes("مقبول"))
      return { background: "rgba(249,115,22,0.15)", color: "#fb923c" };
    return { background: "rgba(239,68,68,0.15)", color: "#f87171" };
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={goBack}>
          ⬅ رجوع
        </button>

        <h2 style={styles.title}>📊 سجل التقييمات</h2>

        <button style={styles.addBtn} onClick={goToAddEvaluation}>
          ➕ إضافة تقييم
        </button>
      </div>

      {/* EMPTY */}
      {data.length === 0 ? (
        <div style={styles.empty}>لا توجد تقييمات حتى الآن</div>
      ) : (
        <div style={styles.grid}>
          {data.map((e) => (
            <div key={e.evaluation_id} style={styles.card}>
              <div style={styles.topRow}>
                <h3 style={styles.name}>{e.name}</h3>

                <span style={{ ...styles.grade, ...gradeStyle(e.grade) }}>
                  {e.grade}
                </span>
              </div>

              <div style={styles.body}>
                <p>
                  📅 الفترة: {e.from_date} - {e.to_date}
                </p>
                <p>
                  📊 المجموع: <b>{e.total}%</b>
                </p>
                <p>
                  📅 التاريخ:{" "}
                  {e.created_at
                    ? new Date(e.created_at).toLocaleDateString("en-GB")
                    : "-"}
                </p>
              </div>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteOne(e.evaluation_id)}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLE ================= */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "Cairo, sans-serif",
    direction: "rtl",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "10px",
    flexWrap: "wrap",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
  },

  backBtn: {
    background: "rgba(148,163,184,0.15)",
    border: "1px solid rgba(148,163,184,0.3)",
    color: "#cbd5e1",
    padding: "10px 14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.3s",
  },

  addBtn: {
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 10px 20px rgba(59,130,246,0.3)",
    transition: "0.3s",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "20px",
    transition: "0.3s",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    alignItems: "center",
  },

  name: {
    fontSize: "18px",
    margin: 0,
  },

  grade: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  body: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    opacity: 0.9,
  },

  deleteBtn: {
    marginTop: "15px",
    background: "rgba(239,68,68,0.2)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#f87171",
    padding: "8px",
    borderRadius: "10px",
    cursor: "pointer",
    width: "100%",
  },

  empty: {
    textAlign: "center",
    marginTop: "50px",
    color: "#94a3b8",
    fontSize: "18px",
  },
};
