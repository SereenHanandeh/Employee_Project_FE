import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import API from "../api/api";

export default function Result() {
  const nav = useNavigate();
  const { state } = useLocation();

  const [evaluationId, setEvaluationId] = useState(
    state?.evaluationId || null
  );

  const [loading, setLoading] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);

  const [grade, setGrade] = useState(state?.grade || "");
  const [error, setError] = useState("");
  const [employeeName, setEmployeeName] = useState(state?.name || "");

  const {
    employee_id,
    name,
    performance,
    personality,
    relations,
    from_date,
    to_date,
    editMode,
  } = state || {};

  // =========================================================
  // حساب المجاميع
  // =========================================================

  const performanceTotal = useMemo(() => {
    return Object.values(performance || {}).reduce(
      (a, b) => a + Number(b || 0),
      0
    );
  }, [performance]);

  const personalityTotal = useMemo(() => {
    return Object.values(personality || {}).reduce(
      (a, b) => a + Number(b || 0),
      0
    );
  }, [personality]);

  const relationsTotal = useMemo(() => {
    return Object.values(relations || {}).reduce(
      (a, b) => a + Number(b || 0),
      0
    );
  }, [relations]);

  const totalScore =
    performanceTotal + personalityTotal + relationsTotal;

  // =========================================================
  // الحدود القصوى
  // =========================================================

  const maxPerformance = 76;
  const maxPersonality = 19;
  const maxRelations = 9;
  const maxTotal = 104;

  const percentage = Math.round(
    (totalScore / maxTotal) * 100
  );

  // =========================================================
  // حساب التقدير محليًا
  // =========================================================

  const calculatedGrade = useMemo(() => {
    if (percentage >= 90) return "ممتاز";
    if (percentage >= 75) return "جيد جدًا";
    if (percentage >= 60) return "جيد";
    if (percentage >= 50) return "مقبول";
    return "ضعيف";
  }, [percentage]);

  // =========================================================
  // جلب بيانات التقييم في حالة التعديل
  // =========================================================

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!editMode || !evaluationId) return;

      try {
        setLoadingEvaluation(true);
        setError("");

        const res = await API.get(
          `/evaluations/${evaluationId}`
        );

        const evaluation = res.data?.evaluation || res.data;

        if (evaluation?.grade) {
          setGrade(evaluation.grade);
        }

        if (!employeeName) {
          const fetchedName =
            evaluation?.name ||
            evaluation?.employee_name ||
            evaluation?.full_name ||
            "";

          if (fetchedName) {
            setEmployeeName(fetchedName);
          }
        }
      } catch (err) {
        console.error(
          "Error loading evaluation:",
          err
        );
      } finally {
        setLoadingEvaluation(false);
      }
    };

    loadEvaluation();
  }, [editMode, evaluationId, employeeName]);

  // =========================================================
  // جلب اسم الموظف
  // =========================================================

  useEffect(() => {
    const getEmployee = async () => {
      if (!employee_id) {
        setLoadingEmployee(false);
        return;
      }

      if (name && name.trim()) {
        setEmployeeName(name);
        setLoadingEmployee(false);
        return;
      }

      try {
        setLoadingEmployee(true);

        const res = await API.get("/employees");

        const employees = Array.isArray(res.data)
          ? res.data
          : res.data?.employees || [];

        const employee = employees.find(
          (emp) =>
            String(emp.id) === String(employee_id) ||
            String(emp.employee_id) === String(employee_id)
        );

        if (employee) {
          setEmployeeName(
            employee.name ||
              employee.full_name ||
              employee.employee_name ||
              `${employee.first_name || ""} ${
                employee.last_name || ""
              }`.trim()
          );
        } else {
          setEmployeeName(
            `الموظف رقم ${employee_id}`
          );
        }
      } catch (err) {
        console.error(
          "Error fetching employee:",
          err
        );

        setEmployeeName(
          name || `الموظف رقم ${employee_id}`
        );
      } finally {
        setLoadingEmployee(false);
      }
    };

    getEmployee();
  }, [employee_id, name]);

  // =========================================================
  // التحقق من البيانات
  // =========================================================

  useEffect(() => {
    if (
      !employee_id ||
      !performance ||
      !personality ||
      !relations
    ) {
      alert(
        "البيانات غير مكتملة، سيتم الرجوع"
      );

      nav("/");
    }
  }, [
    employee_id,
    performance,
    personality,
    relations,
    nav,
  ]);

  // =========================================================
  // حفظ / تحديث التقييم
  // =========================================================

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        employee_id,
        performance,
        personality,
        relations,
        from_date,
        to_date,
        notes: "",
      };

      let res;

      // =====================================================
      // تعديل تقييم موجود
      // =====================================================

      if (editMode && evaluationId) {
        res = await API.put(
          `/evaluations/${evaluationId}`,
          payload
        );
      }

      // =====================================================
      // إنشاء تقييم جديد
      // =====================================================

      else {
        res = await API.post(
          "/evaluations",
          payload
        );
      }

      const savedEvaluation =
        res.data?.evaluation || res.data;

      const savedId =
        savedEvaluation?.evaluation_id ||
        res.data?.evaluation_id ||
        evaluationId;

      const savedGrade =
        savedEvaluation?.grade ||
        res.data?.grade ||
        calculatedGrade;

      setEvaluationId(savedId);
      setGrade(savedGrade);

      alert(
        editMode
          ? `تم تحديث التقييم بنجاح! التقدير: ${savedGrade}`
          : `تم حفظ التقييم بنجاح! التقدير: ${savedGrade}`
      );
    } catch (err) {
      console.error(
        "Error saving evaluation:",
        err
      );

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendMessage ||
          "حدث خطأ أثناء حفظ التقييم"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // الانتقال للملاحظات
  // =========================================================

  const goToNotes = () => {
    if (!evaluationId) {
      alert(
        "يجب حفظ التقييم أولاً!"
      );
      return;
    }

    nav("/notes", {
      state: {
        evaluationId,
        employee_id,
        name: employeeName,
        grade: grade || calculatedGrade,
        editMode: !!editMode,
      },
    });
  };

  // =========================================================
  // الرجوع للتعديل
  // =========================================================

  const goBackToEdit = () => {
    nav(-1);
  };

  // =========================================================
  // نسبة المحاور
  // =========================================================

  const performancePercentage = Math.round(
    (performanceTotal / maxPerformance) * 100
  );

  const personalityPercentage = Math.round(
    (personalityTotal / maxPersonality) * 100
  );

  const relationsPercentage = Math.round(
    (relationsTotal / maxRelations) * 100
  );

  // =========================================================
  // لون التقدير
  // =========================================================

  const getGradeStyle = () => {
    const currentGrade =
      grade || calculatedGrade;

    if (currentGrade === "ممتاز") {
      return {
        background: "#ecfdf5",
        border: "#a7f3d0",
        color: "#047857",
        iconBackground: "#d1fae5",
      };
    }

    if (
      currentGrade === "جيد جدًا" ||
      currentGrade === "جيد جدا"
    ) {
      return {
        background: "#eff6ff",
        border: "#bfdbfe",
        color: "#1d4ed8",
        iconBackground: "#dbeafe",
      };
    }

    if (currentGrade === "جيد") {
      return {
        background: "#f5f3ff",
        border: "#ddd6fe",
        color: "#6d28d9",
        iconBackground: "#ede9fe",
      };
    }

    if (currentGrade === "مقبول") {
      return {
        background: "#fffbeb",
        border: "#fde68a",
        color: "#b45309",
        iconBackground: "#fef3c7",
      };
    }

    return {
      background: "#fef2f2",
      border: "#fecaca",
      color: "#b91c1c",
      iconBackground: "#fee2e2",
    };
  };

  const currentGrade =
    grade || calculatedGrade;

  const gradeStyle = getGradeStyle();

  // =========================================================
  // الواجهة
  // =========================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div style={styles.header}>
          <div style={styles.headerIcon}>
            📋
          </div>

          <div style={{ flex: 1 }}>
            <div style={styles.badge}>
              {editMode
                ? "تعديل التقييم"
                : "المرحلة النهائية"}
            </div>

            <h1 style={styles.heading}>
              مراجعة وحفظ التقييم
            </h1>

            <p style={styles.subheading}>
              راجع نتائج تقييم الموظف قبل اعتماد
              {editMode
                ? " التعديلات"
                : " التقييم"}
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* EDIT NOTICE */}
        {/* ================================================= */}

        {editMode && (
          <div style={styles.editNotice}>
            <div style={styles.editNoticeIcon}>
              ✏️
            </div>

            <div>
              <strong>
                أنت الآن في وضع تعديل التقييم
              </strong>

              <p>
                راجع الدرجات ثم اضغط على
                «تحديث التقييم» لحفظ التغييرات.
              </p>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* EMPLOYEE CARD */}
        {/* ================================================= */}

        <div style={styles.employeeCard}>
          <div style={styles.employeeIcon}>
            👤
          </div>

          <div style={styles.employeeInfo}>
            <span style={styles.employeeLabel}>
              الموظف محل التقييم
            </span>

            {loadingEmployee ? (
              <div style={styles.loadingName}>
                جاري تحميل بيانات الموظف...
              </div>
            ) : (
              <strong style={styles.employeeName}>
                {employeeName ||
                  "لم يتم تحديد الموظف"}
              </strong>
            )}

            <span style={styles.employeeId}>
              الرقم الوظيفي: {employee_id}
            </span>
          </div>

          <div style={styles.verified}>
            ✓
          </div>
        </div>

        {/* ================================================= */}
        {/* PERIOD */}
        {/* ================================================= */}

        <div style={styles.periodCard}>
          <div style={styles.periodItem}>
            <span style={styles.periodIcon}>
              📅
            </span>

            <div>
              <span style={styles.smallLabel}>
                تاريخ بداية التقييم
              </span>

              <strong style={styles.dateValue}>
                {from_date || "-"}
              </strong>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.periodItem}>
            <span style={styles.periodIcon}>
              📅
            </span>

            <div>
              <span style={styles.smallLabel}>
                تاريخ نهاية التقييم
              </span>

              <strong style={styles.dateValue}>
                {to_date || "-"}
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* SCORE HEADER */}
        {/* ================================================= */}

        <div style={styles.scoreHeader}>
          <div>
            <span style={styles.scoreHeaderTitle}>
              ملخص نتيجة التقييم
            </span>

            <p style={styles.scoreHeaderSubtitle}>
              مجموع درجات جميع محاور التقييم
            </p>
          </div>

          <div style={styles.totalCircle}>
            <strong>
              {totalScore}
            </strong>

            <span>
              / {maxTotal}
            </span>
          </div>
        </div>

        {/* ================================================= */}
        {/* SCORE CARDS */}
        {/* ================================================= */}

        <div
          className="result-score-grid"
          style={styles.scoresGrid}
        >
          {/* الأداء */}

          <div style={styles.scoreCard}>
            <div style={styles.scoreTop}>
              <div
                style={{
                  ...styles.scoreIcon,
                  background:
                    "linear-gradient(135deg, #dbeafe, #e0f2fe)",
                }}
              >
                📊
              </div>

              <div style={styles.scoreTitleBox}>
                <span style={styles.scoreTitle}>
                  الأداء الوظيفي
                </span>

                <span style={styles.scoreMax}>
                  الحد الأقصى {maxPerformance}
                </span>
              </div>

              <strong style={styles.scoreNumber}>
                {performanceTotal}
              </strong>
            </div>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(
                    performancePercentage,
                    100
                  )}%`,
                  background:
                    "linear-gradient(90deg, #38bdf8, #2563eb)",
                }}
              />
            </div>

            <div style={styles.scoreFooter}>
              <span>نسبة الإنجاز</span>

              <strong>
                {performancePercentage}%
              </strong>
            </div>
          </div>

          {/* الشخصية */}

          <div style={styles.scoreCard}>
            <div style={styles.scoreTop}>
              <div
                style={{
                  ...styles.scoreIcon,
                  background:
                    "linear-gradient(135deg, #ede9fe, #e0e7ff)",
                }}
              >
                🧠
              </div>

              <div style={styles.scoreTitleBox}>
                <span style={styles.scoreTitle}>
                  الصفات الشخصية
                </span>

                <span style={styles.scoreMax}>
                  الحد الأقصى {maxPersonality}
                </span>
              </div>

              <strong style={styles.scoreNumber}>
                {personalityTotal}
              </strong>
            </div>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(
                    personalityPercentage,
                    100
                  )}%`,
                  background:
                    "linear-gradient(90deg, #a78bfa, #6366f1)",
                }}
              />
            </div>

            <div style={styles.scoreFooter}>
              <span>نسبة الإنجاز</span>

              <strong>
                {personalityPercentage}%
              </strong>
            </div>
          </div>

          {/* العلاقات */}

          <div style={styles.scoreCard}>
            <div style={styles.scoreTop}>
              <div
                style={{
                  ...styles.scoreIcon,
                  background:
                    "linear-gradient(135deg, #cffafe, #dbeafe)",
                }}
              >
                🤝
              </div>

              <div style={styles.scoreTitleBox}>
                <span style={styles.scoreTitle}>
                  العلاقات الوظيفية
                </span>

                <span style={styles.scoreMax}>
                  الحد الأقصى {maxRelations}
                </span>
              </div>

              <strong style={styles.scoreNumber}>
                {relationsTotal}
              </strong>
            </div>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(
                    relationsPercentage,
                    100
                  )}%`,
                  background:
                    "linear-gradient(90deg, #22d3ee, #0891b2)",
                }}
              />
            </div>

            <div style={styles.scoreFooter}>
              <span>نسبة الإنجاز</span>

              <strong>
                {relationsPercentage}%
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* TOTAL RESULT */}
        {/* ================================================= */}

        <div style={styles.resultCard}>
          <div style={styles.resultLeft}>
            <div style={styles.resultIcon}>
              🏆
            </div>

            <div>
              <span style={styles.resultLabel}>
                النتيجة الإجمالية
              </span>

              <p style={styles.resultDescription}>
                مجموع الأداء والصفات الشخصية
                والعلاقات الوظيفية
              </p>
            </div>
          </div>

          <div style={styles.resultRight}>
            <strong>
              {totalScore}
            </strong>

            <span>
              / {maxTotal}
            </span>

            <div style={styles.percentageBadge}>
              {percentage}%
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* GRADE */}
        {/* ================================================= */}

        <div
          style={{
            ...styles.gradeSection,
            background: gradeStyle.background,
            border: `1px solid ${gradeStyle.border}`,
          }}
        >
          <div
            style={{
              ...styles.gradeIcon,
              background:
                gradeStyle.iconBackground,
            }}
          >
            ⭐
          </div>

          <div style={styles.gradeContent}>
            <span
              style={{
                color: "#64748b",
              }}
            >
              التقدير النهائي
            </span>

            <strong
              style={{
                color: gradeStyle.color,
              }}
            >
              {currentGrade}
            </strong>

            <small>
              {editMode
                ? "سيتم اعتماد التقدير الجديد عند تحديث التقييم"
                : evaluationId
                ? "تم حفظ التقييم بنجاح ويمكنك الآن إضافة الملاحظات"
                : "التقدير محسوب بناءً على النسبة الإجمالية"}
            </small>
          </div>

          <div
            style={{
              ...styles.successCheck,
              color: gradeStyle.color,
              background:
                gradeStyle.iconBackground,
            }}
          >
            ✓
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* LOADING EVALUATION */}
        {/* ================================================= */}

        {loadingEvaluation && (
          <div style={styles.loadingBox}>
            جاري تحميل بيانات التقييم...
          </div>
        )}

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div style={styles.actions}>
          {/* حفظ أو تحديث */}

          {!evaluationId || editMode ? (
            <button
              onClick={handleSubmit}
              style={{
                ...styles.saveButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
              disabled={loading}
            >
              <span>
                {loading ? "⏳" : "💾"}
              </span>

              {loading
                ? editMode
                  ? "جارٍ تحديث التقييم..."
                  : "جارٍ حفظ التقييم..."
                : editMode
                ? "تحديث واعتماد التقييم"
                : "اعتماد وحفظ التقييم"}
            </button>
          ) : null}

          {/* الملاحظات */}

          {evaluationId && (
            <button
              onClick={goToNotes}
              style={styles.notesButton}
            >
              <span>📝</span>

              إضافة ملاحظات

              <span style={styles.arrow}>
                ←
              </span>
            </button>
          )}

          {/* الرجوع */}

          <button
            style={styles.backButton}
            onClick={goBackToEdit}
            disabled={loading}
          >
            <span>→</span>

            تعديل الدرجات
          </button>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div style={styles.footer}>
          <span>🔒</span>

          تأكد من صحة البيانات قبل اعتماد
          التقييم
        </div>
      </div>

      {/* =================================================== */}
      {/* RESPONSIVE CSS */}
      {/* =================================================== */}

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

          button {
            font-family: inherit;
          }

          button:not(:disabled) {
            transition: all .2s ease;
          }

          button:not(:disabled):hover {
            transform: translateY(-2px);
          }

          @media (max-width: 850px) {
            .result-page-container {
              padding: 25px 15px !important;
            }
          }

          @media (max-width: 700px) {
            .result-score-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            .result-period-card {
              grid-template-columns: 1fr !important;
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
    background:
      "linear-gradient(180deg, #f8fafc 0%, #f5f7fb 50%, #eef2f7 100%)",
    direction: "rtl",
    color: "#172033",
  },

  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "25px",
  },

  headerIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    background:
      "linear-gradient(135deg, #dbeafe, #e0e7ff)",
    border: "1px solid #dbe3f0",
    boxShadow:
      "0 10px 25px rgba(30, 64, 175, 0.08)",
    flexShrink: 0,
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
    marginBottom: "6px",
  },

  heading: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#172033",
    letterSpacing: "-.5px",
  },

  subheading: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  // =========================================================
  // EDIT NOTICE
  // =========================================================

  editNotice: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px 18px",
    marginBottom: "15px",
    borderRadius: "16px",
    background: "#fffaf0",
    border: "1px solid #fde7b2",
    color: "#92400e",
  },

  editNoticeIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fef3c7",
    fontSize: "18px",
    flexShrink: 0,
  },

  // =========================================================
  // EMPLOYEE
  // =========================================================

  employeeCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "15px",
    background: "#ffffff",
    border: "1px solid #e5eaf1",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.05)",
  },

  employeeIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    background:
      "linear-gradient(135deg, #eff6ff, #eef2ff)",
    border: "1px solid #dbeafe",
    flexShrink: 0,
  },

  employeeInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    flex: 1,
  },

  employeeLabel: {
    color: "#64748b",
    fontSize: "12px",
  },

  employeeName: {
    color: "#172033",
    fontSize: "20px",
    fontWeight: "800",
  },

  employeeId: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  loadingName: {
    color: "#64748b",
    fontSize: "15px",
  },

  verified: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#059669",
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    fontWeight: "800",
  },

  // =========================================================
  // PERIOD
  // =========================================================

  periodCard: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "20px",
    padding: "18px 22px",
    marginBottom: "25px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e5eaf1",
    boxShadow:
      "0 8px 22px rgba(15, 23, 42, 0.04)",
  },

  periodItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  periodIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    fontSize: "18px",
  },

  smallLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
    marginBottom: "2px",
  },

  dateValue: {
    color: "#334155",
    fontSize: "14px",
  },

  divider: {
    width: "1px",
    height: "38px",
    background: "#e2e8f0",
  },

  // =========================================================
  // SCORE HEADER
  // =========================================================

  scoreHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "15px",
  },

  scoreHeaderTitle: {
    fontSize: "19px",
    fontWeight: "800",
    color: "#172033",
  },

  scoreHeaderSubtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  totalCircle: {
    minWidth: "92px",
    height: "68px",
    padding: "0 15px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: "3px",
    background:
      "linear-gradient(135deg, #eff6ff, #eef2ff)",
    border: "1px solid #dbe4f2",
    color: "#1e40af",
  },

  // =========================================================
  // SCORE CARDS
  // =========================================================

  scoresGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  scoreCard: {
    padding: "19px",
    borderRadius: "19px",
    background: "#ffffff",
    border: "1px solid #e5eaf1",
    boxShadow:
      "0 8px 25px rgba(15, 23, 42, 0.045)",
  },

  scoreTop: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  scoreIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },

  scoreTitleBox: {
    flex: 1,
    minWidth: 0,
  },

  scoreTitle: {
    display: "block",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "800",
  },

  scoreMax: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    marginTop: "2px",
  },

  scoreNumber: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#172033",
  },

  progressBackground: {
    height: "7px",
    marginTop: "17px",
    borderRadius: "20px",
    overflow: "hidden",
    background: "#eef2f7",
  },

  progressFill: {
    height: "100%",
    borderRadius: "20px",
    transition: "width .5s ease",
  },

  scoreFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  // =========================================================
  // RESULT
  // =========================================================

  resultCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "22px",
    marginBottom: "18px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, #eff6ff, #f5f3ff)",
    border: "1px solid #dbe4f2",
    boxShadow:
      "0 10px 30px rgba(30, 64, 175, 0.06)",
  },

  resultLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  resultIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    background: "#fef3c7",
  },

  resultLabel: {
    display: "block",
    color: "#172033",
    fontSize: "16px",
    fontWeight: "800",
  },

  resultDescription: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  resultRight: {
    display: "flex",
    alignItems: "baseline",
    gap: "3px",
    direction: "ltr",
    color: "#172033",
  },

  percentageBadge: {
    marginRight: "10px",
    padding: "6px 10px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "800",
    color: "#2563eb",
    background: "#dbeafe",
  },

  // =========================================================
  // GRADE
  // =========================================================

  gradeSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    borderRadius: "19px",
    marginBottom: "15px",
  },

  gradeIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    flexShrink: 0,
  },

  gradeContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  successCheck: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    flexShrink: 0,
  },

  // =========================================================
  // ERROR
  // =========================================================

  error: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "13px 15px",
    borderRadius: "14px",
    marginBottom: "15px",
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    fontSize: "13px",
  },

  loadingBox: {
    textAlign: "center",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "12px",
    color: "#2563eb",
    background: "#eff6ff",
    fontSize: "13px",
  },

  // =========================================================
  // BUTTONS
  // =========================================================

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },

  saveButton: {
    width: "100%",
    minHeight: "55px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #2563eb, #4f46e5)",
    boxShadow:
      "0 12px 25px rgba(37, 99, 235, 0.18)",
    transition: "all .2s ease",
  },

  notesButton: {
    width: "100%",
    minHeight: "53px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "800",
    background:
      "linear-gradient(135deg, #059669, #0f766e)",
    boxShadow:
      "0 10px 22px rgba(5, 150, 105, 0.15)",
    transition: "all .2s ease",
  },

  arrow: {
    marginRight: "10px",
    fontSize: "18px",
  },

  backButton: {
    width: "100%",
    minHeight: "48px",
    border: "1px solid #dbe2ea",
    borderRadius: "14px",
    cursor: "pointer",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "700",
    background: "#ffffff",
    transition: "all .2s ease",
  },

  // =========================================================
  // FOOTER
  // =========================================================

  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "18px",
    color: "#94a3b8",
    fontSize: "11px",
  },
};