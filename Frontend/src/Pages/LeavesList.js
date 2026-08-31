
import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import "./LeaveList.css";

export default function LeavesList() {
  const nav = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);

  const [editForm, setEditForm] = useState({
    type: "",
    from_date: "",
    to_date: "",
    notes: "",
  });

  // =========================
  // FETCH
  // =========================

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/leaves");

      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch Leaves Error:", error);

      alert(
        error.response?.data?.message ||
          "فشل تحميل الإجازات"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STATUS
  // =========================

  const getStatusKey = (status) => {
    if (!status) return "pending";

    const value = String(status).toLowerCase().trim();

    if (
      value === "approved" ||
      value === "مقبول" ||
      value === "مقبولة"
    ) {
      return "approved";
    }

    if (
      value === "rejected" ||
      value === "مرفوض" ||
      value === "مرفوضة"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const getStatusInfo = (status) => {
    const key = getStatusKey(status);

    if (key === "approved") {
      return {
        text: "مقبولة",
        className: "status-approved",
        icon: "✓",
      };
    }

    if (key === "rejected") {
      return {
        text: "مرفوضة",
        className: "status-rejected",
        icon: "×",
      };
    }

    return {
      text: "قيد الانتظار",
      className: "status-pending",
      icon: "◷",
    };
  };

  // =========================
  // EMPLOYEE
  // =========================

  const getEmployeeName = (leave) =>
    leave.name ||
    leave.employeeName ||
    leave.employee?.name ||
    "غير محدد";

  // =========================
  // STATISTICS
  // =========================

  const statistics = useMemo(() => {
    return {
      total: leaves.length,

      pending: leaves.filter(
        (leave) =>
          getStatusKey(leave.status) === "pending"
      ).length,

      approved: leaves.filter(
        (leave) =>
          getStatusKey(leave.status) === "approved"
      ).length,

      rejected: leaves.filter(
        (leave) =>
          getStatusKey(leave.status) === "rejected"
      ).length,
    };
  }, [leaves]);

  // =========================
  // TYPES
  // =========================

  const leaveTypes = useMemo(() => {
    return [
      ...new Set(
        leaves
          .map((leave) => leave.type)
          .filter(Boolean)
      ),
    ];
  }, [leaves]);

  // =========================
  // FILTER
  // =========================

  const filteredLeaves = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return leaves.filter((leave) => {
      const employeeName = getEmployeeName(leave);
      const statusKey = getStatusKey(leave.status);

      const matchesSearch =
        String(employeeName)
          .toLowerCase()
          .includes(searchValue) ||
        String(leave.type || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(leave.from_date || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(leave.to_date || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesType = filterType
        ? leave.type === filterType
        : true;

      const matchesStatus = filterStatus
        ? statusKey === filterStatus
        : true;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    leaves,
    search,
    filterType,
    filterStatus,
  ]);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (id, status) => {
    const leave = leaves.find(
      (item) => item.leave_id === id
    );

    const actionText =
      status === "approved" ? "قبول" : "رفض";

    if (
      !window.confirm(
        `هل أنت متأكد من ${actionText} طلب الإجازة للموظف "${getEmployeeName(
          leave || {}
        )}"؟`
      )
    ) {
      return;
    }

    try {
      setSaving(true);

      await API.put(`/leaves/${id}`, {
        status,
      });

      setLeaves((prev) =>
        prev.map((item) =>
          item.leave_id === id
            ? {
                ...item,
                status,
              }
            : item
        )
      );

      setSelectedLeave(null);
    } catch (error) {
      console.error(
        "Update Leave Status Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          `فشل ${actionText} طلب الإجازة`
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const openEditLeave = (leave) => {
    setEditingLeave(leave);

    setEditForm({
      type: leave.type || "",

      from_date: leave.from_date
        ? String(leave.from_date).slice(0, 10)
        : "",

      to_date: leave.to_date
        ? String(leave.to_date).slice(0, 10)
        : "",

      notes: leave.notes || "",
    });
  };

  const updateLeave = async () => {
    if (
      !editForm.type.trim() ||
      !editForm.from_date ||
      !editForm.to_date
    ) {
      alert("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    if (
      new Date(editForm.to_date) <
      new Date(editForm.from_date)
    ) {
      alert(
        "تاريخ نهاية الإجازة يجب أن يكون بعد أو يساوي تاريخ البداية"
      );
      return;
    }

    try {
      setSaving(true);

      const res = await API.put(
        `/leaves/edit/${editingLeave.leave_id}`,
        {
          type: editForm.type,
          from_date: editForm.from_date,
          to_date: editForm.to_date,
          notes: editForm.notes,
        }
      );

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id === editingLeave.leave_id
            ? {
                ...leave,
                ...(res.data || {}),
                type: editForm.type,
                from_date: editForm.from_date,
                to_date: editForm.to_date,
                notes: editForm.notes,
              }
            : leave
        )
      );

      setEditingLeave(null);

      alert("تم تعديل الإجازة بنجاح");
    } catch (error) {
      console.error("Update Leave Error:", error);

      alert(
        error.response?.data?.message ||
          "فشل تعديل الإجازة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // EXCEL
  // =========================

  const exportToExcel = () => {
    if (!filteredLeaves.length) {
      alert("لا توجد بيانات لتصديرها");
      return;
    }

    const data = filteredLeaves.map((leave) => ({
      الموظف: getEmployeeName(leave),
      "نوع الإجازة": leave.type || "",
      "من تاريخ": leave.from_date || "",
      "إلى تاريخ": leave.to_date || "",
      "عدد الأيام": leave.days || "",
      الملاحظات: leave.notes || "",
      الحالة: getStatusInfo(leave.status).text,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "الإجازات"
    );

    const file = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([file], {
        type: "application/octet-stream",
      }),
      "الإجازات.xlsx"
    );
  };

  // =========================
  // DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "—";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return String(date);
    }

    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // =========================
  // DAYS
  // =========================

  const calculateDays = () => {
    if (
      !editForm.from_date ||
      !editForm.to_date
    ) {
      return 0;
    }

    const start = new Date(editForm.from_date);
    const end = new Date(editForm.to_date);

    if (end < start) return 0;

    return (
      Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="leaves-page">

      {/* ================= HEADER ================= */}

      <header className="top-header">

        <div className="header-right">

          <div>
            <div className="breadcrumb">
              <span>لوحة التحكم</span>
              <b>/</b>
              <span className="current">
                الإجازات
              </span>
            </div>

            <h1 className="page-title">
              إدارة الإجازات
            </h1>

            <p className="page-description">
              إدارة ومتابعة طلبات إجازات الموظفين
            </p>
          </div>

        </div>

        <div className="header-actions">

          <button
            className="primary-button"
            onClick={() => nav("/leave")}
          >
            <span>＋</span>
            إضافة إجازة
          </button>

        </div>

      </header>

      <div className="content">

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          <div className="stat-card total">
            <div className="stat-card-top">
              <div className="stat-icon">
                📅
              </div>

              <span className="stat-mini">
                الكل
              </span>
            </div>

            <div className="stat-label">
              إجمالي الإجازات
            </div>

            <div className="stat-number">
              {loading
                ? "..."
                : statistics.total}
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-card-top">
              <div className="stat-icon">
                ◷
              </div>

              <span className="stat-mini">
                معلقة
              </span>
            </div>

            <div className="stat-label">
              قيد الانتظار
            </div>

            <div className="stat-number">
              {loading
                ? "..."
                : statistics.pending}
            </div>
          </div>

          <div className="stat-card approved">
            <div className="stat-card-top">
              <div className="stat-icon">
                ✓
              </div>

              <span className="stat-mini">
                مكتملة
              </span>
            </div>

            <div className="stat-label">
              الإجازات المقبولة
            </div>

            <div className="stat-number">
              {loading
                ? "..."
                : statistics.approved}
            </div>
          </div>

          <div className="stat-card rejected">
            <div className="stat-card-top">
              <div className="stat-icon">
                ×
              </div>

              <span className="stat-mini">
                مرفوضة
              </span>
            </div>

            <div className="stat-label">
              الإجازات المرفوضة
            </div>

            <div className="stat-number">
              {loading
                ? "..."
                : statistics.rejected}
            </div>
          </div>

        </section>

        {/* ================= TOOLBAR ================= */}

        <section className="toolbar">

          <div className="search-wrapper">

            <span className="search-icon">
              ⌕
            </span>

            <input
              className="search-input"
              placeholder="ابحث باسم الموظف أو نوع الإجازة..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

          <div className="filters">

            <select
              className="select-filter"
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
            >
              <option value="">
                كل أنواع الإجازات
              </option>

              {leaveTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
            >
              <option value="">
                كل الحالات
              </option>

              <option value="pending">
                قيد الانتظار
              </option>

              <option value="approved">
                مقبولة
              </option>

              <option value="rejected">
                مرفوضة
              </option>
            </select>

            <button
              className="excel-button"
              onClick={exportToExcel}
            >
              <span>↓</span>
              Excel
            </button>

          </div>

        </section>

        {/* ================= TABLE ================= */}

        <section className="table-container">

          <div className="table-header">

            <div>
              <div className="section-title-row">

                <h2 className="section-title">
                  قائمة الإجازات
                </h2>

                <span className="count-badge">
                  {filteredLeaves.length}
                </span>

              </div>

              <span className="results-count">
                طلبات الإجازة المسجلة في النظام
              </span>
            </div>

            <button
              className="refresh-button"
              onClick={fetchLeaves}
              disabled={loading}
            >
              <span
                className={
                  loading
                    ? "refresh-spin"
                    : ""
                }
              >
                ↻
              </span>
              تحديث
            </button>

          </div>

          {loading ? (
            <div className="empty-state">

              <div className="loading-spinner" />

              <h3>
                جاري تحميل الإجازات
              </h3>

              <p>
                يرجى الانتظار قليلاً...
              </p>

            </div>
          ) : filteredLeaves.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                لا توجد إجازات
              </h3>

              <p>
                لم يتم العثور على طلبات إجازات
                مطابقة للبحث أو الفلاتر الحالية.
              </p>

              {(search ||
                filterType ||
                filterStatus) && (

                <button
                  className="reset-filters"
                  onClick={() => {
                    setSearch("");
                    setFilterType("");
                    setFilterStatus("");
                  }}
                >
                  إعادة ضبط الفلاتر
                </button>

              )}

            </div>

          ) : (

            <>

              {/* DESKTOP */}

              <div className="desktop-table">

                <div className="table-head">
                  <div>الموظف</div>
                  <div>نوع الإجازة</div>
                  <div>من</div>
                  <div>إلى</div>
                  <div>الحالة</div>
                  <div>الإجراءات</div>
                </div>

                {filteredLeaves.map((leave) => {

                  const status =
                    getStatusInfo(leave.status);

                  const statusKey =
                    getStatusKey(leave.status);

                  const employeeName =
                    getEmployeeName(leave);

                  return (
                    <div
                      key={leave.leave_id}
                      className="table-row"
                    >

                      <div className="employee-cell">

                        <div className="avatar">
                          {String(
                            employeeName
                          ).charAt(0)}
                        </div>

                        <div className="employee-info">

                          <div className="employee-name">
                            {employeeName}
                          </div>

                          <div className="employee-role">
                            طلب إجازة
                          </div>

                        </div>

                      </div>

                      <div>
                        <span className="leave-type-badge">
                          {leave.type || "—"}
                        </span>
                      </div>

                      <div className="date-cell">
                        {formatDate(
                          leave.from_date
                        )}
                      </div>

                      <div className="date-cell">
                        {formatDate(
                          leave.to_date
                        )}
                      </div>

                      <div>
                        <span
                          className={`status-badge ${status.className}`}
                        >
                          <span className="status-dot" />
                          {status.text}
                        </span>
                      </div>

                      <div className="actions">

                        {statusKey === "pending" && (
                          <>
                            <button
                              className="action-button accept"
                              title="قبول الطلب"
                              onClick={() =>
                                updateStatus(
                                  leave.leave_id,
                                  "approved"
                                )
                              }
                              disabled={saving}
                            >
                              ✓
                            </button>

                            <button
                              className="action-button reject"
                              title="رفض الطلب"
                              onClick={() =>
                                updateStatus(
                                  leave.leave_id,
                                  "rejected"
                                )
                              }
                              disabled={saving}
                            >
                              ×
                            </button>

                            <button
                              className="action-button edit"
                              title="تعديل"
                              onClick={() =>
                                openEditLeave(leave)
                              }
                              disabled={saving}
                            >
                              ✎
                            </button>
                          </>
                        )}

                        <button
                          className="action-button view"
                          title="عرض التفاصيل"
                          onClick={() =>
                            setSelectedLeave(leave)
                          }
                        >
                          👁
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>

              {/* MOBILE */}

              <div className="mobile-cards">

                {filteredLeaves.map((leave) => {

                  const status =
                    getStatusInfo(leave.status);

                  const statusKey =
                    getStatusKey(leave.status);

                  const employeeName =
                    getEmployeeName(leave);

                  return (
                    <div
                      key={leave.leave_id}
                      className="mobile-leave-card"
                    >

                      <div className="mobile-leave-top">

                        <div className="employee-cell">

                          <div className="avatar">
                            {String(
                              employeeName
                            ).charAt(0)}
                          </div>

                          <div className="employee-info">

                            <div className="employee-name">
                              {employeeName}
                            </div>

                            <div className="employee-role">
                              {leave.type || "إجازة"}
                            </div>

                          </div>

                        </div>

                        <span
                          className={`status-badge ${status.className}`}
                        >
                          <span className="status-dot" />
                          {status.text}
                        </span>

                      </div>

                      <div className="mobile-info">

                        <div>
                          <small>
                            نوع الإجازة
                          </small>

                          <span>
                            {leave.type || "—"}
                          </span>
                        </div>

                        <div>
                          <small>من</small>

                          <span>
                            {formatDate(
                              leave.from_date
                            )}
                          </span>
                        </div>

                        <div>
                          <small>إلى</small>

                          <span>
                            {formatDate(
                              leave.to_date
                            )}
                          </span>
                        </div>

                        <div>
                          <small>الأيام</small>

                          <span>
                            {leave.days || "—"}
                          </span>
                        </div>

                      </div>

                      <div className="mobile-actions">

                        {statusKey === "pending" && (
                          <>
                            <button
                              className="mobile-action accept"
                              onClick={() =>
                                updateStatus(
                                  leave.leave_id,
                                  "approved"
                                )
                              }
                              disabled={saving}
                            >
                              ✓ قبول
                            </button>

                            <button
                              className="mobile-action reject"
                              onClick={() =>
                                updateStatus(
                                  leave.leave_id,
                                  "rejected"
                                )
                              }
                              disabled={saving}
                            >
                              × رفض
                            </button>

                            <button
                              className="mobile-action edit"
                              onClick={() =>
                                openEditLeave(leave)
                              }
                              disabled={saving}
                            >
                              ✎ تعديل
                            </button>
                          </>
                        )}

                        <button
                          className="mobile-action view full"
                          onClick={() =>
                            setSelectedLeave(leave)
                          }
                        >
                          👁 عرض التفاصيل
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>

            </>
          )}

        </section>

      </div>

      {/* ================= DETAILS MODAL ================= */}

      {selectedLeave && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedLeave(null);
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">

              <div className="modal-heading">

                <div className="modal-icon">
                  📅
                </div>

                <div>

                  <h2 className="modal-title">
                    تفاصيل طلب الإجازة
                  </h2>

                  <p className="modal-subtitle">
                    الطلب المقدم من{" "}
                    <strong>
                      {getEmployeeName(
                        selectedLeave
                      )}
                    </strong>
                  </p>

                </div>

              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedLeave(null)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="detail-grid">

                <div className="detail-item">
                  <span>الموظف</span>
                  <strong>
                    {getEmployeeName(
                      selectedLeave
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>نوع الإجازة</span>
                  <strong>
                    {selectedLeave.type || "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>من تاريخ</span>
                  <strong>
                    {formatDate(
                      selectedLeave.from_date
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>إلى تاريخ</span>
                  <strong>
                    {formatDate(
                      selectedLeave.to_date
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>عدد الأيام</span>
                  <strong>
                    {selectedLeave.days || "—"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>الحالة</span>

                  <strong>
                    <span
                      className={`status-badge ${
                        getStatusInfo(
                          selectedLeave.status
                        ).className
                      }`}
                    >
                      <span className="status-dot" />

                      {
                        getStatusInfo(
                          selectedLeave.status
                        ).text
                      }
                    </span>
                  </strong>

                </div>

                <div className="detail-item full">

                  <span>الملاحظات</span>

                  <strong className="notes-value">
                    {selectedLeave.notes ||
                      "لا توجد ملاحظات"}
                  </strong>

                </div>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedLeave(null)
                }
              >
                إغلاق
              </button>

              {getStatusKey(
                selectedLeave.status
              ) === "pending" && (

                <button
                  className="primary-button"
                  onClick={() => {

                    const leave =
                      selectedLeave;

                    setSelectedLeave(null);

                    openEditLeave(leave);

                  }}
                >
                  ✎ تعديل الإجازة
                </button>

              )}

            </div>

          </div>

        </div>
      )}

      {/* ================= EDIT MODAL ================= */}

      {editingLeave && (
        <div
          className="modal-overlay"
          onClick={(e) => {

            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              setEditingLeave(null);
            }

          }}
        >

          <div className="modal edit-modal">

            <div className="modal-header">

              <div className="modal-heading">

                <div className="modal-icon edit-icon">
                  ✎
                </div>

                <div>

                  <h2 className="modal-title">
                    تعديل طلب الإجازة
                  </h2>

                  <p className="modal-subtitle">
                    تعديل طلب الموظف{" "}
                    <strong>
                      {getEmployeeName(
                        editingLeave
                      )}
                    </strong>
                  </p>

                </div>

              </div>

              <button
                className="close-button"
                onClick={() =>
                  setEditingLeave(null)
                }
                disabled={saving}
              >
                ×
              </button>

            </div>

            <div className="modal-body">

              <div className="form-group">

                <label className="form-label">
                  نوع الإجازة
                  <span>*</span>
                </label>

                <input
                  className="form-input"
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      type: e.target.value,
                    })
                  }
                  placeholder="مثال: إجازة سنوية"
                  disabled={saving}
                />

              </div>

              <div className="edit-date-grid">

                <div className="form-group">

                  <label className="form-label">
                    من تاريخ
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={editForm.from_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        from_date:
                          e.target.value,
                      })
                    }
                    disabled={saving}
                  />

                </div>

                <div className="form-group">

                  <label className="form-label">
                    إلى تاريخ
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={editForm.to_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        to_date:
                          e.target.value,
                      })
                    }
                    disabled={saving}
                  />

                </div>

              </div>

              {calculateDays() > 0 && (
                <div className="days-preview">

                  <span>📅</span>

                  <div>

                    <small>
                      مدة الإجازة
                    </small>

                    <strong>
                      {calculateDays()} يوم
                    </strong>

                  </div>

                </div>
              )}

              <div className="form-group">

                <label className="form-label">
                  الملاحظات
                </label>

                <textarea
                  className="form-textarea"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="أدخل الملاحظات..."
                  rows={4}
                  disabled={saving}
                />

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setEditingLeave(null)
                }
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                className="primary-button save-button"
                onClick={updateLeave}
                disabled={saving}
              >

                {saving ? (
                  <>
                    <span className="button-spinner" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    💾 حفظ التعديلات
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
