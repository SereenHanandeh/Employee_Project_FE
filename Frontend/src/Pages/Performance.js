import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const items = [
  { title: "1- القدرة على تطوير اساليب العمل", max: 5 },
  { title: "2- القدره على تدريب غيره من العاملين", max: 4 },
  { title: "3- المهارة في التنفيذ", max: 6 },
  { title: "4- القدرة على تحديد متطلبات انجاز العمل", max: 5 },
  { title: "5- القدره على تحديد خطوات العمل و البرنامج الزمني", max: 4 },
  { title: "6- المحافظة على أوقات العمل", max: 6 },
  { title: "7- القدرة على التغلب على صعوبات العمل", max: 6 },
  { title: "8- المعرفة بالأسس و المفاهيم الفنية", max: 4 },
  { title: "9- المعرفة بنظم العمل", max: 4 },
  { title: "10- المتابعة لما يستجد", max: 4 },
  { title: "11- المشاركة في الاجتماعات", max: 4 },
  { title: "12- الاتصالات الفعالة", max: 5 },
  { title: "13- تحمل المسؤوليات", max: 3 },
  { title: "14- معرفة الأهداف", max: 2 },
  { title: "15- تقديم الأفكار", max: 2 },
  { title: "16- إنجاز العمل", max: 4 },
  { title: "17- المراجعة والتدقيق", max: 4 },
];

export default function Performance() {
  const nav = useNavigate();
  const location = useLocation();

  const { employee_id, from_date, to_date } = location.state || {};

  const [scores, setScores] = useState({});
  
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);

  const change = (i, val, max) => {
    if (val === "") {
      const copy = { ...scores };
      delete copy[i];
      setScores(copy);
      return;
    }

    let num = Number(val);
    if (num > max) num = max;
    if (num < 0) num = 0;

    setScores({ ...scores, [i]: num });
  };

  const total = Object.values(scores).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  const next = () => {
    if (!employee_id || !from_date || !to_date) {
      alert("بيانات غير مكتملة!");
      return;
    }

    if (Object.keys(scores).length < items.length) {
      alert("يرجى تعبئة جميع الحقول!");
      return;
    }

    nav("/personality", {
      state: {
        employee_id,
        from_date,
        to_date,
        performance: scores,
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>📊 الأداء الوظيفي</h2>

        {items.map((it, i) => (
          <div key={i} style={styles.formGroup}>
            <label style={styles.label}>
              {it.title} (max {it.max})
            </label>

            <input
              type="number"
              min={0}
              max={it.max}
              style={styles.input}
              value={scores[i] || ""}
              onChange={(e) => change(i, e.target.value, it.max)}
            />
          </div>
        ))}

        <div style={styles.total}>
          مجموع النقاط: {total}
        </div>

        <button style={styles.button} onClick={next} disabled={loading}>
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
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    fontFamily: "'Cairo', sans-serif",
    direction: "rtl",
    padding: "20px",
  },

  card: {
    width: "750px",
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

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
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