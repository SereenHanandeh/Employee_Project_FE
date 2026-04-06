import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function LeavesList() {
  const [leaves, setLeaves] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leaves");
      setLeaves(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const goBack = () => nav(-1);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/leaves/${id}`, { status });

      setLeaves((prev) =>
        prev.map((l) => (l.leave_id === id ? { ...l, status } : l)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const statusUI = (status) => {
    if (status === "approved")
      return { text: "مقبول", color: "#4ade80", bg: "#14532d" };

    if (status === "rejected")
      return { text: "مرفوض", color: "#f87171", bg: "#7f1d1d" };

    return { text: "قيد الانتظار", color: "#facc15", bg: "#78350f" };
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
         <div>
            <h2 style={styles.title}>📅 إدارة الإجازات</h2>
            <p style={styles.subtitle}>عرض ومتابعة طلبات الإجازات</p>
          </div>
        {/* HEADER */}
        <div style={styles.header}>
         
          <button style={styles.backBtn} onClick={goBack}>
            ⬅ رجوع
          </button>
          <button
            style={styles.addBtn}
            onClick={() => (window.location.href = "/leave")}
          >
            ➕ إضافة إجازة
          </button>
        </div>

        {/* TABLE CARD */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>الموظف</th>
                <th style={styles.th}>النوع</th>
                <th style={styles.th}>من</th>
                <th style={styles.th}>إلى</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>الإجراء</th>
              </tr>
            </thead>

            <tbody>
              {leaves.map((l) => {
                const s = statusUI(l.status);

                return (
                  <tr key={l.leave_id} style={styles.row}>
                    <td style={styles.td}>{l.name}</td>
                    <td style={styles.td}>{l.type}</td>
                    <td style={styles.td}>{l.from_date}</td>
                    <td style={styles.td}>{l.to_date}</td>

                    {/* STATUS */}
                    <td>
                      <span
                        style={{
                          ...styles.badge,
                          background: s.bg,
                          color: s.color,
                        }}
                      >
                        {s.text}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td>
                      {l.status === "pending" ? (
                        <div style={styles.actions}>
                          <button
                            style={styles.accept}
                            onClick={() => updateStatus(l.leave_id, "approved")}
                          >
                            قبول
                          </button>

                          <button
                            style={styles.reject}
                            onClick={() => updateStatus(l.leave_id, "rejected")}
                          >
                            رفض
                          </button>
                        </div>
                      ) : (
                        <span style={styles.done}>تم المعالجة</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    padding: "40px",
    fontFamily: "Cairo, sans-serif",
    direction: "rtl",
    color: "#e2e8f0",
  },

  wrapper: {
    maxWidth: "1100px",
    margin: "auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: "10px",
    flexWrap: "wrap",
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

  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "700",
    color: "#f1f5f9",
  },

  subtitle: {
    marginTop: "5px",
    fontSize: "14px",
    color: "#94a3b8",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "20px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  name: {
    fontWeight: "600",
    color: "#f8fafc",
  },

  th: {
    textAlign: "right",
    padding: "12px",
    color: "#94a3b8",
    fontSize: "13px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: "14px",
  },

  row: {
    transition: "0.2s",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  actions: {
    display: "flex",
    gap: "8px",
  },

  accept: {
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
  },

  reject: {
    background: "linear-gradient(135deg,#ef4444,#dc2626)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
  },

  done: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};
