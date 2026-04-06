import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const personalityItems = [
  { title: "1- القدرة على الحوار و عرض الرأي", max: 4 },
  { title: "2- تقدير المسؤولية", max: 4 },
  { title: "3- حسن التصرف", max: 4 },
  { title: "4- تقبل التوجيهات والاستعداد لتنفيذها", max: 4 },
  { title: "5- الاهتمام بالمظهر", max: 3 },
];

export default function Personality() {
  const nav = useNavigate();
  const location = useLocation();

 const { employee_id, name, from_date, to_date, performance } = location.state || {};

  const [p, setP] = useState({});

  const change = (i, val, max) => {
    if (val === "") {
      const copy = { ...p };
      delete copy[i];
      setP(copy);
      return;
    }

    let num = Number(val);
    if (num > max) num = max;
    if (num < 0) num = 0;

    setP({ ...p, [i]: num });
  };

  const completed = Object.keys(p).length;
  const progress = Math.round(
    (completed / personalityItems.length) * 100
  );

  const total = Object.values(p).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  // ✅ الانتقال فقط بدون حفظ DB
  const next = () => {
    if (!employee_id || !from_date || !to_date) {
      alert("بيانات غير مكتملة!");
      return;
    }

    if (Object.keys(p).length < personalityItems.length) {
      alert("يرجى تعبئة جميع الحقول قبل المتابعة!");
      return;
    }

    nav("/relations", {
  state: {
    employee_id,
    name,
    from_date,
    to_date,
    performance,
    personality: p,
  },
});
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>🧠 الصفات الشخصية</h2>

        {/* Progress */}
        <div style={styles.progressContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress}%`,
            }}
          />
        </div>

        <p style={styles.progressText}>{progress}% مكتمل</p>

        {/* Inputs */}
        {personalityItems.map((it, i) => (
          <div key={i} style={styles.formGroup}>
            <label style={styles.label}>
              {it.title} (max {it.max})
            </label>

            <input
              type="number"
              min={0}
              max={it.max}
              style={styles.input}
              value={p[i] || ""}
              onChange={(e) =>
                change(i, e.target.value, it.max)
              }
            />
          </div>
        ))}

        <div style={styles.total}>
          مجموع النقاط: {total}
        </div>

        <button style={styles.button} onClick={next}>
          التالي ➜
        </button>
      </div>

      <button style={styles.backBtn} onClick={() => nav(-1)}>
        ⬅ رجوع
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    direction: "rtl",
    fontFamily: "'Cairo', sans-serif",

    background: "linear-gradient(-45deg, #0f172a, #1e293b, #0ea5e9, #6366f1)",
    backgroundSize: "400% 400%",
    animation: "gradientBG 12s ease infinite",
    padding: "20px",
  },

  card: {
    width: "650px",
    padding: "40px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#fff",
    fontSize: "26px",
    fontWeight: "700",
  },

  progressContainer: {
    width: "100%",
    height: "12px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "10px",
  },

  progressBar: {
    height: "100%",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },

  progressText: {
    textAlign: "right",
    marginBottom: "20px",
    color: "#cbd5e1",
    fontWeight: "600",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },

  label: {
    marginBottom: "6px",
    color: "#cbd5e1",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
  },

  total: {
    marginTop: "20px",
    textAlign: "right",
    color: "#60a5fa",
    fontWeight: "700",
  },

  button: {
    width: "100%",
    marginTop: "25px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
    color: "#fff",
    fontWeight: "700",
  },

  backBtn: {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    background: "linear-gradient(135deg,#475569,#1e293b)",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "50px",
    cursor: "pointer",
    fontWeight: "600",
  },
};