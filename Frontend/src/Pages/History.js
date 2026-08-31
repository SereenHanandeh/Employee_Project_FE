
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./History.css";

export default function History() {
  const nav = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("الكل");
  const [sortOrder, setSortOrder] = useState("newest");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // FETCH EVALUATIONS
  // =====================================================

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);

      const res = await API.get("/evaluations");

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch Evaluations Error:", err);

      alert(
        err?.response?.data?.message ||
          "فشل تحميل التقييمات"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const goToAddEvaluation = () => {
    nav("/step1");
  };

  const viewReport = (id) => {
    nav("/print", {
      state: {
        evaluationId: id,
      },
    });
  };

  // =====================================================
  // EDIT EVALUATION
  // =====================================================

  const editEvaluation = (id) => {
    if (!id) return;

    nav("/step1", {
      state: {
        evaluationId: id,
        editMode: true,
      },
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteOne = async (id) => {
    if (!id || deleting) return;

    try {
      setDeleting(true);

      await API.delete(`/evaluations/${id}`);

      setData((prev) =>
        prev.filter(
          (item) => item.evaluation_id !== id
        )
      );

      setDeleteId(null);
    } catch (err) {
      console.error("Delete Evaluation Error:", err);

      alert(
        err?.response?.data?.message ||
          "فشل حذف التقييم"
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // NORMALIZE GRADE
  // =====================================================

  const normalizeGrade = (grade) => {
    return String(grade || "")
      .replace(/ً/g, "")
      .replace(/أ/g, "ا")
      .replace(/إ/g, "ا")
      .replace(/آ/g, "ا")
      .replace(/\s+/g, " ")
      .trim();
  };

  // =====================================================
  // GRADE STYLE
  // =====================================================

  const gradeStyle = (grade) => {
    const value = normalizeGrade(grade);

    if (!value) {
      return {
        background: "rgba(148, 163, 184, 0.12)",
        color: "#94a3b8",
        border:
          "1px solid rgba(148, 163, 184, 0.18)",
      };
    }

    if (value.includes("ممتاز")) {
      return {
        background: "rgba(34, 197, 94, 0.12)",
        color: "#16a34a",
        border:
          "1px solid rgba(34, 197, 94, 0.22)",
      };
    }

    if (value.includes("جيد جدا")) {
      return {
        background: "rgba(59, 130, 246, 0.12)",
        color: "#2563eb",
        border:
          "1px solid rgba(59, 130, 246, 0.22)",
      };
    }

    if (value.includes("جيد")) {
      return {
        background: "rgba(245, 158, 11, 0.12)",
        color: "#d97706",
        border:
          "1px solid rgba(245, 158, 11, 0.22)",
      };
    }

    if (value.includes("مقبول")) {
      return {
        background: "rgba(249, 115, 22, 0.12)",
        color: "#ea580c",
        border:
          "1px solid rgba(249, 115, 22, 0.22)",
      };
    }

    return {
      background: "rgba(239, 68, 68, 0.12)",
      color: "#dc2626",
      border:
        "1px solid rgba(239, 68, 68, 0.22)",
    };
  };

  // =====================================================
  // SCORE COLOR
  // =====================================================

  const scoreColor = (total) => {
    const score = Number(total || 0);

    if (score >= 90) return "#16a34a";
    if (score >= 80) return "#2563eb";
    if (score >= 70) return "#d97706";
    if (score >= 60) return "#ea580c";

    return "#dc2626";
  };

  // =====================================================
  // FILTER + SEARCH + SORT
  // =====================================================

  const filteredData = useMemo(() => {
    let result = [...data];

    // SEARCH
    if (search.trim()) {
      const searchValue =
        search.trim().toLowerCase();

      result = result.filter((item) =>
        String(item.name || "")
          .toLowerCase()
          .includes(searchValue)
      );
    }

    // GRADE FILTER
    if (gradeFilter !== "الكل") {
      const filter = normalizeGrade(gradeFilter);

      result = result.filter((item) => {
        const grade = normalizeGrade(item.grade);

        return grade.includes(filter);
      });
    }

    // SORT
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }

      if (sortOrder === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      if (sortOrder === "highest") {
        return (
          Number(b.total || 0) -
          Number(a.total || 0)
        );
      }

      if (sortOrder === "lowest") {
        return (
          Number(a.total || 0) -
          Number(b.total || 0)
        );
      }

      return 0;
    });

    return result;
  }, [
    data,
    search,
    gradeFilter,
    sortOrder,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const total = data.length;

    const average =
      total > 0
        ? Math.round(
            data.reduce(
              (sum, item) =>
                sum + Number(item.total || 0),
              0
            ) / total
          )
        : 0;

    const excellent = data.filter((item) =>
      normalizeGrade(item.grade).includes("ممتاز")
    ).length;

    const veryGood = data.filter((item) =>
      normalizeGrade(item.grade).includes("جيد جدا")
    ).length;

    const good = data.filter((item) => {
      const grade = normalizeGrade(item.grade);

      return (
        grade.includes("جيد") &&
        !grade.includes("جيد جدا")
      );
    }).length;

    return {
      total,
      average,
      excellent,
      veryGood,
      good,
    };
  }, [data]);

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "ar-SA",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSearch("");
    setGradeFilter("الكل");
    setSortOrder("newest");
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="history-loading">
        <div className="history-spinner"></div>

        <p>
          جاري تحميل سجل التقييمات...
        </p>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="history-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="history-page-header">

        <div className="history-heading">

          <div className="history-breadcrumb">
            لوحة التحكم
            <span>/</span>
            التقييمات
          </div>

          <h1>
            سجل التقييمات
          </h1>

          <p>
            إدارة ومتابعة جميع تقييمات الموظفين
          </p>

        </div>

        <button
          className="history-add-btn"
          onClick={goToAddEvaluation}
          type="button"
        >
          <span>+</span>
          إضافة تقييم جديد
        </button>

      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="history-stats">

        {/* TOTAL */}

        <div className="history-stat-card">

          <div className="history-stat-icon blue">
            📊
          </div>

          <div className="history-stat-content">

            <span>
              إجمالي التقييمات
            </span>

            <strong>
              {statistics.total}
            </strong>

            <small>
              جميع التقييمات
            </small>

          </div>

        </div>

        {/* AVERAGE */}

        <div className="history-stat-card">

          <div className="history-stat-icon purple">
            %
          </div>

          <div className="history-stat-content">

            <span>
              متوسط التقييم
            </span>

            <strong>
              {statistics.average}%
            </strong>

            <small>
              متوسط النتائج
            </small>

          </div>

        </div>

        {/* EXCELLENT */}

        <div className="history-stat-card">

          <div className="history-stat-icon green">
            ★
          </div>

          <div className="history-stat-content">

            <span>
              تقييم ممتاز
            </span>

            <strong>
              {statistics.excellent}
            </strong>

            <small>
              أداء ممتاز
            </small>

          </div>

        </div>

        {/* VERY GOOD */}

        <div className="history-stat-card">

          <div className="history-stat-icon orange">
            ✓
          </div>

          <div className="history-stat-content">

            <span>
              جيد جدًا
            </span>

            <strong>
              {statistics.veryGood}
            </strong>

            <small>
              أداء جيد جدًا
            </small>

          </div>

        </div>

      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="history-filter-card">

        {/* SEARCH */}

        <div className="history-search">

          <span className="history-search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="ابحث باسم الموظف..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="history-clear-search"
              onClick={() => setSearch("")}
              type="button"
            >
              ×
            </button>
          )}

        </div>

        {/* GRADE */}

        <select
          value={gradeFilter}
          onChange={(e) =>
            setGradeFilter(e.target.value)
          }
          className="history-select"
        >
          <option value="الكل">
            كل التقديرات
          </option>

          <option value="ممتاز">
            ممتاز
          </option>

          <option value="جيد جدا">
            جيد جدًا
          </option>

          <option value="جيد">
            جيد
          </option>

          <option value="مقبول">
            مقبول
          </option>
        </select>

        {/* SORT */}

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value)
          }
          className="history-select"
        >
          <option value="newest">
            الأحدث أولاً
          </option>

          <option value="oldest">
            الأقدم أولاً
          </option>

          <option value="highest">
            أعلى تقييم
          </option>

          <option value="lowest">
            أقل تقييم
          </option>
        </select>

      </div>

      {/* =================================================
          RESULT INFO
      ================================================= */}

      {data.length > 0 && (
        <div className="history-result-info">

          <span>
            عرض{" "}
            <strong>
              {filteredData.length}
            </strong>{" "}
            من{" "}
            <strong>
              {data.length}
            </strong>{" "}
            تقييم
          </span>

          {(search ||
            gradeFilter !== "الكل" ||
            sortOrder !== "newest") && (

            <button
              onClick={resetFilters}
              type="button"
            >
              إعادة ضبط الفلاتر
            </button>

          )}

        </div>
      )}

      {/* =================================================
          EMPTY - NO DATA
      ================================================= */}

      {data.length === 0 ? (

        <div className="history-empty">

          <div className="history-empty-icon">
            📊
          </div>

          <h2>
            لا توجد تقييمات حتى الآن
          </h2>

          <p>
            ابدأ بإضافة أول تقييم للموظفين
            وسيظهر هنا.
          </p>

          <button
            onClick={goToAddEvaluation}
            type="button"
          >
            + إضافة أول تقييم
          </button>

        </div>

      ) : filteredData.length === 0 ? (

        /* =================================================
           EMPTY - FILTER
        ================================================= */

        <div className="history-empty">

          <div className="history-empty-icon">
            🔎
          </div>

          <h2>
            لا توجد نتائج
          </h2>

          <p>
            لم نجد أي تقييم يطابق
            البحث أو الفلترة الحالية.
          </p>

          <button
            className="secondary"
            onClick={resetFilters}
            type="button"
          >
            إعادة ضبط البحث
          </button>

        </div>

      ) : (

        /* =================================================
           EVALUATION CARDS
        ================================================= */

        <div className="history-grid">

          {filteredData.map((evaluation) => {

            const rawScore =
              Number(evaluation.total || 0);

            const score = Math.min(
              Math.max(rawScore, 0),
              100
            );

            const employeeName =
              evaluation.name ||
              "موظف غير معروف";

            return (

              <div
                key={evaluation.evaluation_id}
                className="history-card"
              >

                {/* CARD HEADER */}

                <div className="history-card-header">

                  <div className="history-employee">

                    <div className="history-avatar">

                      {String(employeeName)
                        .trim()
                        .charAt(0)}

                    </div>

                    <div className="history-name-area">

                      <h3>
                        {employeeName}
                      </h3>

                      <span>
                        تقييم #
                        {evaluation.evaluation_id}
                      </span>

                    </div>

                  </div>

                  <span
                    className="history-grade"
                    style={gradeStyle(
                      evaluation.grade
                    )}
                  >
                    {evaluation.grade || "-"}
                  </span>

                </div>

                <div className="history-divider"></div>

                {/* SCORE */}

                <div className="history-score">

                  <div className="history-score-number">

                    <span>
                      النتيجة النهائية
                    </span>

                    <strong
                      style={{
                        color:
                          scoreColor(
                            evaluation.total
                          ),
                      }}
                    >
                      {evaluation.total || 0}
                      <small>%</small>
                    </strong>

                  </div>

                  <div className="history-progress-area">

                    <div className="history-progress">

                      <div
                        style={{
                          width: `${score}%`,
                          background:
                            scoreColor(
                              evaluation.total
                            ),
                        }}
                      />

                    </div>

                    <span>
                      {score}%
                    </span>

                  </div>

                </div>

                {/* INFORMATION */}

                <div className="history-info">

                  {/* PERIOD */}

                  <div className="history-info-row">

                    <div className="history-info-icon">
                      📅
                    </div>

                    <div>

                      <span>
                        فترة التقييم
                      </span>

                      <strong>
                        {evaluation.from_date || "-"}
                        <b> ← </b>
                        {evaluation.to_date || "-"}
                      </strong>

                    </div>

                  </div>

                  {/* CREATED */}

                  <div className="history-info-row">

                    <div className="history-info-icon">
                      🕒
                    </div>

                    <div>

                      <span>
                        تاريخ الإنشاء
                      </span>

                      <strong>
                        {formatDate(
                          evaluation.created_at
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="history-actions">

                  {/* EDIT */}

                  <button
                    className="history-edit-btn"
                    onClick={() =>
                      editEvaluation(
                        evaluation.evaluation_id
                      )
                    }
                    type="button"
                  >
                    ✏️ تعديل
                  </button>

                  {/* VIEW */}

                  <button
                    className="history-view-btn"
                    onClick={() =>
                      viewReport(
                        evaluation.evaluation_id
                      )
                    }
                    type="button"
                  >
                    📄 عرض التقرير
                  </button>

                  {/* DELETE */}

                  <button
                    className="history-delete-btn"
                    onClick={() =>
                      setDeleteId(
                        evaluation.evaluation_id
                      )
                    }
                    type="button"
                  >
                    🗑 حذف
                  </button>

                </div>

              </div>

            );
          })}

        </div>

      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteId !== null && (

        <div
          className="history-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target === e.currentTarget &&
              !deleting
            ) {
              setDeleteId(null);
            }

          }}
        >

          <div className="history-modal">

            <div className="history-modal-icon">
              ⚠️
            </div>

            <h2>
              حذف التقييم
            </h2>

            <p>
              هل أنت متأكد من حذف هذا التقييم؟
              <br />
              لا يمكن التراجع عن هذه العملية.
            </p>

            <div className="history-modal-actions">

              <button
                className="history-cancel-btn"
                onClick={() =>
                  setDeleteId(null)
                }
                disabled={deleting}
                type="button"
              >
                إلغاء
              </button>

              <button
                className="history-confirm-delete"
                onClick={() =>
                  deleteOne(deleteId)
                }
                disabled={deleting}
                type="button"
              >
                {deleting
                  ? "جاري الحذف..."
                  : "نعم، حذف"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
