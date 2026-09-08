import { useState } from "react";
import API from "../api/api";
import {
  FaTasks,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaSave,
  FaLayerGroup,
  FaTimes,
} from "react-icons/fa";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [stages, setStages] = useState([
    {
      title: "",
      description: "",
      due_date: "",
    },
  ]);

  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "warning",
    title: "",
    message: "",
  });

  // =====================================================
  // TODAY
  // =====================================================

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(
      2,
      "0"
    );

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // MODAL
  // =====================================================

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

  // =====================================================
  // ADD STAGE
  // =====================================================

  const addStage = () => {
    setStages((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        due_date: "",
      },
    ]);
  };

  // =====================================================
  // REMOVE STAGE
  // =====================================================

  const removeStage = (index) => {
    if (stages.length === 1) {
      showModal(
        "warning",
        "لا يمكن حذف المرحلة",
        "يجب أن تحتوي المهمة على مرحلة واحدة على الأقل."
      );

      return;
    }

    setStages((prev) =>
      prev.filter((_, stageIndex) => stageIndex !== index)
    );
  };

  // =====================================================
  // UPDATE STAGE
  // =====================================================

  const updateStage = (index, field, value) => {
    setStages((prev) =>
      prev.map((stage, stageIndex) =>
        stageIndex === index
          ? {
              ...stage,
              [field]: value,
            }
          : stage
      )
    );
  };

  // =====================================================
  // SAVE
  // =====================================================

  const save = async () => {
    // ---------------------------------------------------
    // TASK TITLE
    // ---------------------------------------------------

    if (!title.trim()) {
      showModal(
        "warning",
        "عنوان المهمة مطلوب",
        "يرجى إدخال عنوان المهمة قبل الحفظ."
      );

      return;
    }

    // ---------------------------------------------------
    // TASK DUE DATE
    // ---------------------------------------------------

    if (!dueDate) {
      showModal(
        "warning",
        "تاريخ المهمة مطلوب",
        "يرجى تحديد تاريخ استحقاق المهمة."
      );

      return;
    }

    // ---------------------------------------------------
    // VALIDATE STAGES
    // ---------------------------------------------------

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];

      if (!stage.title.trim()) {
        showModal(
          "warning",
          `اسم المرحلة ${i + 1} مطلوب`,
          `يرجى إدخال اسم المرحلة رقم ${i + 1}.`
        );

        return;
      }

      if (!stage.due_date) {
        showModal(
          "warning",
          `تاريخ المرحلة ${i + 1} مطلوب`,
          `يرجى تحديد تاريخ استحقاق المرحلة رقم ${i + 1}.`
        );

        return;
      }

      // المرحلة لا يجوز أن تتجاوز تاريخ المهمة
      if (stage.due_date > dueDate) {
        showModal(
          "warning",
          "تاريخ المرحلة غير صحيح",
          `تاريخ المرحلة ${i + 1} لا يمكن أن يكون بعد تاريخ استحقاق المهمة.`
        );

        return;
      }
    }

    try {
      setSaving(true);

      const response = await API.post("/tasks", {
        title: title.trim(),

        description: desc.trim(),

        due_date: dueDate,

        stages: stages.map((stage, index) => ({
          title: stage.title.trim(),

          description:
            stage.description?.trim() || "",

          due_date: stage.due_date,

          stage_order: index + 1,
        })),
      });

      console.log("TASK CREATED:", response.data);

      showModal(
        "success",
        "تمت إضافة المهمة",
        `تمت إضافة المهمة بنجاح مع ${stages.length} مرحلة.`
      );

      // ---------------------------------------------------
      // RESET
      // ---------------------------------------------------

      setTitle("");

      setDesc("");

      setDueDate("");

      setStages([
        {
          title: "",
          description: "",
          due_date: "",
        },
      ]);
    } catch (error) {
      console.error("Add Task Error:", error);

      showModal(
        "error",
        "حدث خطأ",
        error?.response?.data?.message ||
          "حدث خطأ أثناء إضافة المهمة."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div style={styles.container} dir="rtl">
      <div style={styles.card}>
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FaTasks />
          </div>

          <div>
            <h2 style={styles.heading}>
              إضافة مهمة جديدة
            </h2>

            <p style={styles.subtitle}>
              أنشئ المهمة وحدد مراحل تنفيذها
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* TASK INFORMATION */}
        {/* ================================================= */}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            <FaTasks />

            <span>بيانات المهمة</span>
          </div>

          {/* TITLE */}

          <div style={styles.field}>
            <label style={styles.label}>
              عنوان المهمة
              <span style={styles.required}>*</span>
            </label>

            <input
              style={styles.input}
              placeholder="أدخل عنوان المهمة"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          {/* DESCRIPTION */}

          <div style={styles.field}>
            <label style={styles.label}>
              وصف المهمة
            </label>

            <textarea
              style={styles.textarea}
              placeholder="أدخل وصف المهمة"
              value={desc}
              onChange={(e) =>
                setDesc(e.target.value)
              }
            />
          </div>

          {/* DUE DATE */}

          <div style={styles.field}>
            <label style={styles.label}>
              تاريخ استحقاق المهمة
              <span style={styles.required}>*</span>
            </label>

            <div style={styles.dateWrapper}>
              <FaCalendarAlt
                style={styles.dateIcon}
              />

              <input
                type="date"
                style={styles.dateInput}
                value={dueDate}
                min={getToday()}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
              />
            </div>

            <small style={styles.dateHint}>
              يجب إنجاز جميع المراحل قبل هذا التاريخ.
            </small>
          </div>
        </div>

        {/* ================================================= */}
        {/* STAGES */}
        {/* ================================================= */}

        <div style={styles.section}>
          <div style={styles.stagesHeader}>
            <div style={styles.sectionTitle}>
              <FaLayerGroup />

              <span>مراحل المهمة</span>
            </div>

            <div style={styles.stageCount}>
              {stages.length}{" "}
              {stages.length === 1
                ? "مرحلة"
                : "مراحل"}
            </div>
          </div>

          {/* ================================================= */}
          {/* STAGE LIST */}
          {/* ================================================= */}

          <div style={styles.stagesList}>
            {stages.map((stage, index) => (
              <div
                key={index}
                style={styles.stageCard}
              >
                {/* STAGE HEADER */}

                <div style={styles.stageHeader}>
                  <div
                    style={styles.stageNumber}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={styles.stageTitle}
                  >
                    المرحلة {index + 1}
                  </div>

                  {stages.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeStage(index)
                      }
                      style={styles.deleteStage}
                      title="حذف المرحلة"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                {/* STAGE TITLE */}

                <div style={styles.field}>
                  <label style={styles.label}>
                    اسم المرحلة
                    <span
                      style={styles.required}
                    >
                      *
                    </span>
                  </label>

                  <input
                    style={styles.input}
                    placeholder="مثال: جمع البيانات"
                    value={stage.title}
                    onChange={(e) =>
                      updateStage(
                        index,
                        "title",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* STAGE DESCRIPTION */}

                <div style={styles.field}>
                  <label style={styles.label}>
                    وصف المرحلة
                  </label>

                  <textarea
                    style={{
                      ...styles.textarea,
                      minHeight: "80px",
                    }}
                    placeholder="أدخل وصف المرحلة"
                    value={stage.description}
                    onChange={(e) =>
                      updateStage(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* STAGE DATE */}

                <div style={styles.field}>
                  <label style={styles.label}>
                    تاريخ استحقاق المرحلة
                    <span
                      style={styles.required}
                    >
                      *
                    </span>
                  </label>

                  <div style={styles.dateWrapper}>
                    <FaCalendarAlt
                      style={styles.dateIcon}
                    />

                    <input
                      type="date"
                      style={styles.dateInput}
                      value={stage.due_date}
                      min={getToday()}
                      max={dueDate || undefined}
                      onChange={(e) =>
                        updateStage(
                          index,
                          "due_date",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD STAGE */}

          <button
            type="button"
            style={styles.addStageButton}
            onClick={addStage}
          >
            <FaPlus />

            <span>إضافة مرحلة جديدة</span>
          </button>
        </div>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <div style={styles.summary}>
          <div style={styles.summaryIcon}>
            <FaLayerGroup />
          </div>

          <div style={styles.summaryText}>
            <strong>
              {stages.length}{" "}
              {stages.length === 1
                ? "مرحلة"
                : "مراحل"}
            </strong>

            <span>
              يجب إكمال جميع المراحل حتى تصبح
              المهمة مكتملة.
            </span>
          </div>
        </div>

        {/* ================================================= */}
        {/* SAVE */}
        {/* ================================================= */}

        <button
          style={{
            ...styles.button,
            ...(saving
              ? styles.buttonDisabled
              : {}),
          }}
          onClick={save}
          disabled={saving}
        >
          {saving ? (
            <>
              <span style={styles.spinner}></span>

              جاري الحفظ...
            </>
          ) : (
            <>
              <FaSave />

              حفظ المهمة
            </>
          )}
        </button>
      </div>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      {modal.open && (
        <div
          style={styles.overlay}
          onClick={closeModal}
        >
          <div
            style={styles.modal}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              style={styles.closeModal}
              onClick={closeModal}
            >
              <FaTimes />
            </button>

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

// =========================================================
// STYLES
// =========================================================

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    background:
      "linear-gradient(135deg, #eef4ff 0%, #f8fafc 45%, #eef2ff 100%)",
    fontFamily:
      "Cairo, Tahoma, sans-serif",
    boxSizing: "border-box",
  },

  card: {
    width: "720px",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "32px",
    borderRadius: "24px",
    background: "#ffffff",
    boxShadow:
      "0 20px 60px rgba(30, 41, 59, 0.12)",
    border:
      "1px solid rgba(226,232,240,0.9)",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
  },

  headerIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    boxShadow:
      "0 10px 25px rgba(59,130,246,0.25)",
    flexShrink: 0,
  },

  heading: {
    margin: 0,
    color: "#172033",
    fontSize: "24px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  section: {
    marginBottom: "25px",
    padding: "22px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#1e3a8a",
    fontSize: "16px",
    fontWeight: "800",
  },

  stagesHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  stageCount: {
    padding: "5px 11px",
    borderRadius: "20px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "700",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "17px",
  },

  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: "700",
  },

  required: {
    color: "#ef4444",
    marginRight: "4px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: "11px",
    border: "1px solid #dbe3ef",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "14px",
    background: "#ffffff",
    color: "#172033",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 13px",
    borderRadius: "11px",
    border: "1px solid #dbe3ef",
    outline: "none",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "14px",
    background: "#ffffff",
    color: "#172033",
  },

  dateWrapper: {
    position: "relative",
    width: "100%",
  },

  dateIcon: {
    position: "absolute",
    right: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#3b82f6",
    pointerEvents: "none",
    zIndex: 1,
  },

  dateInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 42px 12px 13px",
    borderRadius: "11px",
    border: "1px solid #dbe3ef",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "14px",
    background: "#ffffff",
    color: "#172033",
  },

  dateHint: {
    color: "#64748b",
    fontSize: "11px",
  },

  stagesList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  stageCard: {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: "16px",
    padding: "18px",
    boxShadow:
      "0 5px 18px rgba(15,23,42,0.04)",
  },

  stageHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },

  stageNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "13px",
  },

  stageTitle: {
    flex: 1,
    color: "#172033",
    fontSize: "14px",
    fontWeight: "800",
  },

  deleteStage: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    border: "none",
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  addStageButton: {
    width: "100%",
    marginTop: "16px",
    padding: "12px",
    borderRadius: "11px",
    border: "1px dashed #93c5fd",
    background: "#eff6ff",
    color: "#2563eb",
    fontFamily: "inherit",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  summary: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    borderRadius: "14px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    marginBottom: "18px",
  },

  summaryIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#dbeafe",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    color: "#334155",
    fontSize: "12px",
  },

  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background:
      "linear-gradient(135deg, #3b82f6, #6366f1)",
    color: "#ffffff",
    fontWeight: "800",
    fontFamily: "inherit",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    boxShadow:
      "0 10px 25px rgba(59,130,246,0.2)",
  },

  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#ffffff",
    borderRadius: "50%",
    display: "inline-block",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.65)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modal: {
    position: "relative",
    width: "380px",
    maxWidth: "100%",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "30px",
    textAlign: "center",
    boxShadow:
      "0 25px 70px rgba(0,0,0,0.25)",
    fontFamily:
      "Cairo, Tahoma, sans-serif",
    boxSizing: "border-box",
  },

  closeModal: {
    position: "absolute",
    top: "12px",
    left: "12px",
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    margin: "0 auto 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "900",
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
    color: "#ffffff",
    fontFamily: "inherit",
    fontWeight: "bold",
    cursor: "pointer",
  },
};