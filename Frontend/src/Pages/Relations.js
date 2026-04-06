import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const relationsItems = [
  { title: "1- العلاقات مع الرؤساء", max: 3 },
  { title: "2- العلاقات مع الزملاء", max: 3 },
  { title: "3- العلاقات مع المراجعين", max: 3 },
];

export default function Relations() {
  const nav = useNavigate();
  const location = useLocation();

  const {
    employee_id,
    name,
    from_date,
    to_date,
    performance,
    personality,
  } = location.state || {};

  const [r, setR] = useState({});

  const change = (i, val, max) => {
    if (val === "") {
      const copy = { ...r };
      delete copy[i];
      setR(copy);
      return;
    }

    let num = Number(val);
    if (num > max) num = max;
    if (num < 0) num = 0;

    setR({ ...r, [i]: num });
  };

  const completed = Object.keys(r).length;

  const progress = Math.round(
    (completed / relationsItems.length) * 100
  );

  const total = Object.values(r).reduce(
    (acc, val) => acc + Number(val || 0),
    0
  );

  const next = () => {
    if (!employee_id || !from_date || !to_date) {
      alert("بيانات ناقصة!");
      return;
    }

    if (Object.keys(r).length < relationsItems.length) {
      alert("يرجى تعبئة جميع الحقول!");
      return;
    }

   nav("/result", {
  state: {
    employee_id,
    name,
    from_date,
    to_date,
    performance,
    personality,
    relations: r,
  },
});
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>العلاقات</h2>

        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress}%`,
            }}
          />
        </div>

        <p style={styles.progressText}>
          {progress}% مكتمل
        </p>

        {/* Inputs */}
        {relationsItems.map((it, i) => (
          <div key={i} style={styles.formGroup}>
            <label style={styles.label}>
              {it.title} (max {it.max})
            </label>

            <input
              type="number"
              min={0}
              max={it.max}
              style={styles.input}
              value={r[i] || ""}
              onChange={(e) =>
                change(i, e.target.value, it.max)
              }
            />
          </div>
        ))}

        <div style={styles.total}>
          <strong>مجموع النقاط: {total}</strong>
        </div>

        <button style={styles.button} onClick={next}>
          التالي
        </button>
      </div>

      <button
        style={styles.backButton}
        onClick={() => nav(-1)}
      >
        ⬅ رجوع
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    fontFamily: "'Poppins', sans-serif",
    position: "relative",
  },

  container: {
    maxWidth: "650px",
    width: "100%",
    padding: "50px 40px",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#fff",
    fontSize: "28px",
    fontWeight: "700",
  },

  progressContainer: {
    width: "100%",
    height: "14px",
    backgroundColor: "#334155",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "10px",
  },

  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    transition: "width 0.5s ease",
  },

  progressText: {
    textAlign: "right",
    marginBottom: "20px",
    color: "#cbd5e1",
    fontWeight: "500",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
  },

  label: {
    marginBottom: "6px",
    fontWeight: "600",
    color: "#e2e8f0",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #475569",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
  },

  total: {
    marginTop: "20px",
    fontSize: "18px",
    textAlign: "right",
    color: "#f8fafc",
  },

  button: {
    width: "100%",
    padding: "14px",
    marginTop: "25px",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "600",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
  },

  backButton: {
    position: "fixed",
    bottom: "20px",
    left: "20px",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#ef4444",
    color: "#fff",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
  },
};
