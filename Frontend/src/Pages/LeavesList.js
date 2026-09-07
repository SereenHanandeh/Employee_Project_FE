import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FaExclamationTriangle,
  FaUndo,
  FaFilter,
  FaChevronDown,
  FaInfoCircle,
  FaCalendarCheck,
  FaHourglassHalf,
  FaBan,
  FaExternalLinkAlt,
} from "react-icons/fa";

import "./LeaveList.css";

export default function LeavesList() {
  const nav = useNavigate();

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
  // TRASH
  // =========================================================

  const [deletedLeaves, setDeletedLeaves] = useState([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [showTrash, setShowTrash] = useState(false);
  const [trashLoading, setTrashLoading] = useState(false);

  // =========================================================
  // MESSAGE MODAL
  // =========================================================

  const showMessage = ({
    type = "info",
    title = "تنبيه",
    message = "",
  }) => {
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
  // FETCH ACTIVE LEAVES
  // =========================================================

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/leaves");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.leaves || [];

      setLeaves(data);
    } catch (error) {
      console.error("Fetch Leaves Error:", error);

      showMessage({
        type: "error",
        title: "حدث خطأ",
        message:
          error.response?.data?.message ||
          "فشل تحميل طلبات الإجازات.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH DELETED LEAVES
  // =========================================================

  const fetchDeletedLeaves = async () => {
    try {
      setTrashLoading(true);

      const res = await API.get("/leaves/deleted");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.leaves || [];

      setDeletedLeaves(data);
      setDeletedCount(data.length);
    } catch (error) {
      console.error("Fetch Deleted Leaves Error:", error);

      showMessage({
        type: "error",
        title: "فشل تحميل السلة",
        message:
          error.response?.data?.message ||
          "حدث خطأ أثناء تحميل طلبات الإجازات المحذوفة.",
      });
    } finally {
      setTrashLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchLeaves();
    fetchDeletedLeaves();
  }, []);

  // =========================================================
  // EMPLOYEE HELPERS
  // =========================================================

  const getEmployeeName = (leave) => {
    return (
      leave?.employee_name ||
      leave?.name ||
      leave?.employee?.name ||
      leave?.employeeName ||
      "غير معروف"
    );
  };

  const getEmployeeRole = (leave) => {
    return (
      leave?.employee_role ||
      leave?.position ||
      leave?.employee?.position ||
      leave?.employeeRole ||
      "—"
    );
  };

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (
      value === "approved" ||
      value === "approve" ||
      value === "مقبولة" ||
      value === "مقبول" ||
      value === "approved "
    ) {
      return "approved";
    }

    if (
      value === "rejected" ||
      value === "reject" ||
      value === "مرفوضة" ||
      value === "مرفوض"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "approved") return "مقبولة";
    if (normalized === "rejected") return "مرفوضة";

    return "قيد المراجعة";
  };

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "approved") return "status-approved";
    if (normalized === "rejected") return "status-rejected";

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

  // =========================================================
  // LEAVE TYPE
  // =========================================================

  const getLeaveTypeLabel = (type) => {
    const value = String(type || "").trim();

    const map = {
      سنوية: "سنوية",
      مرضية: "مرضية",
      طارئة: "طارئة",
      بدون_راتب: "بدون راتب",
      "بدون راتب": "بدون راتب",
      أخرى: "أخرى",
      annual: "سنوية",
      sick: "مرضية",
      emergency: "طارئة",
      unpaid: "بدون راتب",
      other: "أخرى",
    };

    return map[value] || value || "غير محدد";
  };

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      const d = new Date(date);

      if (Number.isNaN(d.getTime())) {
        return "—";
      }

      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const formatInputDate = (date) => {
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

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return 0;
    }

    const diff = end.getTime() - start.getTime();

    if (diff < 0) return 0;

    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // =========================================================
  // ATTACHMENT HELPERS
  // =========================================================

  const getAttachmentUrl = (leave) => {
    return (
      leave?.attachment ||
      leave?.attachment_url ||
      leave?.attachmentUrl ||
      ""
    );
  };

  const isPdfFile = (url = "") => {
    return String(url).toLowerCase().includes(".pdf");
  };

  const isImageFile = (url = "") => {
    const value = String(url).toLowerCase();

    return (
      value.includes(".jpg") ||
      value.includes(".jpeg") ||
      value.includes(".png") ||
      value.includes(".webp") ||
      value.includes("image/")
    );
  };

  // =========================================================
  // LEAVE TYPES
  // =========================================================

  const leaveTypes = useMemo(() => {
    const types = leaves
      .map((leave) => leave?.type)
      .filter(Boolean)
      .map((type) => getLeaveTypeLabel(type));

    return [...new Set(types)];
  }, [leaves]);

  // =========================================================
  // FILTERED LEAVES
  // =========================================================

  const filteredLeaves = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return leaves.filter((leave) => {
      const employeeName = getEmployeeName(leave).toLowerCase();

      const employeeRole =
        getEmployeeRole(leave).toLowerCase();

      const type = getLeaveTypeLabel(leave.type).toLowerCase();

      const status = normalizeStatus(leave.status);

      const matchesSearch =
        !searchValue ||
        employeeName.includes(searchValue) ||
        employeeRole.includes(searchValue) ||
        type.includes(searchValue);

      const matchesType =
        !filterType ||
        getLeaveTypeLabel(leave.type) === filterType;

      const matchesStatus =
        !filterStatus ||
        status === filterStatus;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [leaves, search, filterType, filterStatus]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = leaves.length;

    const pending = leaves.filter(
      (leave) =>
        normalizeStatus(leave.status) === "pending"
    ).length;

    const approved = leaves.filter(
      (leave) =>
        normalizeStatus(leave.status) === "approved"
    ).length;

    const rejected = leaves.filter(
      (leave) =>
        normalizeStatus(leave.status) === "rejected"
    ).length;

    return {
      total,
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
  // DETAILS
  // =========================================================

  const openDetails = (leave) => {
    setSelectedLeave(leave);
  };

  const closeDetails = () => {
    setSelectedLeave(null);
  };

  // =========================================================
  // ATTACHMENT
  // =========================================================

  const openAttachment = (leave) => {
    const url = getAttachmentUrl(leave);

    if (!url) {
      showMessage({
        type: "info",
        title: "لا يوجد مرفق",
        message: "هذا الطلب لا يحتوي على مرفق.",
      });

      return;
    }

    setSelectedAttachment({
      url,
      leave,
    });
  };

  const closeAttachment = () => {
    setSelectedAttachment(null);
  };

  // =========================================================
  // STATUS CHANGE CONFIRMATION
  // =========================================================

  const requestStatusChange = (id, status) => {
    const leave = leaves.find(
      (item) => item.leave_id === id
    );

    if (!leave) return;

    const employeeName = getEmployeeName(leave);

    if (status === "approved") {
      setConfirmModal({
        type: "approve",
        id,
        title: "تأكيد قبول الطلب",
        message: `هل أنت متأكد من الموافقة على طلب الإجازة الخاص بالموظف "${employeeName}"؟`,
        confirmText: "نعم، الموافقة",
        icon: <FaCheck />,
      });

      return;
    }

    if (status === "rejected") {
      setConfirmModal({
        type: "reject",
        id,
        title: "تأكيد رفض الطلب",
        message: `هل أنت متأكد من رفض طلب الإجازة الخاص بالموظف "${employeeName}"؟`,
        confirmText: "نعم، رفض الطلب",
        icon: <FaTimes />,
      });
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(`${status}-${id}`);

      const res = await API.put(`/leaves/${id}`, {
        status,
      });

      const updatedLeave =
        res.data?.leave ||
        res.data ||
        null;

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id === id
            ? {
                ...leave,
                ...(updatedLeave || {}),
                status,
              }
            : leave
        )
      );

      if (selectedLeave?.leave_id === id) {
        setSelectedLeave((prev) =>
          prev
            ? {
                ...prev,
                ...(updatedLeave || {}),
                status,
              }
            : prev
        );
      }

      setConfirmModal(null);

      showMessage({
        type: "success",
        title:
          status === "approved"
            ? "تمت الموافقة"
            : "تم رفض الطلب",
        message:
          status === "approved"
            ? "تمت الموافقة على طلب الإجازة بنجاح."
            : "تم رفض طلب الإجازة بنجاح.",
      });
    } catch (error) {
      console.error("Update Leave Status Error:", error);

      showMessage({
        type: "error",
        title: "حدث خطأ",
        message:
          error.response?.data?.message ||
          "فشل تحديث حالة طلب الإجازة.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // DELETE REQUEST
  // =========================================================

  const requestDelete = (id) => {
    const leave = leaves.find(
      (item) => item.leave_id === id
    );

    if (!leave) return;

    const employeeName = getEmployeeName(leave);

    setConfirmModal({
      type: "delete",
      id,
      title: "نقل الطلب إلى السلة",
      message: `هل أنت متأكد من نقل طلب الإجازة الخاص بالموظف "${employeeName}" إلى السلة؟ يمكنك استعادته لاحقًا.`,
      confirmText: "نعم، نقل إلى السلة",
      icon: <FaTrash />,
    });
  };

  // =========================================================
  // DELETE LEAVE - SOFT DELETE
  // =========================================================

  const deleteLeave = async (id) => {
    try {
      setActionLoading(`delete-${id}`);

      const leaveToDelete = leaves.find(
        (leave) => leave.leave_id === id
      );

      await API.delete(`/leaves/${id}`);

      setLeaves((prev) =>
        prev.filter(
          (leave) => leave.leave_id !== id
        )
      );

      if (leaveToDelete) {
        setDeletedLeaves((prev) => [
          {
            ...leaveToDelete,
            is_deleted: 1,
          },
          ...prev,
        ]);

        setDeletedCount((prev) => prev + 1);
      }

      if (selectedLeave?.leave_id === id) {
        setSelectedLeave(null);
      }

      setConfirmModal(null);

      showMessage({
        type: "success",
        title: "تم نقل الطلب إلى السلة",
        message:
          "تم نقل طلب الإجازة إلى السلة، ويمكن استعادته لاحقًا.",
      });
    } catch (error) {
      console.error("Delete Leave Error:", error);

      showMessage({
        type: "error",
        title: "فشل الحذف",
        message:
          error.response?.data?.message ||
          "حدث خطأ أثناء نقل طلب الإجازة إلى السلة.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // CONFIRM ACTION
  // =========================================================

  const confirmAction = async () => {
    if (!confirmModal) return;

    const { type, id } = confirmModal;

    if (type === "approve") {
      await updateStatus(id, "approved");
      return;
    }

    if (type === "reject") {
      await updateStatus(id, "rejected");
      return;
    }

    if (type === "delete") {
      await deleteLeave(id);
    }
  };

  // =========================================================
  // OPEN TRASH
  // =========================================================

  const openTrash = async () => {
    setShowTrash(true);
    await fetchDeletedLeaves();
  };

  // =========================================================
  // RESTORE LEAVE
  // =========================================================

  const restoreLeave = async (id) => {
    try {
      setActionLoading(`restore-${id}`);

      const res = await API.put(
        `/leaves/${id}/restore`
      );

      const restoredLeave =
        res.data?.leave || null;

      setDeletedLeaves((prev) =>
        prev.filter(
          (item) => item.leave_id !== id
        )
      );

      setDeletedCount((prev) =>
        Math.max(0, prev - 1)
      );

      if (restoredLeave) {
        setLeaves((prev) => [
          restoredLeave,
          ...prev,
        ]);
      } else {
        await fetchLeaves();
      }

      showMessage({
        type: "success",
        title: "تمت الاستعادة",
        message:
          "تمت استعادة طلب الإجازة بنجاح.",
      });
    } catch (error) {
      console.error("Restore Leave Error:", error);

      showMessage({
        type: "error",
        title: "فشل الاستعادة",
        message:
          error.response?.data?.message ||
          "حدث خطأ أثناء استعادة طلب الإجازة.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // EDIT MODAL
  // =========================================================

  const openEditModal = (leave) => {
    setEditingLeave(leave);

    setEditForm({
      type: leave.type || "",
      from_date: formatInputDate(
        leave.from_date
      ),
      to_date: formatInputDate(
        leave.to_date
      ),
      notes: leave.notes || "",
      attachment: null,
    });

    setSelectedLeave(null);
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

  // =========================================================
  // EDIT FILE
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      showMessage({
        type: "error",
        title: "نوع ملف غير مدعوم",
        message:
          "يرجى اختيار صورة JPG أو PNG أو WEBP أو ملف PDF.",
      });

      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      showMessage({
        type: "error",
        title: "حجم الملف كبير",
        message:
          "الحد الأقصى لحجم المرفق هو 5 ميجابايت.",
      });

      e.target.value = "";
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      attachment: selectedFile,
    }));
  };

  // =========================================================
  // SAVE EDIT
  // =========================================================

  const saveEdit = async () => {
    if (!editingLeave) return;

    if (!editForm.type) {
      showMessage({
        type: "error",
        title: "بيانات ناقصة",
        message: "يرجى اختيار نوع الإجازة.",
      });

      return;
    }

    if (
      !editForm.from_date ||
      !editForm.to_date
    ) {
      showMessage({
        type: "error",
        title: "بيانات ناقصة",
        message:
          "يرجى تحديد تاريخ بداية ونهاية الإجازة.",
      });

      return;
    }

    const days = calculateDays(
      editForm.from_date,
      editForm.to_date
    );

    if (days <= 0) {
      showMessage({
        type: "error",
        title: "التواريخ غير صحيحة",
        message:
          "تاريخ النهاية يجب أن يكون بعد أو مساويًا لتاريخ البداية.",
      });

      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("type", editForm.type);
      formData.append(
        "from_date",
        editForm.from_date
      );
      formData.append(
        "to_date",
        editForm.to_date
      );
      formData.append(
        "notes",
        editForm.notes || ""
      );

      if (editForm.attachment) {
        formData.append(
          "attachment",
          editForm.attachment
        );
      }

      const res = await API.put(
        `/leaves/edit/${editingLeave.leave_id}`,
        formData
      );

      const updatedLeave =
        res.data?.leave ||
        res.data ||
        null;

      if (updatedLeave) {
        setLeaves((prev) =>
          prev.map((leave) =>
            leave.leave_id ===
            editingLeave.leave_id
              ? {
                  ...leave,
                  ...updatedLeave,
                }
              : leave
          )
        );
      } else {
        await fetchLeaves();
      }

      closeEditModal();

      showMessage({
        type: "success",
        title: "تم حفظ التعديلات",
        message:
          "تم تحديث طلب الإجازة بنجاح.",
      });
    } catch (error) {
      console.error("Save Edit Error:", error);

      showMessage({
        type: "error",
        title: "فشل الحفظ",
        message:
          error.response?.data?.message ||
          "حدث خطأ أثناء تحديث طلب الإجازة.",
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EXPORT EXCEL
  // =========================================================

  const exportToExcel = () => {
    if (filteredLeaves.length === 0) {
      showMessage({
        type: "info",
        title: "لا توجد بيانات",
        message:
          "لا توجد طلبات إجازات مطابقة للتصدير.",
      });

      return;
    }

    const exportData = filteredLeaves.map(
      (leave, index) => ({
        "#": index + 1,
        "اسم الموظف": getEmployeeName(leave),
        الوظيفة: getEmployeeRole(leave),
        "نوع الإجازة": getLeaveTypeLabel(
          leave.type
        ),
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
        الحالة: getStatusLabel(leave.status),
        الملاحظات: leave.notes || "—",
        المرفق: getAttachmentUrl(leave)
          ? "موجود"
          : "لا يوجد",
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 25 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 18 },
      { wch: 35 },
      { wch: 12 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "الإجازات"
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const blob = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    saveAs(
      blob,
      `طلبات_الإجازات_${date}.xlsx`
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="leaves-page" dir="rtl">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="top-header">

        <div className="header-right">

          <div className="breadcrumb">
            <span>الرئيسية</span>
            <span className="breadcrumb-separator">
              /
            </span>
            <span className="active">
              طلبات الإجازات
            </span>
          </div>

          <div className="page-title-wrapper">

            <div className="page-title-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h1>طلبات الإجازات</h1>

              <p>
                إدارة ومتابعة طلبات الإجازات
                الخاصة بالموظفين
              </p>
            </div>

          </div>

        </div>

        <div className="header-actions">

          {/* Trash */}
          <button
            type="button"
            className="leaves-trash-button"
            onClick={openTrash}
            disabled={trashLoading}
          >
            <FaTrash />

            <span>السلة</span>

            {deletedCount > 0 && (
              <span className="trash-count-badge">
                {deletedCount}
              </span>
            )}
          </button>

          {/* Refresh */}
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

            <span>تحديث</span>
          </button>

          {/* Add */}
          <button
            type="button"
            className="primary-button"
            onClick={() => nav("/leave")}
          >
            <FaCalendarAlt />
            <span>إضافة إجازة</span>
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

        <section className="statistics-grid">

          <div className="stat-card stat-total">

            <div className="stat-card-icon">
              <FaFileAlt />
            </div>

            <div className="stat-card-content">
              <span>إجمالي الطلبات</span>
              <strong>
                {statistics.total}
              </strong>
              <small>
                جميع طلبات الإجازات
              </small>
            </div>

          </div>

          <div className="stat-card stat-pending">

            <div className="stat-card-icon">
              <FaHourglassHalf />
            </div>

            <div className="stat-card-content">
              <span>قيد المراجعة</span>
              <strong>
                {statistics.pending}
              </strong>
              <small>
                تحتاج إلى مراجعة
              </small>
            </div>

          </div>

          <div className="stat-card stat-approved">

            <div className="stat-card-icon">
              <FaCheckCircle />
            </div>

            <div className="stat-card-content">
              <span>المقبولة</span>
              <strong>
                {statistics.approved}
              </strong>
              <small>
                طلبات تمت الموافقة عليها
              </small>
            </div>

          </div>

          <div className="stat-card stat-rejected">

            <div className="stat-card-icon">
              <FaTimesCircle />
            </div>

            <div className="stat-card-content">
              <span>المرفوضة</span>
              <strong>
                {statistics.rejected}
              </strong>
              <small>
                طلبات تم رفضها
              </small>
            </div>

          </div>

        </section>

        {/* ===================================================
            FILTERS
        =================================================== */}

        <section className="filters-card">

          <div className="filters-header">

            <div className="filters-title">
              <div className="filters-title-icon">
                <FaFilter />
              </div>

              <div>
                <h3>البحث والتصفية</h3>
                <p>
                  ابحث عن طلب محدد أو قم بتصفية النتائج
                </p>
              </div>
            </div>

            <button
              type="button"
              className="reset-filters-button"
              onClick={resetFilters}
            >
              <FaSyncAlt />
              إعادة ضبط
            </button>

          </div>

          <div className="filters-grid">

            {/* Search */}

            <div className="filter-field search-field">

              <label>
                <FaSearch />
                البحث
              </label>

              <div className="search-input-wrapper">

                <FaSearch />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="ابحث باسم الموظف أو الوظيفة..."
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="clear-search"
                  >
                    <FaTimes />
                  </button>
                )}

              </div>

            </div>

            {/* Type */}

            <div className="filter-field">

              <label>
                <FaFileAlt />
                نوع الإجازة
              </label>

              <div className="select-wrapper">

                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    جميع الأنواع
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

                <FaChevronDown />

              </div>

            </div>

            {/* Status */}

            <div className="filter-field">

              <label>
                <FaInfoCircle />
                الحالة
              </label>

              <div className="select-wrapper">

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value
                    )
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

                <FaChevronDown />

              </div>

            </div>

            {/* Excel */}

            <div className="filter-export-wrapper">

              <button
                type="button"
                className="excel-button"
                onClick={exportToExcel}
                disabled={
                  filteredLeaves.length === 0
                }
              >
                <FaFileExcel />

                <span>
                  تصدير Excel
                </span>
              </button>

            </div>

          </div>

        </section>

        {/* ===================================================
            TABLE CARD
        =================================================== */}

        <section className="table-container">

          <div className="table-header">

            <div className="table-title">

              <div className="table-title-icon">
                <FaCalendarCheck />
              </div>

              <div>
                <h2>قائمة طلبات الإجازات</h2>

                <p>
                  عرض جميع الطلبات الحالية
                </p>
              </div>

            </div>

            <div className="table-header-right">

              <span className="results-count">
                عرض{" "}
                <strong>
                  {filteredLeaves.length}
                </strong>{" "}
                من{" "}
                <strong>
                  {leaves.length}
                </strong>
              </span>

              <button
                type="button"
                className="table-refresh-button"
                onClick={fetchLeaves}
                disabled={loading}
                title="تحديث"
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

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="loading-state">

              <div className="loading-spinner">
                <FaSyncAlt />
              </div>

              <h3>
                جاري تحميل الطلبات...
              </h3>

              <p>
                يرجى الانتظار لحظات
              </p>

            </div>
          ) : filteredLeaves.length === 0 ? (

            /* ===============================================
               EMPTY
            =============================================== */

            <div className="empty-state">

              <div className="empty-state-icon">
                <FaCalendarAlt />
              </div>

              <h3>
                لا توجد طلبات إجازات
              </h3>

              <p>
                لم يتم العثور على طلبات
                تطابق معايير البحث الحالية.
              </p>

              {(search ||
                filterType ||
                filterStatus) && (
                <button
                  type="button"
                  className="reset-empty-button"
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

              <div className="desktop-table-wrapper">

                <table className="leaves-table">

                  <thead>
                    <tr>
                      <th>الموظف</th>
                      <th>نوع الإجازة</th>
                      <th>الفترة</th>
                      <th>الأيام</th>
                      <th>الحالة</th>
                      <th>المرفق</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredLeaves.map(
                      (leave) => {

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

                        const status =
                          normalizeStatus(
                            leave.status
                          );

                        return (
                          <tr
                            key={
                              leave.leave_id
                            }
                          >

                            {/* Employee */}

                            <td>

                              <div className="employee-cell">

                                <div className="employee-avatar">
                                  <FaUser />
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

                            </td>

                            {/* Type */}

                            <td>

                              <span className="leave-type-badge">
                                <FaFileAlt />

                                {getLeaveTypeLabel(
                                  leave.type
                                )}
                              </span>

                            </td>

                            {/* Dates */}

                            <td>

                              <div className="date-range-cell">

                                <span>
                                  {formatDate(
                                    leave.from_date
                                  )}
                                </span>

                                <span className="date-arrow">
                                  ←
                                </span>

                                <span>
                                  {formatDate(
                                    leave.to_date
                                  )}
                                </span>

                              </div>

                            </td>

                            {/* Days */}

                            <td>

                              <div className="days-cell">
                                <strong>
                                  {days}
                                </strong>

                                <span>
                                  يوم
                                </span>
                              </div>

                            </td>

                            {/* Status */}

                            <td>

                              <span
                                className={`status-badge ${getStatusClass(
                                  leave.status
                                )}`}
                              >
                                {getStatusIcon(
                                  leave.status
                                )}

                                {getStatusLabel(
                                  leave.status
                                )}
                              </span>

                            </td>

                            {/* Attachment */}

                            <td>

                              {attachment ? (
                                <button
                                  type="button"
                                  className="attachment-button"
                                  onClick={() =>
                                    openAttachment(
                                      leave
                                    )}
                                >
                                  <FaPaperclip />
                                  عرض
                                </button>
                              ) : (
                                <span className="no-attachment">
                                  —
                                </span>
                              )}

                            </td>

                            {/* Actions */}

                            <td>

                              <div className="table-actions">

                                {status ===
                                  "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      className="action-button action-approve"
                                      onClick={() =>
                                        requestStatusChange(
                                          leave.leave_id,
                                          "approved"
                                        )
                                      }
                                      disabled={
                                        !!actionLoading
                                      }
                                      title="قبول"
                                    >
                                      <FaCheck />
                                    </button>

                                    <button
                                      type="button"
                                      className="action-button action-reject"
                                      onClick={() =>
                                        requestStatusChange(
                                          leave.leave_id,
                                          "rejected"
                                        )
                                      }
                                      disabled={
                                        !!actionLoading
                                      }
                                      title="رفض"
                                    >
                                      <FaTimes />
                                    </button>
                                  </>
                                )}

                                <button
                                  type="button"
                                  className="action-button action-view"
                                  onClick={() =>
                                    openDetails(
                                      leave
                                    )
                                  }
                                  title="عرض التفاصيل"
                                >
                                  <FaEye />
                                </button>

                                <button
                                  type="button"
                                  className="action-button action-edit"
                                  onClick={() =>
                                    openEditModal(
                                      leave
                                    )
                                  }
                                  title="تعديل"
                                >
                                  <FaEdit />
                                </button>

                                <button
                                  type="button"
                                  className="action-button action-delete"
                                  onClick={() =>
                                    requestDelete(
                                      leave.leave_id
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `delete-${leave.leave_id}`
                                  }
                                  title="نقل إلى السلة"
                                >
                                  <FaTrash />
                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* =============================================
                  MOBILE CARDS
              ============================================= */}

              <div className="mobile-leaves-list">

                {filteredLeaves.map(
                  (leave) => {

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

                    const status =
                      normalizeStatus(
                        leave.status
                      );

                    return (
                      <article
                        className="mobile-leave-card"
                        key={
                          leave.leave_id
                        }
                      >

                        <div className="mobile-card-header">

                          <div className="mobile-employee">

                            <div className="employee-avatar">
                              <FaUser />
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
                            className={`status-badge ${getStatusClass(
                              leave.status
                            )}`}
                          >
                            {getStatusIcon(
                              leave.status
                            )}

                            {getStatusLabel(
                              leave.status
                            )}
                          </span>

                        </div>

                        <div className="mobile-card-divider" />

                        <div className="mobile-card-info-grid">

                          <div>
                            <span>نوع الإجازة</span>

                            <strong>
                              {getLeaveTypeLabel(
                                leave.type
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>عدد الأيام</span>

                            <strong>
                              {days} يوم
                            </strong>
                          </div>

                          <div>
                            <span>من</span>

                            <strong>
                              {formatDate(
                                leave.from_date
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>إلى</span>

                            <strong>
                              {formatDate(
                                leave.to_date
                              )}
                            </strong>
                          </div>

                        </div>

                        {leave.notes && (
                          <div className="mobile-notes">

                            <FaStickyNote />

                            <span>
                              {leave.notes}
                            </span>

                          </div>
                        )}

                        {attachment && (
                          <button
                            type="button"
                            className="mobile-attachment"
                            onClick={() =>
                              openAttachment(
                                leave
                              )}
                          >
                            <FaPaperclip />
                            عرض المرفق
                          </button>
                        )}

                        <div className="mobile-card-actions">

                          {status ===
                            "pending" && (
                            <>
                              <button
                                type="button"
                                className="mobile-action approve"
                                onClick={() =>
                                  requestStatusChange(
                                    leave.leave_id,
                                    "approved"
                                  )
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
                              >
                                <FaTimes />
                                رفض
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="mobile-action view"
                            onClick={() =>
                              openDetails(
                                leave
                              )
                            }
                          >
                            <FaEye />
                            عرض
                          </button>

                          <button
                            type="button"
                            className="mobile-action edit"
                            onClick={() =>
                              openEditModal(
                                leave
                              )
                            }
                          >
                            <FaEdit />
                            تعديل
                          </button>

                          <button
                            type="button"
                            className="mobile-action delete"
                            onClick={() =>
                              requestDelete(
                                leave.leave_id
                              )
                            }
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            </>
          )}

        </section>

      </main>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedLeave && (
        <div
          className="modal-overlay"
          onClick={closeDetails}
        >
          <div
            className="modal details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">

                <div className="modal-title-icon">
                  <FaFileAlt />
                </div>

                <div>
                  <h3>
                    تفاصيل طلب الإجازة
                  </h3>

                  <p>
                    جميع معلومات الطلب
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeDetails}
              >
                <FaTimes />
              </button>

            </div>

            <div className="modal-body">

              {/* Employee */}

              <div className="details-profile">

                <div className="details-profile-avatar">
                  <FaUser />
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
                  className={`status-badge ${getStatusClass(
                    selectedLeave.status
                  )}`}
                >
                  {getStatusIcon(
                    selectedLeave.status
                  )}

                  {getStatusLabel(
                    selectedLeave.status
                  )}
                </span>

              </div>

              {/* Info grid */}

              <div className="details-grid">

                <div className="detail-box">

                  <span>
                    <FaFileAlt />
                    نوع الإجازة
                  </span>

                  <strong>
                    {getLeaveTypeLabel(
                      selectedLeave.type
                    )}
                  </strong>

                </div>

                <div className="detail-box">

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

                <div className="detail-box">

                  <span>
                    <FaRegCalendarAlt />
                    تاريخ البداية
                  </span>

                  <strong>
                    {formatDate(
                      selectedLeave.from_date
                    )}
                  </strong>

                </div>

                <div className="detail-box">

                  <span>
                    <FaRegCalendarAlt />
                    تاريخ النهاية
                  </span>

                  <strong>
                    {formatDate(
                      selectedLeave.to_date
                    )}
                  </strong>

                </div>

              </div>

              {/* Notes */}

              {selectedLeave.notes && (
                <div className="details-notes">

                  <div className="details-section-title">
                    <FaStickyNote />
                    الملاحظات
                  </div>

                  <p>
                    {selectedLeave.notes}
                  </p>

                </div>
              )}

              {/* Attachment */}

              {getAttachmentUrl(
                selectedLeave
              ) && (
                <div className="details-attachment">

                  <div className="details-section-title">
                    <FaPaperclip />
                    المرفق
                  </div>

                  <button
                    type="button"
                    className="attachment-preview-button"
                    onClick={() =>
                      openAttachment(
                        selectedLeave
                      )}
                  >
                    <FaFileAlt />

                    <span>
                      عرض المرفق
                    </span>

                    <FaExternalLinkAlt />
                  </button>

                </div>
              )}

            </div>

            <div className="modal-footer">

              <div className="modal-footer-left">

                {normalizeStatus(
                  selectedLeave.status
                ) === "pending" && (
                  <>
                    <button
                      type="button"
                      className="footer-action approve"
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
                      className="footer-action reject"
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
                  </>
                )}

                <button
                  type="button"
                  className="footer-action edit"
                  onClick={() =>
                    openEditModal(
                      selectedLeave
                    )
                  }
                >
                  <FaEdit />
                  تعديل
                </button>

                <button
                  type="button"
                  className="footer-action delete"
                  onClick={() =>
                    requestDelete(
                      selectedLeave.leave_id
                    )
                  }
                >
                  <FaTrash />
                  السلة
                </button>

              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={closeDetails}
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
          <div
            className="modal edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">

                <div className="modal-title-icon edit-icon">
                  <FaEdit />
                </div>

                <div>
                  <h3>
                    تعديل طلب الإجازة
                  </h3>

                  <p>
                    تعديل بيانات الطلب
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeEditModal}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <div className="modal-body">

              <div className="edit-employee-banner">

                <div className="employee-avatar">
                  <FaUser />
                </div>

                <div>
                  <span>
                    الموظف
                  </span>

                  <strong>
                    {getEmployeeName(
                      editingLeave
                    )}
                  </strong>
                </div>

              </div>

              <div className="edit-form-grid">

                {/* Type */}

                <div className="form-field">

                  <label>
                    نوع الإجازة
                    <span>*</span>
                  </label>

                  <div className="select-wrapper">

                    <select
                      name="type"
                      value={editForm.type}
                      onChange={
                        handleEditChange
                      }
                    >
                      <option value="">
                        اختر نوع الإجازة
                      </option>

                      <option value="سنوية">
                        سنوية
                      </option>

                      <option value="مرضية">
                        مرضية
                      </option>

                      <option value="طارئة">
                        طارئة
                      </option>

                      <option value="بدون راتب">
                        بدون راتب
                      </option>

                      <option value="أخرى">
                        أخرى
                      </option>
                    </select>

                    <FaChevronDown />

                  </div>

                </div>

                {/* Days preview */}

                <div className="form-field">

                  <label>
                    عدد الأيام
                  </label>

                  <div className="days-preview-input">

                    <FaCalendarCheck />

                    <strong>
                      {calculateDays(
                        editForm.from_date,
                        editForm.to_date
                      )}
                    </strong>

                    <span>
                      يوم
                    </span>

                  </div>

                </div>

                {/* From */}

                <div className="form-field">

                  <label>
                    تاريخ البداية
                    <span>*</span>
                  </label>

                  <div className="date-input-wrapper">

                    <FaCalendarAlt />

                    <input
                      type="date"
                      name="from_date"
                      value={
                        editForm.from_date
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                </div>

                {/* To */}

                <div className="form-field">

                  <label>
                    تاريخ النهاية
                    <span>*</span>
                  </label>

                  <div className="date-input-wrapper">

                    <FaCalendarAlt />

                    <input
                      type="date"
                      name="to_date"
                      value={
                        editForm.to_date
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                </div>

                {/* Notes */}

                <div className="form-field full-width">

                  <label>
                    الملاحظات
                  </label>

                  <div className="textarea-wrapper">

                    <FaStickyNote />

                    <textarea
                      name="notes"
                      value={
                        editForm.notes
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="أضف أي ملاحظات..."
                      rows="4"
                    />

                  </div>

                </div>

                {/* Existing attachment */}

                {getAttachmentUrl(
                  editingLeave
                ) && (
                  <div className="form-field full-width">

                    <label>
                      المرفق الحالي
                    </label>

                    <button
                      type="button"
                      className="current-attachment"
                      onClick={() =>
                        openAttachment(
                          editingLeave
                        )
                      }
                    >
                      <FaPaperclip />

                      <span>
                        عرض المرفق الحالي
                      </span>

                      <FaEye />

                    </button>

                  </div>
                )}

                {/* New attachment */}

                <div className="form-field full-width">

                  <label>
                    {getAttachmentUrl(
                      editingLeave
                    )
                      ? "استبدال المرفق"
                      : "المرفق"}

                    {!getAttachmentUrl(
                      editingLeave
                    ) && <span>*</span>}
                  </label>

                  <label className="file-upload-box">

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={
                        handleFileChange
                      }
                    />

                    <FaPaperclip />

                    <div>
                      <strong>
                        {editForm.attachment
                          ? editForm
                              .attachment
                              .name
                          : "اختر ملفًا"}
                      </strong>

                      <span>
                        JPG, PNG, WEBP أو PDF
                        — الحد الأقصى 5MB
                      </span>
                    </div>

                  </label>

                </div>

              </div>

            </div>

            <div className="modal-footer">

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
          TRASH MODAL
      ===================================================== */}

      {showTrash && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!trashLoading) {
              setShowTrash(false);
            }
          }}
        >
          <div
            className="modal trash-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Header */}

            <div className="modal-header trash-modal-header">

              <div className="modal-title">

                <div className="trash-title-icon">
                  <FaTrash />
                </div>

                <div>
                  <h3>
                    سلة الإجازات
                  </h3>

                  <p>
                    الطلبات المحذوفة يمكن استعادتها
                    لاحقًا
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowTrash(false)
                }
                disabled={trashLoading}
              >
                <FaTimes />
              </button>

            </div>

            {/* Body */}

            <div className="modal-body trash-modal-body">

              {trashLoading ? (
                <div className="trash-loading">

                  <div className="trash-loading-icon">
                    <FaSyncAlt className="refresh-spin" />
                  </div>

                  <h4>
                    جاري تحميل السلة...
                  </h4>

                  <p>
                    يرجى الانتظار
                  </p>

                </div>
              ) : deletedLeaves.length === 0 ? (

                <div className="trash-empty">

                  <div className="trash-empty-icon">
                    <FaTrash />
                  </div>

                  <h4>
                    السلة فارغة
                  </h4>

                  <p>
                    لا توجد طلبات إجازات
                    محذوفة حاليًا.
                  </p>

                </div>
              ) : (

                <div className="trash-list">

                  {deletedLeaves.map(
                    (leave) => {

                      const employeeName =
                        getEmployeeName(
                          leave
                        );

                      const employeeRole =
                        getEmployeeRole(
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
                          className="trash-leave-item"
                          key={
                            leave.leave_id
                          }
                        >

                          <div className="trash-leave-main">

                            <div className="trash-employee-icon">
                              <FaUser />
                            </div>

                            <div className="trash-leave-info">

                              <div className="trash-name-row">

                                <h4>
                                  {employeeName}
                                </h4>

                                <span className="deleted-label">
                                  محذوف
                                </span>

                              </div>

                              <span className="trash-role">
                                {employeeRole}
                              </span>

                              <div className="trash-leave-meta">

                                <span>
                                  <FaFileAlt />
                                  {getLeaveTypeLabel(
                                    leave.type
                                  )}
                                </span>

                                <span>
                                  <FaRegCalendarAlt />

                                  {formatDate(
                                    leave.from_date
                                  )}

                                  <b>←</b>

                                  {formatDate(
                                    leave.to_date
                                  )}
                                </span>

                                <span>
                                  <FaClock />
                                  {days} يوم
                                </span>

                              </div>

                              {leave.notes && (
                                <p className="trash-note">
                                  <FaStickyNote />
                                  {leave.notes}
                                </p>
                              )}

                            </div>

                          </div>

                          <div className="trash-leave-actions">

                            <button
                              type="button"
                              className="trash-view-button"
                              onClick={() =>
                                openAttachment(
                                  leave
                                )
                              }
                              disabled={
                                !getAttachmentUrl(
                                  leave
                                )
                              }
                              title={
                                getAttachmentUrl(
                                  leave
                                )
                                  ? "عرض المرفق"
                                  : "لا يوجد مرفق"
                              }
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="trash-restore-button"
                              onClick={() =>
                                restoreLeave(
                                  leave.leave_id
                                )
                              }
                              disabled={
                                actionLoading ===
                                `restore-${leave.leave_id}`
                              }
                            >
                              {actionLoading ===
                              `restore-${leave.leave_id}` ? (
                                <>
                                  <FaSyncAlt className="refresh-spin" />
                                  جاري الاستعادة...
                                </>
                              ) : (
                                <>
                                  <FaUndo />
                                  استعادة
                                </>
                              )}
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* Footer */}

            <div className="trash-modal-footer">

              <div className="trash-total">

                <div className="trash-total-icon">
                  <FaTrash />
                </div>

                <div>
                  <span>
                    إجمالي المحذوفات
                  </span>

                  <strong>
                    {deletedCount}
                  </strong>
                </div>

              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowTrash(false)
                }
                disabled={trashLoading}
              >
                إغلاق
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      {confirmModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!actionLoading) {
              setConfirmModal(null);
            }
          }}
        >
          <div
            className="modal confirm-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="confirm-icon-wrapper">

              <div
                className={`confirm-icon ${
                  confirmModal.type ===
                  "delete"
                    ? "danger"
                    : confirmModal.type ===
                      "reject"
                    ? "warning"
                    : "success"
                }`}
              >
                {confirmModal.icon}
              </div>

            </div>

            <h3>
              {confirmModal.title}
            </h3>

            <p>
              {confirmModal.message}
            </p>

            <div className="confirm-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setConfirmModal(null)
                }
                disabled={!!actionLoading}
              >
                إلغاء
              </button>

              <button
                type="button"
                className={`confirm-button ${
                  confirmModal.type ===
                  "delete"
                    ? "danger"
                    : confirmModal.type ===
                      "reject"
                    ? "warning"
                    : "success"
                }`}
                onClick={confirmAction}
                disabled={!!actionLoading}
              >
                {actionLoading ? (
                  <>
                    <FaSyncAlt className="refresh-spin" />
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
        <div
          className="modal-overlay attachment-overlay"
          onClick={closeAttachment}
        >
          <div
            className="modal attachment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">

                <div className="modal-title-icon attachment-icon">
                  <FaPaperclip />
                </div>

                <div>
                  <h3>
                    مرفق طلب الإجازة
                  </h3>

                  <p>
                    {getEmployeeName(
                      selectedAttachment.leave
                    )}
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeAttachment}
              >
                <FaTimes />
              </button>

            </div>

            <div className="attachment-viewer">

              {isImageFile(
                selectedAttachment.url
              ) ? (
                <img
                  src={
                    selectedAttachment.url
                  }
                  alt="مرفق الإجازة"
                />
              ) : isPdfFile(
                  selectedAttachment.url
                ) ? (
                <iframe
                  src={
                    selectedAttachment.url
                  }
                  title="PDF Attachment"
                />
              ) : (
                <div className="unsupported-file">

                  <FaFileAlt />

                  <h4>
                    لا يمكن عرض هذا الملف
                    مباشرة
                  </h4>

                  <a
                    href={
                      selectedAttachment.url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaDownload />
                    فتح الملف
                  </a>

                </div>
              )}

            </div>

            <div className="attachment-footer">

              <a
                href={
                  selectedAttachment.url
                }
                target="_blank"
                rel="noreferrer"
                className="download-attachment"
              >
                <FaDownload />
                فتح / تحميل المرفق
              </a>

              <button
                type="button"
                className="secondary-button"
                onClick={
                  closeAttachment
                }
              >
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
            className="modal message-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div
              className={`message-icon ${
                messageModal.type
              }`}
            >
              {messageModal.type ===
              "success" ? (
                <FaCheckCircle />
              ) : messageModal.type ===
                "error" ? (
                <FaTimesCircle />
              ) : (
                <FaInfoCircle />
              )}
            </div>

            <h3>
              {messageModal.title}
            </h3>

            <p>
              {messageModal.message}
            </p>

            <button
              type="button"
              className="primary-button message-close-button"
              onClick={
                closeMessageModal
              }
            >
              حسنًا
            </button>

          </div>
        </div>
      )}

    </div>
  );
}