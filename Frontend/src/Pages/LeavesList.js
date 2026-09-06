import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
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
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperclip,
  FaDownload,
  FaSave,
  FaUser,
  FaBriefcase,
  FaRegCalendarAlt,
  FaStickyNote,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./LeaveList.css";

export default function LeavesList() {
  // =========================================================
  // STATES
  // =========================================================

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const [editingLeave, setEditingLeave] = useState(null);

  const nav = useNavigate();

  const [editForm, setEditForm] = useState({
    type: "",
    from_date: "",
    to_date: "",
    notes: "",
    attachment: null,
  });

  const [confirmModal, setConfirmModal] = useState(null);

  const [messageModal, setMessageModal] = useState(null);

  const [actionLoading, setActionLoading] = useState(null);

  // =========================================================
  // MESSAGE MODAL
  // =========================================================

  const showMessage = ({ type = "info", title = "تنبيه", message = "" }) => {
    setMessageModal({
      type,
      title,
      message,
    });
  };

  const closeMessageModal = () => {
    setMessageModal(null);
  };

  // =========================================================
  // FETCH
  // =========================================================

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/leaves");

      const data = Array.isArray(res.data) ? res.data : res.data?.leaves || [];

      setLeaves(data);
    } catch (error) {
      console.error("Fetch Leaves Error:", error);

      showMessage({
        type: "error",
        title: "حدث خطأ",
        message: error.response?.data?.message || "فشل تحميل طلبات الإجازات.",
      });
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
      leave?.employee_name ||
      leave?.employee_full_name ||
      leave?.full_name ||
      leave?.employee?.name ||
      leave?.name ||
      "غير معروف"
    );
  };

  const getEmployeeRole = (leave) => {
    return (
      leave?.employee_role ||
      leave?.job_title ||
      leave?.position ||
      leave?.employee?.role ||
      leave?.role ||
      "موظف"
    );
  };

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (
      value === "approved" ||
      value === "accepted" ||
      value === "مقبول" ||
      value === "مقبولة"
    ) {
      return "approved";
    }

    if (
      value === "rejected" ||
      value === "رفض" ||
      value === "مرفوض" ||
      value === "مرفوضة"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "approved") {
      return "مقبولة";
    }

    if (normalized === "rejected") {
      return "مرفوضة";
    }

    return "قيد الانتظار";
  };

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "approved") {
      return "status-approved";
    }

    if (normalized === "rejected") {
      return "status-rejected";
    }

    return "status-pending";
  };

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "approved") {
      return <FaCheckCircle />;
    }

    if (normalized === "rejected") {
      return <FaTimesCircle />;
    }

    return <FaClock />;
  };

  const getLeaveTypeLabel = (type) => {
    if (!type) return "-";

    const value = String(type).trim();

    const map = {
      annual: "إجازة سنوية",
      yearly: "إجازة سنوية",
      vacation: "إجازة سنوية",
      sick: "إجازة مرضية",
      emergency: "إجازة طارئة",
      unpaid: "إجازة بدون راتب",
      maternity: "إجازة أمومة",
      paternity: "إجازة أبوة",
      marriage: "إجازة زواج",
      bereavement: "إجازة وفاة",
      "إجازة سنوية": "إجازة سنوية",
      "إجازة مرضية": "إجازة مرضية",
      "إجازة طارئة": "إجازة طارئة",
      "إجازة بدون راتب": "إجازة بدون راتب",
      "إجازة أمومة": "إجازة أمومة",
      "إجازة أبوة": "إجازة أبوة",
      "إجازة زواج": "إجازة زواج",
      "إجازة وفاة": "إجازة وفاة",
    };

    return map[value] || value;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatInputDate = (date) => {
    if (!date) return "";

    const value = String(date);

    if (value.includes("T")) {
      return value.split("T")[0];
    }

    return value.substring(0, 10);
  };

  const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;

    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T00:00:00`);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return 0;
    }

    if (to < from) return 0;

    return (
      Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  const getAttachmentUrl = (leave) => {
    return (
      leave?.attachment || leave?.attachment_url || leave?.file_url || null
    );
  };

  const isPdfFile = (url) => {
    if (!url) return false;

    return String(url).toLowerCase().includes(".pdf");
  };

  const isImageFile = (url) => {
    if (!url) return false;

    const value = String(url).toLowerCase();

    return (
      value.includes(".jpg") ||
      value.includes(".jpeg") ||
      value.includes(".png") ||
      value.includes(".webp")
    );
  };

  // =========================================================
  // FILTERS
  // =========================================================

  const leaveTypes = useMemo(() => {
    const types = leaves.map((leave) => leave?.type).filter(Boolean);

    return [...new Set(types)];
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    const searchValue = String(search || "")
      .trim()
      .toLowerCase();

    return leaves.filter((leave) => {
      const employeeName = getEmployeeName(leave).toLowerCase();

      const type = String(leave?.type || "").toLowerCase();

      const notes = String(leave?.notes || "").toLowerCase();

      const matchesSearch =
        !searchValue ||
        employeeName.includes(searchValue) ||
        type.includes(searchValue) ||
        notes.includes(searchValue);

      const matchesType =
        !filterType || String(leave?.type || "") === filterType;

      const matchesStatus =
        !filterStatus || normalizeStatus(leave?.status) === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leaves, search, filterType, filterStatus]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    leaves.forEach((leave) => {
      const status = normalizeStatus(leave.status);

      if (status === "pending") {
        pending++;
      } else if (status === "approved") {
        approved++;
      } else if (status === "rejected") {
        rejected++;
      }
    });

    return {
      total: leaves.length,
      pending,
      approved,
      rejected,
    };
  }, [leaves]);

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterStatus("");
  };

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const openDetails = (leave) => {
    setSelectedLeave(leave);
  };

  const closeDetails = () => {
    if (saving) return;

    setSelectedLeave(null);
  };

  // =========================================================
  // ATTACHMENT
  // =========================================================

  const openAttachment = (leave) => {
    const url = getAttachmentUrl(leave);

    if (!url) {
      showMessage({
        type: "warning",
        title: "لا يوجد مرفق",
        message: "طلب الإجازة هذا لا يحتوي على مرفق.",
      });

      return;
    }

    setSelectedAttachment({
      url,
      employeeName: getEmployeeName(leave),
      isPdf: isPdfFile(url),
      isImage: isImageFile(url),
    });
  };

  const closeAttachment = () => {
    setSelectedAttachment(null);
  };

  // =========================================================
  // STATUS CONFIRMATION
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

      return;
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

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (id, status) => {
    try {
      setSaving(true);
      setActionLoading(`${status}-${id}`);

      const res = await API.put(`/leaves/${id}`, { status });

      const updatedLeave = res.data?.leave;

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id === id
            ? {
                ...leave,
                ...(updatedLeave || {}),
                status: updatedLeave?.status || status,
              }
            : leave,
        ),
      );

      setSelectedLeave(null);
      setConfirmModal(null);

      showMessage({
        type: status === "approved" ? "success" : "warning",
        title: status === "approved" ? "تم قبول الإجازة" : "تم رفض الإجازة",
        message:
          status === "approved"
            ? "تم قبول طلب الإجازة بنجاح. يمكنك تعديل الطلب لاحقًا إذا احتجت."
            : "تم رفض طلب الإجازة بنجاح. يمكنك تعديل الطلب لاحقًا إذا احتجت.",
      });
    } catch (error) {
      console.error("Update Leave Status Error:", error);

      showMessage({
        type: "error",
        title: "فشل تحديث الحالة",
        message: error.response?.data?.message || "فشل تحديث حالة طلب الإجازة.",
      });
    } finally {
      setSaving(false);
      setActionLoading(null);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const requestDelete = (id) => {
    const leave = leaves.find((item) => item.leave_id === id);

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

      setLeaves((prev) => prev.filter((leave) => leave.leave_id !== id));

      setSelectedLeave(null);
      setConfirmModal(null);

      showMessage({
        type: "success",
        title: "تم الحذف",
        message: "تم حذف طلب الإجازة بنجاح.",
      });
    } catch (error) {
      console.error("Delete Leave Error:", error);

      showMessage({
        type: "error",
        title: "فشل الحذف",
        message: error.response?.data?.message || "فشل حذف طلب الإجازة.",
      });
    } finally {
      setSaving(false);
      setActionLoading(null);
    }
  };

  // =========================================================
  // CONFIRM ACTION
  // =========================================================

  const confirmAction = () => {
    if (!confirmModal) return;

    if (confirmModal.type === "approve" || confirmModal.type === "reject") {
      updateStatus(confirmModal.id, confirmModal.status);

      return;
    }

    if (confirmModal.type === "delete") {
      deleteLeave(confirmModal.id);
    }
  };

  const closeConfirmModal = () => {
    if (saving) return;

    setConfirmModal(null);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEditModal = (leave) => {
    setEditingLeave(leave);

    setEditForm({
      type: leave?.type || "",
      from_date: formatInputDate(leave?.from_date),
      to_date: formatInputDate(leave?.to_date),
      notes: leave?.notes || "",
      attachment: null,
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
      attachment: null,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setEditForm((prev) => ({
        ...prev,
        attachment: null,
      }));

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      showMessage({
        type: "warning",
        title: "نوع الملف غير مسموح",
        message: "يسمح فقط برفع JPG أو PNG أو WEBP أو PDF.",
      });

      e.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage({
        type: "warning",
        title: "حجم الملف كبير",
        message: "حجم المرفق يجب ألا يتجاوز 5 ميجابايت.",
      });

      e.target.value = "";

      return;
    }

    setEditForm((prev) => ({
      ...prev,
      attachment: file,
    }));
  };

  const saveEdit = async () => {
    if (!editingLeave) return;

    if (!editForm.type.trim()) {
      showMessage({
        type: "warning",
        title: "نوع الإجازة مطلوب",
        message: "يرجى اختيار نوع الإجازة.",
      });

      return;
    }

    if (!editForm.from_date || !editForm.to_date) {
      showMessage({
        type: "warning",
        title: "التاريخ مطلوب",
        message: "يرجى إدخال تاريخ البداية والنهاية.",
      });

      return;
    }

    const days = calculateDays(editForm.from_date, editForm.to_date);

    if (days <= 0) {
      showMessage({
        type: "warning",
        title: "التواريخ غير صحيحة",
        message: "تاريخ النهاية يجب أن يكون بعد أو مساويًا لتاريخ البداية.",
      });

      return;
    }

    if (editForm.attachment) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
        "application/pdf",
      ];

      if (!allowedTypes.includes(editForm.attachment.type)) {
        showMessage({
          type: "warning",
          title: "نوع الملف غير مسموح",
          message: "يسمح فقط برفع JPG أو PNG أو WEBP أو PDF.",
        });

        return;
      }

      if (editForm.attachment.size > 5 * 1024 * 1024) {
        showMessage({
          type: "warning",
          title: "حجم الملف كبير",
          message: "حجم المرفق يجب ألا يتجاوز 5 ميجابايت.",
        });

        return;
      }
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("type", editForm.type.trim());

      formData.append("from_date", editForm.from_date);

      formData.append("to_date", editForm.to_date);

      formData.append("notes", editForm.notes || "");

      if (editForm.attachment) {
        formData.append("attachment", editForm.attachment);
      }

      const res = await API.put(
        `/leaves/edit/${editingLeave.leave_id}`,
        formData,
      );

      const updatedLeave = res.data?.leave;

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id === editingLeave.leave_id
            ? {
                ...leave,
                ...(updatedLeave || {}),
              }
            : leave,
        ),
      );

      setEditingLeave(null);

      setEditForm({
        type: "",
        from_date: "",
        to_date: "",
        notes: "",
        attachment: null,
      });

      showMessage({
        type: "success",
        title: "تم التعديل",
        message: "تم تعديل طلب الإجازة بنجاح.",
      });
    } catch (error) {
      console.error("Edit Leave Error:", error);

      showMessage({
        type: "error",
        title: "فشل التعديل",
        message: error.response?.data?.message || "فشل تعديل طلب الإجازة.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  const exportToExcel = () => {
    if (!filteredLeaves.length) {
      showMessage({
        type: "warning",
        title: "لا توجد بيانات",
        message: "لا توجد بيانات لتصديرها حسب الفلاتر الحالية.",
      });

      return;
    }

    const data = filteredLeaves.map((leave, index) => ({
      "#": index + 1,
      الموظف: getEmployeeName(leave),
      الوظيفة: getEmployeeRole(leave),
      "نوع الإجازة": getLeaveTypeLabel(leave.type),
      "تاريخ البداية": formatDate(leave.from_date),
      "تاريخ النهاية": formatDate(leave.to_date),
      "عدد الأيام": leave.days ?? "-",
      الحالة: getStatusLabel(leave.status),
      الملاحظات: leave.notes || "-",
      المرفق: getAttachmentUrl(leave) ? "نعم" : "لا",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "طلبات الإجازات");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `طلبات_الإجازات_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );

    showMessage({
      type: "success",
      title: "تم التصدير",
      message: "تم تصدير طلبات الإجازات إلى ملف Excel بنجاح.",
    });
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
            <span>الرئيسية</span>

            <span className="breadcrumb-arrow">/</span>

            <strong>طلبات الإجازات</strong>
          </div>

          <div className="title-wrapper">
            <div className="title-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h1 className="page-title">طلبات الإجازات</h1>

              <p className="page-description">
                إدارة ومتابعة طلبات إجازات الموظفين
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
            <FaSyncAlt className={loading ? "refresh-spin" : ""} />
            تحديث
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => nav("/leave")}
          >
            <FaCalendarAlt />
            إضافة إجازة
          </button>
          
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="content">
        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="stats-grid">
          <div className="stat-card total-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>

              <span className="stat-mini">جميع الطلبات</span>
            </div>

            <span className="stat-label">إجمالي الطلبات</span>

            <strong className="stat-number">{statistics.total}</strong>
          </div>

          <div className="stat-card pending-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaClock />
              </div>

              <span className="stat-mini">بحاجة للمراجعة</span>
            </div>

            <span className="stat-label">قيد الانتظار</span>

            <strong className="stat-number">{statistics.pending}</strong>
          </div>

          <div className="stat-card approved-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>

              <span className="stat-mini">تمت الموافقة</span>
            </div>

            <span className="stat-label">الإجازات المقبولة</span>

            <strong className="stat-number">{statistics.approved}</strong>
          </div>

          <div className="stat-card rejected-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FaTimesCircle />
              </div>

              <span className="stat-mini">غير مقبولة</span>
            </div>

            <span className="stat-label">الإجازات المرفوضة</span>

            <strong className="stat-number">{statistics.rejected}</strong>
          </div>
        </div>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="toolbar">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              className="search-input"
              placeholder="ابحث باسم الموظف أو نوع الإجازة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                title="مسح البحث"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="filters">
            <select
              className="select-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">جميع أنواع الإجازات</option>

              {leaveTypes.map((type) => (
                <option key={type} value={type}>
                  {getLeaveTypeLabel(type)}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">جميع الحالات</option>

              <option value="pending">قيد الانتظار</option>

              <option value="approved">مقبولة</option>

              <option value="rejected">مرفوضة</option>
            </select>

            <button
              type="button"
              className="excel-button"
              onClick={exportToExcel}
            >
              <FaFileExcel />
              Excel
            </button>

            {(search || filterType || filterStatus) && (
              <button
                type="button"
                className="reset-filters"
                onClick={resetFilters}
              >
                <FaSyncAlt />
                إعادة ضبط
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            TABLE CONTAINER
        =================================================== */}

        <section className="table-container">
          <div className="table-header">
            <div className="section-title-row">
              <div className="count-badge">{filteredLeaves.length}</div>

              <div>
                <h2 className="section-title">قائمة طلبات الإجازات</h2>

                <p className="results-count">
                  عرض <strong>{filteredLeaves.length}</strong> من أصل{" "}
                  <strong>{leaves.length}</strong> طلب
                </p>
              </div>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={fetchLeaves}
              disabled={loading}
              title="تحديث"
            >
              <FaSyncAlt className={loading ? "refresh-spin" : ""} />
            </button>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>

              <p>جاري تحميل طلبات الإجازات...</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaCalendarAlt />
              </div>

              <h3>لا توجد طلبات إجازات</h3>

              <p>لا توجد طلبات مطابقة للبحث أو الفلاتر الحالية.</p>

              {(search || filterType || filterStatus) && (
                <button
                  type="button"
                  className="reset-filters empty-reset"
                  onClick={resetFilters}
                >
                  <FaSyncAlt />
                  إعادة ضبط الفلاتر
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =============================================
                  DESKTOP TABLE
              ============================================= */}

              <div className="desktop-table">
                <div className="table-head">
                  <div>الموظف</div>
                  <div>نوع الإجازة</div>
                  <div>من</div>
                  <div>إلى</div>
                  <div>الحالة</div>
                  <div>المرفق</div>
                  <div>الإجراءات</div>
                </div>

                {filteredLeaves.map((leave) => {
                  const status = normalizeStatus(leave.status);

                  return (
                    <div className="table-row" key={leave.leave_id}>
                      {/* EMPLOYEE */}
                      <div>
                        <div className="employee-cell">
                          <div className="avatar">
                            {getEmployeeName(leave).charAt(0).toUpperCase()}
                          </div>

                          <div className="employee-info">
                            <strong className="employee-name">
                              {getEmployeeName(leave)}
                            </strong>

                            <span className="employee-role">
                              {getEmployeeRole(leave)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TYPE */}
                      <div>
                        <span className="leave-type-badge">
                          <FaFileAlt />

                          {getLeaveTypeLabel(leave.type)}
                        </span>
                      </div>

                      {/* FROM */}
                      <div className="date-cell">
                        {formatDate(leave.from_date)}
                      </div>

                      {/* TO */}
                      <div className="date-cell">
                        {formatDate(leave.to_date)}
                      </div>

                      {/* STATUS */}
                      <div>
                        <span
                          className={`status-badge ${getStatusClass(
                            leave.status,
                          )}`}
                        >
                          <span className="status-dot">
                            {getStatusIcon(leave.status)}
                          </span>

                          {getStatusLabel(leave.status)}
                        </span>
                      </div>

                      {/* ATTACHMENT */}
                      <div>
                        <div className="attachment-cell">
                          {getAttachmentUrl(leave) ? (
                            <button
                              type="button"
                              className="attachment-preview-button"
                              onClick={() => openAttachment(leave)}
                            >
                              {isImageFile(getAttachmentUrl(leave)) ? (
                                <img
                                  src={getAttachmentUrl(leave)}
                                  alt=""
                                  className="attachment-image-mini"
                                />
                              ) : (
                                <FaPaperclip />
                              )}
                              عرض
                            </button>
                          ) : (
                            <span className="no-attachment">لا يوجد</span>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div>
                        <div className="actions">
                          {/* ACCEPT */}
                          {status === "pending" && (
                            <button
                              type="button"
                              className="action-button accept"
                              onClick={() =>
                                requestStatusChange(leave.leave_id, "approved")
                              }
                              disabled={saving}
                            >
                              <FaCheck />

                              <span className="action-tooltip">قبول</span>
                            </button>
                          )}

                          {/* REJECT */}
                          {status === "pending" && (
                            <button
                              type="button"
                              className="action-button reject"
                              onClick={() =>
                                requestStatusChange(leave.leave_id, "rejected")
                              }
                              disabled={saving}
                            >
                              <FaTimes />

                              <span className="action-tooltip">رفض</span>
                            </button>
                          )}

                          {/* EDIT - ALWAYS */}
                          <button
                            type="button"
                            className="action-button edit"
                            onClick={() => openEditModal(leave)}
                            disabled={saving}
                          >
                            <FaEdit />

                            <span className="action-tooltip">تعديل</span>
                          </button>

                          {/* VIEW */}
                          <button
                            type="button"
                            className="action-button view"
                            onClick={() => openDetails(leave)}
                            disabled={saving}
                          >
                            <FaEye />

                            <span className="action-tooltip">عرض</span>
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            className="action-button delete"
                            onClick={() => requestDelete(leave.leave_id)}
                            disabled={saving}
                          >
                            <FaTrash />

                            <span className="action-tooltip">حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* =============================================
                  MOBILE CARDS
              ============================================= */}

              <div className="mobile-cards">
                {filteredLeaves.map((leave) => {
                  const status = normalizeStatus(leave.status);

                  return (
                    <div className="mobile-leave-card" key={leave.leave_id}>
                      <div className="mobile-leave-top">
                        <div className="mobile-info">
                          <div className="avatar">
                            {getEmployeeName(leave).charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{getEmployeeName(leave)}</strong>

                            <span>{getEmployeeRole(leave)}</span>
                          </div>
                        </div>

                        <span
                          className={`status-badge ${getStatusClass(
                            leave.status,
                          )}`}
                        >
                          <span className="status-dot">
                            {getStatusIcon(leave.status)}
                          </span>

                          {getStatusLabel(leave.status)}
                        </span>
                      </div>

                      <div className="mobile-leave-grid">
                        <div>
                          <span>نوع الإجازة</span>

                          <strong>{getLeaveTypeLabel(leave.type)}</strong>
                        </div>

                        <div>
                          <span>عدد الأيام</span>

                          <strong>
                            {leave.days ??
                              calculateDays(
                                formatInputDate(leave.from_date),
                                formatInputDate(leave.to_date),
                              )}{" "}
                            يوم
                          </strong>
                        </div>

                        <div>
                          <span>تاريخ البداية</span>

                          <strong>{formatDate(leave.from_date)}</strong>
                        </div>

                        <div>
                          <span>تاريخ النهاية</span>

                          <strong>{formatDate(leave.to_date)}</strong>
                        </div>
                      </div>

                      {leave.notes && (
                        <div className="mobile-leave-grid">
                          <div
                            style={{
                              gridColumn: "1 / -1",
                            }}
                          >
                            <span>الملاحظات</span>

                            <strong>{leave.notes}</strong>
                          </div>
                        </div>
                      )}

                      {getAttachmentUrl(leave) && (
                        <button
                          type="button"
                          className="mobile-attachment"
                          onClick={() => openAttachment(leave)}
                        >
                          <FaPaperclip />
                          عرض المرفق
                        </button>
                      )}

                      <div className="mobile-actions">
                        {/* ACCEPT */}
                        {status === "pending" && (
                          <button
                            type="button"
                            className="mobile-action accept"
                            onClick={() =>
                              requestStatusChange(leave.leave_id, "approved")
                            }
                            disabled={saving}
                          >
                            <FaCheck />
                            قبول
                          </button>
                        )}

                        {/* REJECT */}
                        {status === "pending" && (
                          <button
                            type="button"
                            className="mobile-action reject"
                            onClick={() =>
                              requestStatusChange(leave.leave_id, "rejected")
                            }
                            disabled={saving}
                          >
                            <FaTimes />
                            رفض
                          </button>
                        )}

                        {/* EDIT ALWAYS */}
                        <button
                          type="button"
                          className="mobile-action edit"
                          onClick={() => openEditModal(leave)}
                          disabled={saving}
                        >
                          <FaEdit />
                          تعديل
                        </button>

                        {/* VIEW */}
                        <button
                          type="button"
                          className="mobile-action view"
                          onClick={() => openDetails(leave)}
                          disabled={saving}
                        >
                          <FaEye />
                          عرض
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          className="mobile-action delete"
                          onClick={() => requestDelete(leave.leave_id)}
                          disabled={saving}
                        >
                          <FaTrash />
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedLeave && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-heading">
                <div className="modal-icon">
                  <FaCalendarAlt />
                </div>

                <div>
                  <h3 className="modal-title">تفاصيل طلب الإجازة</h3>

                  <p className="modal-subtitle">معلومات وتفاصيل الطلب</p>
                </div>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeDetails}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="employee-profile">
                <div className="large-avatar">
                  {getEmployeeName(selectedLeave).charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4>{getEmployeeName(selectedLeave)}</h4>

                  <span>{getEmployeeRole(selectedLeave)}</span>
                </div>

                <span
                  className={`status-badge ${getStatusClass(
                    selectedLeave.status,
                  )}`}
                >
                  <span className="status-dot">
                    {getStatusIcon(selectedLeave.status)}
                  </span>

                  {getStatusLabel(selectedLeave.status)}
                </span>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span>
                    <FaFileAlt />
                    نوع الإجازة
                  </span>

                  <strong>{getLeaveTypeLabel(selectedLeave.type)}</strong>
                </div>

                <div className="detail-item">
                  <span>
                    <FaClock />
                    عدد الأيام
                  </span>

                  <strong>
                    {selectedLeave.days ??
                      calculateDays(
                        formatInputDate(selectedLeave.from_date),
                        formatInputDate(selectedLeave.to_date),
                      )}{" "}
                    يوم
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    <FaRegCalendarAlt />
                    تاريخ البداية
                  </span>

                  <strong>{formatDate(selectedLeave.from_date)}</strong>
                </div>

                <div className="detail-item">
                  <span>
                    <FaRegCalendarAlt />
                    تاريخ النهاية
                  </span>

                  <strong>{formatDate(selectedLeave.to_date)}</strong>
                </div>
              </div>

              {selectedLeave.notes && (
                <div className="notes-box">
                  <span>
                    <FaStickyNote /> الملاحظات
                  </span>

                  <p>{selectedLeave.notes}</p>
                </div>
              )}

              {getAttachmentUrl(selectedLeave) && (
                <button
                  type="button"
                  className="modal-attachment-button"
                  onClick={() => openAttachment(selectedLeave)}
                >
                  <span>
                    <FaPaperclip />
                    عرض المرفق
                  </span>

                  <FaEye />
                </button>
              )}
            </div>

            <div className="modal-footer">
              {/* ACCEPT */}
              {normalizeStatus(selectedLeave.status) === "pending" && (
                <button
                  type="button"
                  className="modal-action-button accept"
                  onClick={() => {
                    setSelectedLeave(null);

                    requestStatusChange(selectedLeave.leave_id, "approved");
                  }}
                  disabled={saving}
                >
                  <FaCheck />
                  قبول
                </button>
              )}

              {/* REJECT */}
              {normalizeStatus(selectedLeave.status) === "pending" && (
                <button
                  type="button"
                  className="modal-action-button reject"
                  onClick={() => {
                    setSelectedLeave(null);

                    requestStatusChange(selectedLeave.leave_id, "rejected");
                  }}
                  disabled={saving}
                >
                  <FaTimes />
                  رفض
                </button>
              )}

              {/* EDIT ALWAYS */}
              <button
                type="button"
                className="modal-action-button edit"
                onClick={() => {
                  const leave = selectedLeave;

                  setSelectedLeave(null);

                  openEditModal(leave);
                }}
                disabled={saving}
              >
                <FaEdit />
                تعديل
              </button>

              {/* DELETE */}
              <button
                type="button"
                className="modal-action-button delete"
                onClick={() => {
                  const id = selectedLeave.leave_id;

                  setSelectedLeave(null);

                  requestDelete(id);
                }}
                disabled={saving}
              >
                <FaTrash />
                حذف
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeDetails}
                disabled={saving}
              >
                إغلاق
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-heading">
                <div className="modal-icon edit-icon">
                  <FaEdit />
                </div>

                <div>
                  <h3 className="modal-title">تعديل طلب الإجازة</h3>

                  <p className="modal-subtitle">تعديل بيانات طلب الموظف</p>
                </div>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeEditModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-employee-preview">
                <div className="avatar">
                  {getEmployeeName(editingLeave).charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{getEmployeeName(editingLeave)}</strong>

                  <span>{getEmployeeRole(editingLeave)}</span>
                </div>
              </div>

              {/* TYPE */}
              <div className="form-group">
                <label className="form-label">نوع الإجازة</label>

                <div className="input-with-icon">
                  <FaFileAlt />

                  <select
                    name="type"
                    className="form-input"
                    value={editForm.type}
                    onChange={handleEditChange}
                    disabled={saving}
                  >
                    <option value="">اختر نوع الإجازة</option>

                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {getLeaveTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DATES */}
              <div className="edit-date-grid">
                <div className="form-group">
                  <label className="form-label">تاريخ البداية</label>

                  <div className="input-with-icon">
                    <FaCalendarAlt />

                    <input
                      type="date"
                      name="from_date"
                      className="form-input"
                      value={editForm.from_date}
                      onChange={handleEditChange}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">تاريخ النهاية</label>

                  <div className="input-with-icon">
                    <FaCalendarAlt />

                    <input
                      type="date"
                      name="to_date"
                      className="form-input"
                      value={editForm.to_date}
                      min={editForm.from_date || undefined}
                      onChange={handleEditChange}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* DAYS */}
              {editForm.from_date && editForm.to_date && (
                <div className="days-preview">
                  <FaClock />

                  <span>مدة الإجازة</span>

                  <strong>
                    {calculateDays(editForm.from_date, editForm.to_date)} يوم
                  </strong>
                </div>
              )}

              {/* NOTES */}
              <div className="form-group">
                <label className="form-label">الملاحظات</label>

                <textarea
                  name="notes"
                  className="form-textarea"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  placeholder="أدخل الملاحظات إن وجدت..."
                  disabled={saving}
                />
              </div>

              {/* ATTACHMENT */}
              <div className="form-group">
                <label className="form-label">المرفق</label>

                {getAttachmentUrl(editingLeave) && (
                  <button
                    type="button"
                    className="modal-attachment-button"
                    onClick={() => openAttachment(editingLeave)}
                    disabled={saving}
                  >
                    <span>
                      <FaPaperclip />
                      عرض المرفق الحالي
                    </span>

                    <FaEye />
                  </button>
                )}

                <label
                  className="attachment-preview-button"
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    justifyContent: "center",
                    minHeight: "42px",
                  }}
                >
                  <FaPaperclip />

                  <span>
                    {editForm.attachment
                      ? editForm.attachment.name
                      : "اختيار مرفق جديد"}
                  </span>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                    disabled={saving}
                    style={{
                      display: "none",
                    }}
                  />
                </label>

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#94a3b8",
                    fontSize: "9px",
                    fontWeight: 600,
                  }}
                >
                  JPG / PNG / WEBP / PDF — الحد الأقصى 5MB
                </small>
              </div>
            </div>

            <div className="modal-footer edit-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={closeEditModal}
                disabled={saving}
              >
                <FaTimes />
                إلغاء
              </button>

              <button
                type="button"
                className="save-button"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSyncAlt className="refresh-spin" />
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
          CONFIRM MODAL
      ===================================================== */}

      {confirmModal && (
        <div className="modal-overlay" onClick={closeConfirmModal}>
          <div
            className={`confirm-modal ${confirmModal.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon">{confirmModal.icon}</div>

            <h3>{confirmModal.title}</h3>

            <p>{confirmModal.message}</p>

            <div className="confirm-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={closeConfirmModal}
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
                    <span className="button-spinner"></span>
                    جاري التنفيذ...
                  </>
                ) : (
                  <>
                    {confirmModal.icon}
                    {confirmModal.confirmText}
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
        <div className="modal-overlay" onClick={closeAttachment}>
          <div
            className="attachment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="attachment-modal-header">
              <div>
                <h3>مرفق طلب الإجازة</h3>

                <p>{selectedAttachment.employeeName}</p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeAttachment}
              >
                <FaTimes />
              </button>
            </div>

            <div className="attachment-modal-body">
              {selectedAttachment.isPdf ? (
                <iframe
                  src={selectedAttachment.url}
                  title="مرفق الإجازة"
                  className="pdf-viewer"
                />
              ) : (
                <img
                  src={selectedAttachment.url}
                  alt="مرفق الإجازة"
                  className="attachment-full-image"
                />
              )}
            </div>

            <div className="attachment-modal-footer">
              <a
                href={selectedAttachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="download-button"
              >
                <FaEye />
                فتح
              </a>

              <a
                href={selectedAttachment.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="download-button"
              >
                <FaDownload />
                تحميل
              </a>

              <button
                type="button"
                className="secondary-button"
                onClick={closeAttachment}
              >
                <FaTimes />
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MESSAGE MODAL
      ===================================================== */}

      {messageModal && (
        <div
          className="modal-overlay message-overlay"
          onClick={closeMessageModal}
        >
          <div
            className={`message-modal ${messageModal.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="message-icon">
              {messageModal.type === "success" && <FaCheckCircle />}

              {messageModal.type === "error" && <FaTimesCircle />}

              {messageModal.type === "warning" && <FaClock />}

              {messageModal.type === "info" && <FaFileAlt />}
            </div>

            <h3>{messageModal.title}</h3>

            <p>{messageModal.message}</p>

            <button
              type="button"
              className={`message-button ${messageModal.type}`}
              onClick={closeMessageModal}
            >
              حسنًا
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
