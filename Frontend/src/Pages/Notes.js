import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

export default function Notes() {
  const nav = useNavigate();
  const { state } = useLocation();

  const evaluationId = state?.evaluationId;
  const employeeId = state?.employee_id;
  const employeeName = state?.name;
  const grade = state?.grade;
  const editMode = state?.editMode || false;

  const [notes, setNotes] = useState(state?.notes || "");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // تحميل الملاحظات الموجودة في حالة التعديل
  // =========================================================
  useEffect(() => {
    if (!editMode || !evaluationId) return;

    const loadEvaluation = async () => {
      try {
        setLoading(true);

        const response = await API.get(
          `/evaluations/${evaluationId}`
        );

        const data = response.data;

        if (data?.notes) {
          setNotes(data.notes);
        }
      } catch (err) {
        console.error(
          "Error loading evaluation notes:",
          err.response?.data || err
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvaluation();
  }, [editMode, evaluationId]);

  // =========================================================
  // حفظ الملاحظات
  // =========================================================
  const next = async () => {
    if (notes.trim() === "") {
      alert("يرجى إدخال بعض الملاحظات قبل المتابعة!");
      return;
    }

    if (!evaluationId) {
      alert("لا يوجد ID للتقييم!");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await API.put(
        `/evaluations/${evaluationId}/notes`,
        {
          notes: notes.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        editMode
          ? "تم تحديث الملاحظات بنجاح ✅"
          : "تم حفظ الملاحظات بنجاح ✅"
      );

      // =====================================================
      // الانتقال للطباعة مع الحفاظ على البيانات
      // =====================================================
      nav("/print", {
        state: {
          evaluationId,
          employee_id: employeeId,
          name: employeeName,
          grade,
          editMode,
        },
      });
    } catch (err) {
      console.error(
        "Error saving notes:",
        err.response?.data || err
      );

      console.error("Status:", err.response?.status);

      alert(
        err.response?.data?.message ||
          "حدث خطأ أثناء حفظ الملاحظات"
      );
    } finally {
      setLoading(false);
    }
  };

  const characterCount = notes.length;

  return (
    <div style={styles.page}>
      {/* =====================================================
          خلفيات خفيفة
      ===================================================== */}
      <div style={styles.softCircleTop} />
      <div style={styles.softCircleBottom} />

      <main style={styles.container}>
        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="notes-header" style={styles.header}>
          <div style={styles.headerIcon}>📝</div>

          <div style={styles.headerContent}>
            <div style={styles.badge}>
              {editMode ? "تعديل التقييم" : "الخطوة الأخيرة"}
            </div>

            <h1 style={styles.heading}>
              ملاحظات التقييم
            </h1>

            <p style={styles.subheading}>
              {editMode
                ? "قم بتعديل الملاحظات ثم احفظ التغييرات"
                : "أضف ملاحظاتك وتوصياتك قبل إصدار نموذج التقييم"}
            </p>
          </div>
        </header>

        {/* =====================================================
            EMPLOYEE INFO
        ===================================================== */}
        {(employeeName || employeeId || grade) && (
          <section
            className="employee-card"
            style={styles.employeeCard}
          >
            <div style={styles.employeeIcon}>👤</div>

            <div style={styles.employeeInfo}>
              <span style={styles.label}>
                الموظف محل التقييم
              </span>

              <strong style={styles.employeeName}>
                {employeeName ||
                  `الموظف رقم ${employeeId}`}
              </strong>

              {employeeId && (
                <span style={styles.employeeId}>
                  الرقم الوظيفي: {employeeId}
                </span>
              )}
            </div>

            {grade && (
              <div style={styles.gradeBadge}>
                ⭐ {grade}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            EDIT MODE NOTICE
        ===================================================== */}
        {editMode && (
          <div style={styles.editNotice}>
            <div style={styles.editNoticeIcon}>✏️</div>

            <div>
              <strong style={styles.editNoticeTitle}>
                وضع تعديل التقييم
              </strong>

              <p style={styles.editNoticeText}>
                أنت تقوم بتعديل تقييم سابق. بعد حفظ
                الملاحظات سيتم تحديث التقييم الحالي
                بدلًا من إنشاء تقييم جديد.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            NOTES CARD
        ===================================================== */}
        <section className="notes-card" style={styles.notesCard}>
          <div
            className="notes-header-row"
            style={styles.notesHeader}
          >
            <div style={styles.notesTitleWrapper}>
              <div style={styles.notesIcon}>✍️</div>

              <div>
                <h2 style={styles.notesTitle}>
                  ملاحظات المسؤول
                </h2>

                <p style={styles.notesSubtitle}>
                  اكتب الملاحظات المتعلقة بأداء الموظف
                </p>
              </div>
            </div>

            <div style={styles.requiredBadge}>
              مطلوب
            </div>
          </div>

          {/* ===================================================
              TEXTAREA
          =================================================== */}
          <div style={styles.textareaWrapper}>
            <textarea
              rows="10"
              style={{
                ...styles.textarea,
                opacity: loading ? 0.7 : 1,
              }}
              placeholder={`اكتب ملاحظاتك هنا...

مثال:

- نقاط القوة لدى الموظف
- الجوانب التي تحتاج إلى تطوير
- التوصيات المستقبلية
- أي ملاحظات إضافية مهمة`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />

            <div style={styles.textareaFooter}>
              <span style={styles.hint}>
                💡 حاول أن تكون الملاحظات واضحة ومحددة
              </span>

              <span
                style={{
                  ...styles.counter,
                  color:
                    characterCount > 0
                      ? "#2563eb"
                      : "#94a3b8",
                }}
              >
                {characterCount} حرف
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            INFO BOX
        ===================================================== */}
        <div style={styles.infoBox}>
          <div style={styles.infoIcon}>ℹ️</div>

          <div>
            <strong style={styles.infoTitle}>
              قبل المتابعة
            </strong>

            <p style={styles.infoText}>
              {editMode
                ? "بعد حفظ الملاحظات سيتم تحديث التقييم الحالي، ثم الانتقال إلى صفحة الطباعة."
                : "بعد حفظ الملاحظات سيتم الانتقال إلى صفحة الطباعة لإصدار نموذج التقييم النهائي."}
            </p>
          </div>
        </div>

        {/* =====================================================
            ACTIONS
        ===================================================== */}
        <div className="notes-actions" style={styles.actions}>
          <button
            type="button"
            style={{
              ...styles.button,
              opacity: loading ? 0.65 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
            onClick={next}
            disabled={loading}
          >
            <span style={styles.buttonIcon}>
              {loading ? "⏳" : editMode ? "💾" : "🖨️"}
            </span>

            <span>
              {loading
                ? "جارٍ الحفظ..."
                : editMode
                ? "حفظ التعديلات والانتقال للطباعة"
                : "حفظ الملاحظات والانتقال للطباعة"}
            </span>

            {!loading && (
              <span style={styles.buttonArrow}>
                ←
              </span>
            )}
          </button>

          <button
            type="button"
            style={styles.backButton}
            onClick={() => nav(-1)}
            disabled={loading}
          >
            <span>→</span>
            الرجوع للتقييم
          </button>
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <footer style={styles.footer}>
          <span>🔒</span>
          جميع البيانات محفوظة ضمن نظام التقييم
        </footer>
      </main>

      {/* =====================================================
          RESPONSIVE
      ===================================================== */}
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: "Cairo", "Tajawal", Arial, sans-serif;
            background: #f5f7fb;
          }

          button,
          textarea {
            font-family: inherit;
          }

          textarea::placeholder {
            color: #94a3b8;
            opacity: 1;
          }

          textarea:focus {
            border-color: #93c5fd !important;

            box-shadow:
              0 0 0 4px rgba(59, 130, 246, 0.08),
              0 8px 25px rgba(15, 23, 42, 0.06);

            background: #ffffff !important;
          }

          button:not(:disabled):hover {
            transform: translateY(-2px);
          }

          @media (max-width: 650px) {
            .notes-page-container {
              padding: 20px 14px !important;
            }

            .notes-header {
              gap: 13px !important;
            }

            .notes-header h1 {
              font-size: 23px !important;
            }

            .notes-card {
              padding: 20px !important;
            }

            .notes-header-row {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .notes-actions {
              gap: 10px !important;
            }
          }

          @media (max-width: 500px) {
            .employee-card {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .employee-card > div:last-child {
              width: 100%;
            }

            .notes-header {
              align-items: flex-start !important;
            }

            .notes-header > div:last-child {
              display: none;
            }

            .textarea-footer {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {
  // =========================================================
  // PAGE
  // =========================================================
  page: {
    minHeight: "100vh",
    padding: "40px 20px 70px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",

    background:
      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eef4ff 100%)",

    position: "relative",
    overflow: "hidden",

    direction: "rtl",
    color: "#172033",

    fontFamily:
      "'Cairo', 'Tajawal', Arial, sans-serif",
  },

  softCircleTop: {
    position: "fixed",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.08)",
    filter: "blur(70px)",
    top: "-180px",
    right: "-130px",
    pointerEvents: "none",
  },

  softCircleBottom: {
    position: "fixed",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(99,102,241,0.06)",
    filter: "blur(70px)",
    bottom: "-160px",
    left: "-120px",
    pointerEvents: "none",
  },

  container: {
    width: "100%",
    maxWidth: "850px",
    position: "relative",
    zIndex: 2,
  },

  // =========================================================
  // HEADER
  // =========================================================
  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "24px",
  },

  headerIcon: {
    width: "64px",
    height: "64px",
    minWidth: "64px",
    borderRadius: "18px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "28px",

    background:
      "linear-gradient(135deg, #dbeafe, #e0e7ff)",

    border: "1px solid #bfdbfe",

    boxShadow:
      "0 10px 25px rgba(59,130,246,0.10)",
  },

  headerContent: {
    flex: 1,
  },

  badge: {
    display: "inline-flex",
    padding: "5px 12px",
    borderRadius: "30px",

    fontSize: "11px",
    fontWeight: "800",

    color: "#2563eb",

    background: "#eff6ff",
    border: "1px solid #dbeafe",

    marginBottom: "5px",
  },

  heading: {
    margin: 0,
    color: "#172033",
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subheading: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  // =========================================================
  // EMPLOYEE
  // =========================================================
  employeeCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",

    padding: "17px 20px",
    marginBottom: "15px",

    borderRadius: "18px",

    background: "#ffffff",

    border: "1px solid #e2e8f0",

    boxShadow:
      "0 8px 25px rgba(15,23,42,0.05)",
  },

  employeeIcon: {
    width: "50px",
    height: "50px",
    minWidth: "50px",

    borderRadius: "15px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "22px",

    background: "#eff6ff",
    border: "1px solid #dbeafe",
  },

  employeeInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  label: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  employeeName: {
    color: "#172033",
    fontSize: "17px",
    fontWeight: "800",
  },

  employeeId: {
    color: "#64748b",
    fontSize: "11px",
  },

  gradeBadge: {
    padding: "8px 13px",
    borderRadius: "10px",

    color: "#15803d",

    background: "#f0fdf4",
    border: "1px solid #bbf7d0",

    fontSize: "12px",
    fontWeight: "800",
  },

  // =========================================================
  // EDIT NOTICE
  // =========================================================
  editNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",

    padding: "14px 16px",
    marginBottom: "15px",

    borderRadius: "15px",

    background: "#fffbeb",
    border: "1px solid #fde68a",

    boxShadow:
      "0 6px 18px rgba(245,158,11,0.05)",
  },

  editNoticeIcon: {
    width: "34px",
    height: "34px",
    minWidth: "34px",

    borderRadius: "10px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background: "#fef3c7",
    fontSize: "15px",
  },

  editNoticeTitle: {
    display: "block",
    color: "#92400e",
    fontSize: "12px",
    marginBottom: "3px",
  },

  editNoticeText: {
    margin: 0,
    color: "#78716c",
    fontSize: "11px",
    lineHeight: "1.8",
  },

  // =========================================================
  // NOTES CARD
  // =========================================================
  notesCard: {
    padding: "25px",

    borderRadius: "22px",

    background: "#ffffff",

    border: "1px solid #e2e8f0",

    boxShadow:
      "0 12px 40px rgba(15,23,42,0.06)",

    marginBottom: "15px",
  },

  notesHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    gap: "15px",
    marginBottom: "20px",

    paddingBottom: "18px",

    borderBottom: "1px solid #f1f5f9",
  },

  notesTitleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  notesIcon: {
    width: "45px",
    height: "45px",
    minWidth: "45px",

    borderRadius: "13px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "20px",

    background:
      "linear-gradient(135deg, #eff6ff, #eef2ff)",

    border: "1px solid #dbeafe",
  },

  notesTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
    color: "#172033",
  },

  notesSubtitle: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  requiredBadge: {
    padding: "6px 11px",
    borderRadius: "20px",

    color: "#b45309",

    background: "#fffbeb",
    border: "1px solid #fde68a",

    fontSize: "10px",
    fontWeight: "800",
  },

  // =========================================================
  // TEXTAREA
  // =========================================================
  textareaWrapper: {
    position: "relative",
  },

  textarea: {
    width: "100%",
    minHeight: "260px",

    padding: "17px",

    borderRadius: "15px",

    border: "1px solid #dbe3ee",

    outline: "none",
    resize: "vertical",

    background: "#f8fafc",

    color: "#172033",

    fontSize: "14px",
    lineHeight: "2",

    transition: "all .2s ease",

    direction: "rtl",

    fontFamily:
      "'Cairo', 'Tajawal', Arial, sans-serif",

    boxShadow:
      "inset 0 1px 2px rgba(15,23,42,0.02)",
  },

  textareaFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    gap: "10px",

    marginTop: "9px",
  },

  hint: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  counter: {
    fontSize: "11px",
    fontWeight: "700",
    direction: "rtl",
  },

  // =========================================================
  // INFO
  // =========================================================
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",

    padding: "15px 17px",
    marginBottom: "18px",

    borderRadius: "15px",

    background: "#eff6ff",
    border: "1px solid #dbeafe",
  },

  infoIcon: {
    width: "27px",
    height: "27px",
    minWidth: "27px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "8px",

    background: "#dbeafe",

    fontSize: "14px",
  },

  infoTitle: {
    display: "block",
    color: "#1d4ed8",
    fontSize: "12px",
    marginBottom: "3px",
  },

  infoText: {
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
    lineHeight: "1.8",
  },

  // =========================================================
  // ACTIONS
  // =========================================================
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  button: {
    width: "100%",
    minHeight: "56px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "10px",

    border: "none",
    borderRadius: "15px",

    color: "#ffffff",

    fontSize: "14px",
    fontWeight: "800",

    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",

    boxShadow:
      "0 10px 25px rgba(37,99,235,0.18)",

    transition: "all .2s ease",

    fontFamily:
      "'Cairo', 'Tajawal', Arial, sans-serif",
  },

  buttonIcon: {
    fontSize: "18px",
  },

  buttonArrow: {
    fontSize: "19px",
    marginRight: "5px",
  },

  backButton: {
    width: "100%",
    minHeight: "47px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    gap: "8px",

    border: "1px solid #e2e8f0",
    borderRadius: "14px",

    color: "#64748b",

    background: "#ffffff",

    fontSize: "12px",
    fontWeight: "700",

    cursor: "pointer",

    transition: "all .2s ease",

    fontFamily:
      "'Cairo', 'Tajawal', Arial, sans-serif",
  },

  // =========================================================
  // FOOTER
  // =========================================================
  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    gap: "6px",

    marginTop: "17px",

    color: "#94a3b8",

    fontSize: "10px",
  },
};