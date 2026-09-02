import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

import {
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaEdit,
  FaEye,
  FaTrash,
  FaFileExcel,
  FaSyncAlt,
  FaSearch,
  FaFileAlt,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaPaperclip,
  FaDownload,
  FaSave,
  FaTimes as FaClose,
  FaExclamationTriangle,
} from "react-icons/fa";

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
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const [editingLeave, setEditingLeave] = useState(null);

  const [editForm, setEditForm] = useState({
    type: "",
    from_date: "",
    to_date: "",
    notes: "",
  });

  const [confirmModal, setConfirmModal] = useState(null);

  const [actionLoading, setActionLoading] = useState(null);

  // =========================================================
  // FETCH LEAVES
  // =========================================================

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/leaves");

      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch Leaves Error:", error);
      alert(
        error.response?.data?.message ||
          "حدث خطأ أثناء تحميل طلبات الإجازات"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getEmployeeName = (leave) => {
    return (
      leave?.name ||
      leave?.employeeName ||
      leave?.employee?.name ||
      leave?.employee?.full_name ||
      "غير محدد"
    );
  };

  const getEmployeeRole = (leave) => {
    return (
      leave?.job_title ||
      leave?.position ||
      leave?.employee?.job_title ||
      leave?.employee?.position ||
      "موظف"
    );
  };

  const getStatusKey = (status) => {
    const value = String(status || "").toLowerCase().trim();

    if (
      [
        "approved",
        "approve",
        "accepted",
        "accept",
        "مقبول",
        "مقبولة",
        "تم القبول",
      ].includes(value)
    ) {
      return "approved";
    }

    if (
      [
        "rejected",
        "reject",
        "مرفوض",
        "مرفوضة",
        "تم الرفض",
      ].includes(value)
    ) {
      return "rejected";
    }

    return "pending";
  };

  const getStatusInfo = (status) => {
    const key = getStatusKey(status);

    if (key === "approved") {
      return {
        key,
        text: "مقبولة",
        icon: <FaCheckCircle />,
        className: "status-approved",
      };
    }

    if (key === "rejected") {
      return {
        key,
        text: "مرفوضة",
        icon: <FaTimesCircle />,
        className: "status-rejected",
      };
    }

    return {
      key: "pending",
      text: "قيد المراجعة",
      icon: <FaClock />,
      className: "status-pending",
    };
  };

  const getAttachmentUrl = (leave) => {
    const attachment =
      leave?.attachment ||
      leave?.attachment_url ||
      leave?.file ||
      leave?.file_url ||
      leave?.document ||
      leave?.document_url;

    if (!attachment) return null;

    if (typeof attachment === "object") {
      return (
        attachment.url ||
        attachment.path ||
        attachment.file_url ||
        attachment.location ||
        null
      );
    }

    if (String(attachment).startsWith("http")) {
      return attachment;
    }

    const baseURL = API?.defaults?.baseURL || "";

    return `${baseURL.replace(/\/$/, "")}/${String(attachment).replace(
      /^\//,
      ""
    )}`;
  };

  const isPdfFile = (url) => {
    if (!url) return false;

    return String(url).toLowerCase().includes(".pdf");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  const getInputDate = (date) => {
    if (!date) return "";

    const value = String(date);

    if (value.includes("T")) {
      return value.split("T")[0];
    }

    return value.slice(0, 10);
  };

  const calculateDays = (from, to) => {
    if (!from || !to) return 0;

    const start = new Date(from);
    const end = new Date(to);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 0;
    }

    const difference =
      Math.floor(
        (new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate()
        ) -
          new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate()
          )) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return difference > 0 ? difference : 0;
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    let total = leaves.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    leaves.forEach((leave) => {
      const status = getStatusKey(leave.status);

      if (status === "pending") pending++;
      if (status === "approved") approved++;
      if (status === "rejected") rejected++;
    });

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }, [leaves]);

  // =========================================================
  // LEAVE TYPES
  // =========================================================

  const leaveTypes = useMemo(() => {
    return [
      ...new Set(
        leaves
          .map((leave) => leave.type || leave.leave_type)
          .filter(Boolean)
      ),
    ];
  }, [leaves]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredLeaves = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return leaves.filter((leave) => {
      const employeeName = getEmployeeName(leave).toLowerCase();

      const type = String(
        leave.type || leave.leave_type || ""
      ).toLowerCase();

      const fromDate = String(leave.from_date || "");
      const toDate = String(leave.to_date || "");

      const matchesSearch =
        !searchValue ||
        employeeName.includes(searchValue) ||
        type.includes(searchValue) ||
        fromDate.includes(searchValue) ||
        toDate.includes(searchValue);

      const matchesType =
        !filterType ||
        (leave.type || leave.leave_type) === filterType;

      const matchesStatus =
        !filterStatus ||
        getStatusKey(leave.status) === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leaves, search, filterType, filterStatus]);

  // =========================================================
  // ATTACHMENT
  // =========================================================

  const openAttachment = (leave) => {
    const url = getAttachmentUrl(leave);

    if (!url) return;

    setSelectedAttachment({
      url,
      isPdf: isPdfFile(url),
      employeeName: getEmployeeName(leave),
    });
  };

  // =========================================================
  // STATUS
  // =========================================================

  const requestStatusChange = (id, status) => {
    const leave = leaves.find((item) => item.leave_id === id);

    if (!leave) return;

    const employeeName = getEmployeeName(leave);

    if (status === "approved") {
      setConfirmModal({
        type: "approve",
        title: "تأكيد قبول الطلب",
        message: `هل أنت متأكد من قبول طلب الإجازة الخاص بالموظف "${employeeName}"؟`,
        confirmText: "نعم، قبول الطلب",
        icon: <FaCheckCircle />,
        id,
        status,
      });
    }

    if (status === "rejected") {
      setConfirmModal({
        type: "reject",
        title: "تأكيد رفض الطلب",
        message: `هل أنت متأكد من رفض طلب الإجازة الخاص بالموظف "${employeeName}"؟`,
        confirmText: "نعم، رفض الطلب",
        icon: <FaTimesCircle />,
        id,
        status,
      });
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setSaving(true);
      setActionLoading(`${status}-${id}`);

      const res = await API.put(`/leaves/${id}`, {
        status,
      });

      const updatedLeave = res.data;

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id === id
            ? {
                ...leave,
                ...(updatedLeave || {}),
                status:
                  updatedLeave?.status ||
                  status,
              }
            : leave
        )
      );

      setSelectedLeave(null);
      setConfirmModal(null);
    } catch (error) {
      console.error("Update Leave Status Error:", error);

      alert(
        error.response?.data?.message ||
          "فشل تحديث حالة طلب الإجازة"
      );
    } finally {
      setSaving(false);
      setActionLoading(null);
    }
  };

  const confirmAction = async () => {
    if (!confirmModal) return;

    if (confirmModal.type === "approve") {
      await updateStatus(
        confirmModal.id,
        "approved"
      );
    }

    if (confirmModal.type === "reject") {
      await updateStatus(
        confirmModal.id,
        "rejected"
      );
    }

    if (confirmModal.type === "delete") {
      await deleteLeave(confirmModal.id);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEditLeave = (leave) => {
    setEditingLeave(leave);

    setEditForm({
      type: leave.type || leave.leave_type || "",
      from_date: getInputDate(leave.from_date),
      to_date: getInputDate(leave.to_date),
      notes: leave.notes || "",
    });
  };

  const closeEditModal = () => {
    if (saving) return;

    setEditingLeave(null);

    setEditForm({
      type: "",
      from_date: "",
      to_date: "",
      notes: "",
    });
  };

  const updateLeave = async () => {
    if (!editingLeave) return;

    if (!editForm.type) {
      alert("يرجى اختيار نوع الإجازة");
      return;
    }

    if (!editForm.from_date || !editForm.to_date) {
      alert("يرجى تحديد تاريخ بداية ونهاية الإجازة");
      return;
    }

    if (
      new Date(editForm.from_date) >
      new Date(editForm.to_date)
    ) {
      alert("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
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

      const updatedLeave = res.data;

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id === editingLeave.leave_id
            ? {
                ...leave,
                ...(updatedLeave || {}),
                type:
                  updatedLeave?.type ||
                  editForm.type,
                from_date:
                  updatedLeave?.from_date ||
                  editForm.from_date,
                to_date:
                  updatedLeave?.to_date ||
                  editForm.to_date,
                notes:
                  updatedLeave?.notes ??
                  editForm.notes,
              }
            : leave
        )
      );

      closeEditModal();
    } catch (error) {
      console.error("Update Leave Error:", error);

      alert(
        error.response?.data?.message ||
          "فشل تعديل طلب الإجازة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const requestDeleteLeave = (id) => {
    const leave = leaves.find(
      (item) => item.leave_id === id
    );

    if (!leave) return;

    const employeeName = getEmployeeName(leave);

    setConfirmModal({
      type: "delete",
      title: "حذف طلب الإجازة",
      message: `هل أنت متأكد من حذف طلب الإجازة الخاص بالموظف "${employeeName}"؟ لا يمكن التراجع عن هذه العملية.`,
      confirmText: "نعم، حذف الطلب",
      icon: <FaTrash />,
      id,
    });
  };

  const deleteLeave = async (id) => {
    try {
      setSaving(true);
      setActionLoading(`delete-${id}`);

      await API.delete(`/leaves/${id}`);

      setLeaves((prev) =>
        prev.filter(
          (leave) => leave.leave_id !== id
        )
      );

      setSelectedLeave(null);
      setConfirmModal(null);
    } catch (error) {
      console.error("Delete Leave Error:", error);

      alert(
        error.response?.data?.message ||
          "فشل حذف طلب الإجازة"
      );
    } finally {
      setSaving(false);
      setActionLoading(null);
    }
  };

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  const exportToExcel = () => {
    if (!filteredLeaves.length) {
      alert("لا توجد بيانات لتصديرها");
      return;
    }

    const data = filteredLeaves.map((leave) => {
      const status = getStatusInfo(leave.status);

      return {
        الموظف: getEmployeeName(leave),
        "نوع الإجازة":
          leave.type ||
          leave.leave_type ||
          "-",
        "تاريخ البداية": formatDate(
          leave.from_date
        ),
        "تاريخ النهاية": formatDate(
          leave.to_date
        ),
        "عدد الأيام":
          leave.days ||
          calculateDays(
            leave.from_date,
            leave.to_date
          ),
        المرفق: getAttachmentUrl(leave)
          ? "يوجد مرفق"
          : "لا يوجد",
        الملاحظات: leave.notes || "-",
        الحالة: status.text,
      };
    });

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "طلبات الإجازات"
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const blob = new Blob(
      [excelBuffer],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    saveAs(
      blob,
      `طلبات_الإجازات_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  };

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterStatus("");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="leaves-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="top-header">
        <div className="header-right">
          <div className="breadcrumb">
            <span>لوحة التحكم</span>
            <span className="breadcrumb-arrow">
              /
            </span>
            <strong>طلبات الإجازات</strong>
          </div>

          <div className="title-wrapper">
            <div className="title-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h1 className="page-title">
                طلبات الإجازات
              </h1>

              <p className="page-description">
                إدارة ومراجعة جميع طلبات إجازات
                الموظفين
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="secondary-header-button"
            onClick={fetchLeaves}
            disabled={loading}
          >
            <FaSyncAlt
              className={
                loading
                  ? "refresh-spin"
                  : ""
              }
            />
            تحديث
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              nav("/leaves/add")
            }
          >
            <FaCalendarAlt />
            إضافة إجازة
          </button>
        </div>
      </header>

      <main className="content">
        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="stats-grid">
          <div className="stat-card total-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaFileAlt />
              </div>

              <span className="stat-mini">
                الكل
              </span>
            </div>

            <span className="stat-label">
              إجمالي الطلبات
            </span>

            <strong className="stat-number">
              {statistics.total}
            </strong>
          </div>

          <div className="stat-card pending-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaClock />
              </div>

              <span className="stat-mini">
                مراجعة
              </span>
            </div>

            <span className="stat-label">
              قيد المراجعة
            </span>

            <strong className="stat-number">
              {statistics.pending}
            </strong>
          </div>

          <div className="stat-card approved-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>

              <span className="stat-mini">
                معتمد
              </span>
            </div>

            <span className="stat-label">
              الإجازات المقبولة
            </span>

            <strong className="stat-number">
              {statistics.approved}
            </strong>
          </div>

          <div className="stat-card rejected-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaTimesCircle />
              </div>

              <span className="stat-mini">
                مرفوض
              </span>
            </div>

            <span className="stat-label">
              الإجازات المرفوضة
            </span>

            <strong className="stat-number">
              {statistics.rejected}
            </strong>
          </div>
        </section>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <section className="toolbar">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              className="search-input"
              placeholder="ابحث باسم الموظف أو نوع الإجازة..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
                aria-label="مسح البحث"
              >
                <FaClose />
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
                جميع أنواع الإجازات
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
                جميع الحالات
              </option>

              <option value="pending">
                قيد المراجعة
              </option>

              <option value="approved">
                مقبولة
              </option>

              <option value="rejected">
                مرفوضة
              </option>
            </select>

            {(search ||
              filterType ||
              filterStatus) && (
              <button
                type="button"
                className="reset-filters"
                onClick={resetFilters}
              >
                إعادة ضبط
              </button>
            )}

            <button
              type="button"
              className="excel-button"
              onClick={exportToExcel}
            >
              <FaFileExcel />
              تصدير Excel
            </button>
          </div>
        </section>

        {/* ===================================================
            TABLE
        =================================================== */}

        <section className="table-container">
          <div className="table-header">
            <div className="section-title-row">
              <div>
                <h2 className="section-title">
                  قائمة طلبات الإجازات
                </h2>

                <p className="results-count">
                  عرض{" "}
                  <strong>
                    {filteredLeaves.length}
                  </strong>{" "}
                  من أصل{" "}
                  <strong>
                    {leaves.length}
                  </strong>{" "}
                  طلب
                </p>
              </div>

              <span className="count-badge">
                {filteredLeaves.length}
              </span>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={fetchLeaves}
              disabled={loading}
              title="تحديث البيانات"
            >
              <FaSyncAlt
                className={
                  loading
                    ? "refresh-spin"
                    : ""
                }
              />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>
                جاري تحميل طلبات الإجازات...
              </p>
            </div>
          ) : filteredLeaves.length ===
            0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaCalendarAlt />
              </div>

              <h3>
                لا توجد طلبات إجازات
              </h3>

              <p>
                لم يتم العثور على طلبات
                مطابقة للبحث أو الفلاتر
              </p>

              {(search ||
                filterType ||
                filterStatus) && (
                <button
                  type="button"
                  className="reset-filters empty-reset"
                  onClick={resetFilters}
                >
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="desktop-table">
                <div className="table-head">
                  <div>الموظف</div>
                  <div>نوع الإجازة</div>
                  <div>من</div>
                  <div>إلى</div>
                  <div>المرفق</div>
                  <div>الحالة</div>
                  <div>الإجراءات</div>
                </div>

                {filteredLeaves.map(
                  (leave) => {
                    const status =
                      getStatusInfo(
                        leave.status
                      );

                    const statusKey =
                      status.key;

                    const attachment =
                      getAttachmentUrl(
                        leave
                      );

                    return (
                      <div
                        className="table-row"
                        key={leave.leave_id}
                      >
                        {/* EMPLOYEE */}

                        <div className="employee-cell">
                          <div className="avatar">
                            {getEmployeeName(
                              leave
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="employee-info">
                            <strong className="employee-name">
                              {getEmployeeName(
                                leave
                              )}
                            </strong>

                            <span className="employee-role">
                              {getEmployeeRole(
                                leave
                              )}
                            </span>
                          </div>
                        </div>

                        {/* TYPE */}

                        <div>
                          <span className="leave-type-badge">
                            <FaCalendarAlt />
                            {leave.type ||
                              leave.leave_type ||
                              "-"}
                          </span>
                        </div>

                        {/* FROM */}

                        <div className="date-cell">
                          <span>
                            {formatDate(
                              leave.from_date
                            )}
                          </span>
                        </div>

                        {/* TO */}

                        <div className="date-cell">
                          <span>
                            {formatDate(
                              leave.to_date
                            )}
                          </span>
                        </div>

                        {/* ATTACHMENT */}

                        <div className="attachment-cell">
                          {attachment ? (
                            <button
                              type="button"
                              className="attachment-preview-button"
                              onClick={() =>
                                openAttachment(
                                  leave
                                )
                              }
                            >
                              {isPdfFile(
                                attachment
                              ) ? (
                                <FaFileAlt />
                              ) : (
                                <img
                                  src={
                                    attachment
                                  }
                                  alt="مرفق"
                                  className="attachment-image-mini"
                                />
                              )}

                              <span>
                                عرض المرفق
                              </span>
                            </button>
                          ) : (
                            <span className="no-attachment">
                              لا يوجد
                            </span>
                          )}
                        </div>

                        {/* STATUS */}

                        <div>
                          <span
                            className={`status-badge ${status.className}`}
                          >
                            <span className="status-dot">
                              {status.icon}
                            </span>

                            {status.text}
                          </span>
                        </div>

                        {/* ACTIONS */}

                        <div className="actions">
                          {statusKey ===
                            "pending" && (
                            <>
                              <button
                                type="button"
                                className="action-button accept"
                                title="قبول الطلب"
                                onClick={() =>
                                  requestStatusChange(
                                    leave.leave_id,
                                    "approved"
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaCheck />
                                <span className="action-tooltip">
                                  قبول
                                </span>
                              </button>

                              <button
                                type="button"
                                className="action-button reject"
                                title="رفض الطلب"
                                onClick={() =>
                                  requestStatusChange(
                                    leave.leave_id,
                                    "rejected"
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaTimes />
                                <span className="action-tooltip">
                                  رفض
                                </span>
                              </button>

                              <button
                                type="button"
                                className="action-button edit"
                                title="تعديل الطلب"
                                onClick={() =>
                                  openEditLeave(
                                    leave
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaEdit />
                                <span className="action-tooltip">
                                  تعديل
                                </span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="action-button view"
                            title="عرض التفاصيل"
                            onClick={() =>
                              setSelectedLeave(
                                leave
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            <FaEye />

                            <span className="action-tooltip">
                              عرض
                            </span>
                          </button>

                          <button
                            type="button"
                            className="action-button delete"
                            title="حذف الطلب"
                            onClick={() =>
                              requestDeleteLeave(
                                leave.leave_id
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            <FaTrash />

                            <span className="action-tooltip">
                              حذف
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="mobile-cards">
                {filteredLeaves.map(
                  (leave) => {
                    const status =
                      getStatusInfo(
                        leave.status
                      );

                    const statusKey =
                      status.key;

                    const attachment =
                      getAttachmentUrl(
                        leave
                      );

                    const days =
                      leave.days ||
                      calculateDays(
                        leave.from_date,
                        leave.to_date
                      );

                    return (
                      <div
                        className="mobile-leave-card"
                        key={
                          leave.leave_id
                        }
                      >
                        <div className="mobile-leave-top">
                          <div className="mobile-info">
                            <div className="avatar">
                              {getEmployeeName(
                                leave
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getEmployeeName(
                                  leave
                                )}
                              </strong>

                              <span>
                                {getEmployeeRole(
                                  leave
                                )}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`status-badge ${status.className}`}
                          >
                            {status.icon}
                            {status.text}
                          </span>
                        </div>

                        <div className="mobile-leave-grid">
                          <div>
                            <span>
                              نوع الإجازة
                            </span>

                            <strong>
                              {leave.type ||
                                leave.leave_type ||
                                "-"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              المدة
                            </span>

                            <strong>
                              {days} يوم
                            </strong>
                          </div>

                          <div>
                            <span>
                              من
                            </span>

                            <strong>
                              {formatDate(
                                leave.from_date
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              إلى
                            </span>

                            <strong>
                              {formatDate(
                                leave.to_date
                              )}
                            </strong>
                          </div>
                        </div>

                        {attachment && (
                          <button
                            type="button"
                            className="mobile-attachment"
                            onClick={() =>
                              openAttachment(
                                leave
                              )
                            }
                          >
                            <FaPaperclip />
                            عرض المرفق
                          </button>
                        )}

                        <div className="mobile-actions">
                          {statusKey ===
                            "pending" && (
                            <>
                              <button
                                type="button"
                                className="mobile-action accept"
                                onClick={() =>
                                  requestStatusChange(
                                    leave.leave_id,
                                    "approved"
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaCheck />
                                قبول
                              </button>

                              <button
                                type="button"
                                className="mobile-action reject"
                                onClick={() =>
                                  requestStatusChange(
                                    leave.leave_id,
                                    "rejected"
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaTimes />
                                رفض
                              </button>

                              <button
                                type="button"
                                className="mobile-action edit"
                                onClick={() =>
                                  openEditLeave(
                                    leave
                                  )
                                }
                                disabled={
                                  saving
                                }
                              >
                                <FaEdit />
                                تعديل
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="mobile-action view"
                            onClick={() =>
                              setSelectedLeave(
                                leave
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            <FaEye />
                            عرض التفاصيل
                          </button>

                          <button
                            type="button"
                            className="mobile-action delete"
                            onClick={() =>
                              requestDeleteLeave(
                                leave.leave_id
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            <FaTrash />
                            حذف الطلب
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      {confirmModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!saving) {
              setConfirmModal(null);
            }
          }}
        >
          <div
            className={`confirm-modal ${
              confirmModal.type
            }`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="confirm-icon">
              {confirmModal.icon}
            </div>

            <h3>
              {confirmModal.title}
            </h3>

            <p>
              {confirmModal.message}
            </p>

            <div className="confirm-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setConfirmModal(null)
                }
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                type="button"
                className={`confirm-button ${confirmModal.type}`}
                onClick={confirmAction}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner" />
                    جاري التنفيذ...
                  </>
                ) : (
                  <>
                    {confirmModal.type ===
                      "approve" && (
                      <FaCheck />
                    )}

                    {confirmModal.type ===
                      "reject" && (
                      <FaTimes />
                    )}

                    {confirmModal.type ===
                      "delete" && (
                      <FaTrash />
                    )}

                    {confirmModal.confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedLeave && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedLeave(null)
          }
        >
          <div
            className="modal details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div className="modal-heading">
                <div className="modal-icon">
                  <FaFileAlt />
                </div>

                <div>
                  <h3 className="modal-title">
                    تفاصيل طلب الإجازة
                  </h3>

                  <p className="modal-subtitle">
                    معلومات الطلب والموظف
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setSelectedLeave(null)
                }
              >
                <FaClose />
              </button>
            </div>

            <div className="modal-body">
              <div className="employee-profile">
                <div className="large-avatar">
                  {getEmployeeName(
                    selectedLeave
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h4>
                    {getEmployeeName(
                      selectedLeave
                    )}
                  </h4>

                  <span>
                    {getEmployeeRole(
                      selectedLeave
                    )}
                  </span>
                </div>

                <span
                  className={`status-badge ${
                    getStatusInfo(
                      selectedLeave.status
                    ).className
                  }`}
                >
                  {
                    getStatusInfo(
                      selectedLeave.status
                    ).icon
                  }

                  {
                    getStatusInfo(
                      selectedLeave.status
                    ).text
                  }
                </span>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span>
                    <FaCalendarAlt />
                    نوع الإجازة
                  </span>

                  <strong>
                    {selectedLeave.type ||
                      selectedLeave.leave_type ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    <FaClock />
                    عدد الأيام
                  </span>

                  <strong>
                    {selectedLeave.days ||
                      calculateDays(
                        selectedLeave.from_date,
                        selectedLeave.to_date
                      )}{" "}
                    يوم
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    من
                  </span>

                  <strong>
                    {formatDate(
                      selectedLeave.from_date
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    إلى
                  </span>

                  <strong>
                    {formatDate(
                      selectedLeave.to_date
                    )}
                  </strong>
                </div>
              </div>

              <div className="notes-box">
                <span>
                  الملاحظات
                </span>

                <p>
                  {selectedLeave.notes ||
                    "لا توجد ملاحظات مضافة"}
                </p>
              </div>

              {getAttachmentUrl(
                selectedLeave
              ) && (
                <button
                  type="button"
                  className="modal-attachment-button"
                  onClick={() =>
                    openAttachment(
                      selectedLeave
                    )
                  }
                >
                  <FaPaperclip />
                  عرض المرفق
                  <FaEye />
                </button>
              )}
            </div>

            <div className="modal-footer">
              {getStatusKey(
                selectedLeave.status
              ) === "pending" && (
                <>
                  <button
                    type="button"
                    className="modal-action-button accept"
                    onClick={() =>
                      requestStatusChange(
                        selectedLeave.leave_id,
                        "approved"
                      )
                    }
                  >
                    <FaCheck />
                    قبول الطلب
                  </button>

                  <button
                    type="button"
                    className="modal-action-button reject"
                    onClick={() =>
                      requestStatusChange(
                        selectedLeave.leave_id,
                        "rejected"
                      )
                    }
                  >
                    <FaTimes />
                    رفض الطلب
                  </button>

                  <button
                    type="button"
                    className="modal-action-button edit"
                    onClick={() => {
                      openEditLeave(
                        selectedLeave
                      );
                      setSelectedLeave(null);
                    }}
                  >
                    <FaEdit />
                    تعديل
                  </button>
                </>
              )}

              <button
                type="button"
                className="modal-action-button delete"
                onClick={() =>
                  requestDeleteLeave(
                    selectedLeave.leave_id
                  )
                }
              >
                <FaTrash />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editingLeave && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!saving) {
              closeEditModal();
            }
          }}
        >
          <div
            className="modal edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div className="modal-heading">
                <div className="modal-icon edit-icon">
                  <FaEdit />
                </div>

                <div>
                  <h3 className="modal-title">
                    تعديل طلب الإجازة
                  </h3>

                  <p className="modal-subtitle">
                    تعديل بيانات طلب الموظف
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeEditModal}
                disabled={saving}
              >
                <FaClose />
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-employee-preview">
                <div className="avatar">
                  {getEmployeeName(
                    editingLeave
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {getEmployeeName(
                      editingLeave
                    )}
                  </strong>

                  <span>
                    تعديل بيانات الإجازة
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  نوع الإجازة
                </label>

                <div className="input-with-icon">
                  <FaCalendarAlt />

                  <select
                    className="form-input"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      اختر نوع الإجازة
                    </option>

                    {leaveTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="edit-date-grid">
                <div className="form-group">
                  <label className="form-label">
                    تاريخ البداية
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={
                      editForm.from_date
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        from_date:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    تاريخ النهاية
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={
                      editForm.to_date
                    }
                    min={
                      editForm.from_date ||
                      undefined
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        to_date:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {editForm.from_date &&
                editForm.to_date &&
                calculateDays(
                  editForm.from_date,
                  editForm.to_date
                ) > 0 && (
                  <div className="days-preview">
                    <FaCalendarAlt />

                    <span>
                      مدة الإجازة
                    </span>

                    <strong>
                      {calculateDays(
                        editForm.from_date,
                        editForm.to_date
                      )}{" "}
                      يوم
                    </strong>
                  </div>
                )}

              <div className="form-group">
                <label className="form-label">
                  الملاحظات
                </label>

                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="اكتب الملاحظات هنا..."
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer edit-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={closeEditModal}
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                type="button"
                className="save-button"
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
                    <FaSave />
                    حفظ التعديلات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ATTACHMENT MODAL
      ===================================================== */}

      {selectedAttachment && (
        <div
          className="modal-overlay attachment-overlay"
          onClick={() =>
            setSelectedAttachment(null)
          }
        >
          <div
            className="attachment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="attachment-modal-header">
              <div>
                <h3>
                  مرفق طلب الإجازة
                </h3>

                <p>
                  {selectedAttachment.employeeName}
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setSelectedAttachment(null)
                }
              >
                <FaClose />
              </button>
            </div>

            <div className="attachment-modal-body">
              {selectedAttachment.isPdf ? (
                <iframe
                  src={
                    selectedAttachment.url
                  }
                  title="مرفق الإجازة"
                  className="pdf-viewer"
                />
              ) : (
                <img
                  src={
                    selectedAttachment.url
                  }
                  alt="مرفق الإجازة"
                  className="attachment-full-image"
                />
              )}
            </div>

            <div className="attachment-modal-footer">
              <a
                href={
                  selectedAttachment.url
                }
                target="_blank"
                rel="noreferrer"
                className="download-button"
              >
                <FaDownload />
                فتح / تحميل المرفق
              </a>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedAttachment(
                    null
                  )
                }
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
