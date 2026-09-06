import { useState } from "react";
import API from "../api/api";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  // الحصول على تاريخ اليوم بصيغة YYYY-MM-DD
  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const showModal = (type, title, message) => {
    setModal({
      open: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const save = async () => {
    if (!title.trim()) {
      showModal(
        "warning",
        "عنوان المهمة مطلوب",
        "يرجى إدخال عنوان المهمة قبل الحفظ."
      );
      return;
    }

    if (!dueDate) {
      showModal(
        "warning",
        "تاريخ المهمة مطلوب",
        "يرجى تحديد تاريخ استحقاق المهمة."
      );
      return;
    }

    try {
      await API.post("/tasks", {
        title: title.trim(),
        description: desc.trim(),
        due_date: dueDate,
        completed,
      });

      showModal(
        "success",
        "تمت إضافة المهمة",
        "تمت إضافة المهمة بنجاح."
      );

      setTitle("");
      setDesc("");
      setDueDate("");
      setCompleted(false);
    } catch (error) {
      console.error("Add Task Error:", error);

      showModal(
        "error",
        "حدث خطأ",
        error?.response?.data?.message ||
          "حدث خطأ أثناء إضافة المهمة."
      );
    }
  };

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.card}>
        <h2 style={styles.heading}>
          📝 إضافة مهمة جديدة
        </h2>

        {/* عنوان المهمة */}
        <div style={styles.field}>
          <label style={styles.label}>
            عنوان المهمة
          </label>

          <input
            style={styles.input}
            placeholder="أدخل عنوان المهمة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* وصف المهمة */}
        <div style={styles.field}>
          <label style={styles.label}>
            وصف المهمة
          </label>

          <textarea
            style={styles.textarea}
            placeholder="أدخل وصف المهمة"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* تاريخ استحقاق المهمة */}
        <div style={styles.field}>
          <label style={styles.label}>
            تاريخ استحقاق المهمة
          </label>

          <input
            type="date"
            style={styles.input}
            value={dueDate}
            min={getToday()}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <small style={styles.dateHint}>
            حدد آخر تاريخ يجب إنجاز المهمة قبله.
          </small>
        </div>

        {/* حالة المهمة */}
        <div style={styles.statusBox}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) =>
                setCompleted(e.target.checked)
              }
            />

            <span>
              تم إنهاء المهمة
            </span>
          </label>

          <span
            style={{
              ...styles.statusBadge,
              ...(completed
                ? styles.completed
                : styles.notCompleted),
            }}
          >
            {completed ? "مكتملة" : "غير مكتملة"}
          </span>
        </div>

        {/* زر الحفظ */}
        <button
          style={styles.button}
          onClick={save}
        >
          حفظ المهمة
        </button>
      </div>

      {/* Modal */}
      {modal.open && (
        <div
          style={styles.overlay}
          onClick={closeModal}
        >
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                ...styles.modalIcon,
                ...(modal.type === "success"
                  ? styles.successIcon
                  : modal.type === "error"
                  ? styles.errorIcon
                  : styles.warningIcon),
              }}
            >
              {modal.type === "success"
                ? "✓"
                : "!"}
            </div>

            <h3 style={styles.modalTitle}>
              {modal.title}
            </h3>

            <p style={styles.modalMessage}>
              {modal.message}
            </p>

            <button
              style={styles.modalButton}
              onClick={closeModal}
            >
              حسناً
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
    background:
      "linear-gradient(135deg, #0f172a, #1e293b)",
    fontFamily: "Cairo, Tahoma, sans-serif",
  },

  card: {
    width: "400px",
    maxWidth: "100%",
    padding: "30px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  heading: {
    color: "#fff",
    textAlign: "center",
    margin: "0 0 5px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "14px",
    background: "#fff",
    color: "#172033",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "14px",
    background: "#fff",
    color: "#172033",
  },

  dateHint: {
    color: "#cbd5e1",
    fontSize: "11px",
  },

  statusBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "12px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },

  statusBadge: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },

  completed: {
    background: "#dcfce7",
    color: "#166534",
  },

  notCompleted: {
    background: "#fef3c7",
    color: "#92400e",
  },

  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background:
      "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "inherit",
    fontSize: "14px",
    marginTop: "5px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    width: "360px",
    maxWidth: "100%",
    background: "#fff",
    borderRadius: "20px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    fontFamily: "Cairo, Tahoma, sans-serif",
  },

  modalIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    margin: "0 auto 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "bold",
  },

  successIcon: {
    background: "#dcfce7",
    color: "#16a34a",
  },

  errorIcon: {
    background: "#fee2e2",
    color: "#dc2626",
  },

  warningIcon: {
    background: "#fef3c7",
    color: "#d97706",
  },

  modalTitle: {
    margin: "0 0 8px",
    color: "#172033",
    fontSize: "20px",
  },

  modalMessage: {
    margin: "0 0 20px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.8",
  },

  modalButton: {
    width: "100%",
    padding: "11px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#fff",
    fontFamily: "inherit",
    fontWeight: "bold",
    cursor: "pointer",
  },
};