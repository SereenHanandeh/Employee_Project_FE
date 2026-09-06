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
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperclip,
  FaDownload,
  FaSave,
  FaTimes as FaClose,
} from "react-icons/fa";

import "./LeaveList.css";

export default function LeavesList() {
  const navigate = useNavigate();

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
  // FETCH LEAVES
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

  useEffect(() => {
    fetchLeaves();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const getEmployeeName = (leave) => {
    return (
      leave?.employee_name ||
      leave?.employee?.name ||
      leave?.full_name ||
      leave?.name ||
      "غير معروف"
    );
  };

  const getEmployeeRole = (leave) => {
    return (
      leave?.employee_role ||
      leave?.employee?.role ||
      leave?.role ||
      "موظف"
    );
  };

  const getStatusKey = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (
      value === "approved" ||
      value === "accepted" ||
      value === "مقبول" ||
      value === "approved "
    ) {
      return "approved";
    }

    if (
      value === "rejected" ||
      value === "رفض" ||
      value === "مرفوض"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const getStatusLabel = (status) => {
    const statusKey = getStatusKey(status);

    if (statusKey === "approved") {
      return "مقبولة";
    }

    if (statusKey === "rejected") {
      return "مرفوضة";
    }

    return "قيد الانتظار";
  };

  const getStatusClass = (status) => {
    const statusKey = getStatusKey(status);

    if (statusKey === "approved") {
      return "approved";
    }

    if (statusKey === "rejected") {
      return "rejected";
    }

    return "pending";
  };

  const getLeaveTypeLabel = (type) => {
    if (!type) return "-";

    const value = String(type).trim();

    const types = {
      annual: "سنوية",
      sick: "مرضية",
      emergency: "طارئة",
      unpaid: "بدون راتب",
      maternity: "أمومة",
      paternity: "أبوة",
      marriage: "زواج",
      bereavement: "وفاة",
      vacation: "إجازة",
      "إجازة سنوية": "إجازة سنوية",
      "إجازة مرضية": "إجازة مرضية",
      "إجازة طارئة": "إجازة طارئة",
      "إجازة بدون راتب": "إجازة بدون راتب",
    };

    return types[value] || value;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return date;
    }
  };

  const formatInputDate = (date) => {
    if (!date) return "";

    const value = String(date);

    if (value.includes("T")) {
      return value.split("T")[0];
    }

    return value.substring(0, 10);
  };

  const getAttachmentUrl = (leave) => {
    return (
      leave?.attachment ||
      leave?.attachment_url ||
      leave?.file_url ||
      null
    );
  };

  const isPdfFile = (url) => {
    if (!url) return false;

    const value = String(url).toLowerCase();

    return (
      value.includes(".pdf") ||
      value.includes("application/pdf")
    );
  };

  // =========================================================
  // FILTERED LEAVES
  // =========================================================

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const employeeName = getEmployeeName(leave);

      const searchValue = String(search || "")
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        employeeName.toLowerCase().includes(searchValue) ||
        String(leave?.type || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(leave?.notes || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesType =
        !filterType ||
        String(leave?.type || "") === filterType;

      const matchesStatus =
        !filterStatus ||
        getStatusKey(leave?.status) === filterStatus;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [leaves, search, filterType, filterStatus]);

  // =========================================================
  // UNIQUE TYPES
  // =========================================================

  const leaveTypes = useMemo(() => {
    const types = leaves
      .map((leave) => leave?.type)
      .filter(Boolean);

    return [...new Set(types)];
  }, [leaves]);

  // =========================================================
  // VIEW LEAVE
  // =========================================================

  const openLeaveDetails = (leave) => {
    setSelectedLeave(leave);
  };

  const closeLeaveDetails = () => {
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
      isPdf: isPdfFile(url),
      employeeName: getEmployeeName(leave),
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

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (id, status) => {
    try {
      setSaving(true);
      setActionLoading(`${status}-${id}`);

      const res = await API.put(
        `/leaves/${id}`,
        { status }
      );

      const updatedLeave = res.data?.leave;

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id === id
            ? {
                ...leave,
                ...(updatedLeave || {}),
                status:
                  updatedLeave?.status || status,
              }
            : leave
        )
      );

      setSelectedLeave(null);
      setConfirmModal(null);

      showMessage({
        type:
          status === "approved"
            ? "success"
            : "warning",
        title:
          status === "approved"
            ? "تم قبول الإجازة"
            : "تم رفض الإجازة",
        message:
          status === "approved"
            ? "تم قبول طلب الإجازة بنجاح، ويمكنك الآن تعديل الطلب إذا لزم الأمر."
            : "تم رفض طلب الإجازة بنجاح، ويمكنك أيضًا تعديل الطلب إذا لزم الأمر.",
      });
    } catch (error) {
      console.error(
        "Update Leave Status Error:",
        error
      );

      showMessage({
        type: "error",
        title: "فشل تحديث الحالة",
        message:
          error.response?.data?.message ||
          "فشل تحديث حالة طلب الإجازة.",
      });
    } finally {
      setSaving(false);
      setActionLoading(null);
    }
  };

  // =========================================================
  // CONFIRM DELETE
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

  // =========================================================
  // DELETE LEAVE
  // =========================================================

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
        message:
          error.response?.data?.message ||
          "فشل حذف طلب الإجازة.",
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

    const { type, id, status } =
      confirmModal;

    if (type === "approve" || type === "reject") {
      updateStatus(id, status);
      return;
    }

    if (type === "delete") {
      deleteLeave(id);
    }
  };

  const closeConfirmModal = () => {
    if (saving) return;

    setConfirmModal(null);
  };

  // =========================================================
  // EDIT LEAVE
  // =========================================================

  const openEditLeave = (leave) => {
    setEditingLeave(leave);

    setEditForm({
      type: leave?.type || "",
      from_date: formatInputDate(
        leave?.from_date
      ),
      to_date: formatInputDate(
        leave?.to_date
      ),
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

  const handleEditFileChange = (e) => {
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
        message:
          "يسمح فقط برفع ملفات JPG أو PNG أو WEBP أو PDF.",
      });

      e.target.value = "";

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage({
        type: "warning",
        title: "حجم الملف كبير",
        message:
          "حجم المرفق يجب ألا يتجاوز 5 ميجابايت.",
      });

      e.target.value = "";

      return;
    }

    setEditForm((prev) => ({
      ...prev,
      attachment: file,
    }));
  };

  // =========================================================
  // SAVE EDIT
  // =========================================================

  const saveEdit = async () => {
    if (!editingLeave) return;

    if (!editForm.type.trim()) {
      showMessage({
        type: "warning",
        title: "نوع الإجازة مطلوب",
        message:
          "يرجى اختيار أو إدخال نوع الإجازة.",
      });

      return;
    }

    if (
      !editForm.from_date ||
      !editForm.to_date
    ) {
      showMessage({
        type: "warning",
        title: "التاريخ مطلوب",
        message:
          "يرجى إدخال تاريخ بداية ونهاية الإجازة.",
      });

      return;
    }

    const from = new Date(
      `${editForm.from_date}T00:00:00`
    );

    const to = new Date(
      `${editForm.to_date}T00:00:00`
    );

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime())
    ) {
      showMessage({
        type: "warning",
        title: "تاريخ غير صالح",
        message:
          "يرجى التأكد من صحة تواريخ الإجازة.",
      });

      return;
    }

    if (to < from) {
      showMessage({
        type: "warning",
        title: "التواريخ غير صحيحة",
        message:
          "تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية.",
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

      if (
        !allowedTypes.includes(
          editForm.attachment.type
        )
      ) {
        showMessage({
          type: "warning",
          title: "نوع الملف غير مسموح",
          message:
            "يسمح فقط برفع JPG أو PNG أو WEBP أو PDF.",
        });

        return;
      }

      if (
        editForm.attachment.size >
        5 * 1024 * 1024
      ) {
        showMessage({
          type: "warning",
          title: "حجم الملف كبير",
          message:
            "حجم المرفق يجب ألا يتجاوز 5 ميجابايت.",
        });

        return;
      }
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "type",
        editForm.type.trim()
      );

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
        res.data?.leave;

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.leave_id ===
          editingLeave.leave_id
            ? {
                ...leave,
                ...(updatedLeave || {}),
              }
            : leave
        )
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
        message:
          "تم تعديل طلب الإجازة بنجاح.",
      });
    } catch (error) {
      console.error(
        "Edit Leave Error:",
        error
      );

      showMessage({
        type: "error",
        title: "فشل التعديل",
        message:
          error.response?.data?.message ||
          "فشل تعديل طلب الإجازة.",
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
        message:
          "لا توجد بيانات لتصديرها حسب الفلاتر الحالية.",
      });

      return;
    }

    const data = filteredLeaves.map(
      (leave, index) => ({
        "#": index + 1,
        الموظف: getEmployeeName(leave),
        الوظيفة: getEmployeeRole(leave),
        "نوع الإجازة":
          getLeaveTypeLabel(leave.type),
        "تاريخ البداية":
          formatDate(leave.from_date),
        "تاريخ النهاية":
          formatDate(leave.to_date),
        "عدد الأيام":
          leave.days ?? "-",
        الحالة:
          getStatusLabel(leave.status),
        الملاحظات:
          leave.notes || "-",
        المرفق: getAttachmentUrl(leave)
          ? "نعم"
          : "لا",
      })
    );

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
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    saveAs(
      blob,
      `طلبات_الإجازات_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );

    showMessage({
      type: "success",
      title: "تم التصدير",
      message:
        "تم تصدير بيانات طلبات الإجازات إلى ملف Excel بنجاح.",
    });
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    const pending = leaves.filter(
      (leave) =>
        getStatusKey(leave.status) ===
        "pending"
    ).length;

    const approved = leaves.filter(
      (leave) =>
        getStatusKey(leave.status) ===
        "approved"
    ).length;

    const rejected = leaves.filter(
      (leave) =>
        getStatusKey(leave.status) ===
        "rejected"
    ).length;

    return {
      total: leaves.length,
      pending,
      approved,
      rejected,
    };
  }, [leaves]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="leaves-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">
        <div>
          <div className="page-title">
            <div className="page-title-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h1>طلبات الإجازات</h1>

              <p>
                إدارة ومتابعة جميع طلبات إجازات
                الموظفين
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="header-button refresh"
            onClick={fetchLeaves}
            disabled={loading}
          >
            <FaSyncAlt
              className={
                loading
                  ? "spin-icon"
                  : ""
              }
            />

            <span>تحديث</span>
          </button>

          <button
            type="button"
            className="header-button excel"
            onClick={exportToExcel}
          >
            <FaFileExcel />

            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="leave-stats">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>

          <div>
            <span>إجمالي الطلبات</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>

          <div>
            <span>قيد الانتظار</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>

          <div>
            <span>المقبولة</span>
            <strong>{stats.approved}</strong>
          </div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">
            <FaTimesCircle />
          </div>

          <div>
            <span>المرفوضة</span>
            <strong>{stats.rejected}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="filters-card">
        <div className="filter-search">
          <FaSearch />

          <input
            type="text"
            placeholder="ابحث باسم الموظف أو نوع الإجازة..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="filter-group">
          <select
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
                {getLeaveTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
          >
            <option value="">
              جميع الحالات
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
        </div>

        {(search ||
          filterType ||
          filterStatus) && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setSearch("");
              setFilterType("");
              setFilterStatus("");
            }}
          >
            <FaTimes />
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="leaves-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>

            <p>
              جاري تحميل طلبات الإجازات...
            </p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaCalendarAlt />
            </div>

            <h3>
              لا توجد طلبات إجازات
            </h3>

            <p>
              لا توجد بيانات مطابقة
              للفلاتر الحالية.
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="table-container">
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
                      const statusKey =
                        getStatusKey(
                          leave.status
                        );

                      return (
                        <tr
                          key={
                            leave.leave_id
                          }
                        >
                          {/* EMPLOYEE */}
                          <td>
                            <div className="employee-cell">
                              <div className="employee-avatar">
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
                          </td>

                          {/* TYPE */}
                          <td>
                            <span className="leave-type">
                              {getLeaveTypeLabel(
                                leave.type
                              )}
                            </span>
                          </td>

                          {/* DATES */}
                          <td>
                            <div className="date-range">
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

                          {/* DAYS */}
                          <td>
                            <span className="days-badge">
                              {leave.days ?? "-"}{" "}
                              يوم
                            </span>
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={`status-badge ${getStatusClass(
                                leave.status
                              )}`}
                            >
                              {statusKey ===
                                "approved" && (
                                <FaCheckCircle />
                              )}

                              {statusKey ===
                                "rejected" && (
                                <FaTimesCircle />
                              )}

                              {statusKey ===
                                "pending" && (
                                <FaClock />
                              )}

                              {getStatusLabel(
                                leave.status
                              )}
                            </span>
                          </td>

                          {/* ATTACHMENT */}
                          <td>
                            {getAttachmentUrl(
                              leave
                            ) ? (
                              <button
                                type="button"
                                className="attachment-button"
                                onClick={() =>
                                  openAttachment(
                                    leave
                                  )
                                }
                              >
                                <FaPaperclip />
                                <span>
                                  عرض
                                </span>
                              </button>
                            ) : (
                              <span className="no-attachment">
                                لا يوجد
                              </span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td>
                            <div className="action-buttons">
                              {/* ACCEPT + REJECT ONLY PENDING */}
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
                                </>
                              )}

                              {/* EDIT ALWAYS VISIBLE */}
                              <button
                                type="button"
                                className="action-button edit"
                                title="تعديل الطلب"
                                onClick={() =>
                                  openEditLeave(
                                    leave
                                  )
                                }
                                disabled={saving}
                              >
                                <FaEdit />

                                <span className="action-tooltip">
                                  تعديل
                                </span>
                              </button>

                              {/* VIEW */}
                              <button
                                type="button"
                                className="action-button view"
                                title="عرض التفاصيل"
                                onClick={() =>
                                  openLeaveDetails(
                                    leave
                                  )
                                }
                                disabled={saving}
                              >
                                <FaEye />

                                <span className="action-tooltip">
                                  عرض
                                </span>
                              </button>

                              {/* DELETE */}
                              <button
                                type="button"
                                className="action-button delete"
                                title="حذف الطلب"
                                onClick={() =>
                                  requestDeleteLeave(
                                    leave.leave_id
                                  )
                                }
                                disabled={saving}
                              >
                                <FaTrash />

                                <span className="action-tooltip">
                                  حذف
                                </span>
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

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="mobile-leaves-list">
              {filteredLeaves.map(
                (leave) => {
                  const statusKey =
                    getStatusKey(
                      leave.status
                    );

                  return (
                    <div
                      className="leave-mobile-card"
                      key={
                        leave.leave_id
                      }
                    >
                      <div className="mobile-card-header">
                        <div className="employee-cell">
                          <div className="employee-avatar">
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
                          className={`status-badge ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {getStatusLabel(
                            leave.status
                          )}
                        </span>
                      </div>

                      <div className="mobile-card-body">
                        <div className="mobile-info-row">
                          <span>
                            نوع الإجازة
                          </span>

                          <strong>
                            {getLeaveTypeLabel(
                              leave.type
                            )}
                          </strong>
                        </div>

                        <div className="mobile-info-row">
                          <span>
                            تاريخ البداية
                          </span>

                          <strong>
                            {formatDate(
                              leave.from_date
                            )}
                          </strong>
                        </div>

                        <div className="mobile-info-row">
                          <span>
                            تاريخ النهاية
                          </span>

                          <strong>
                            {formatDate(
                              leave.to_date
                            )}
                          </strong>
                        </div>

                        <div className="mobile-info-row">
                          <span>
                            عدد الأيام
                          </span>

                          <strong>
                            {leave.days ??
                              "-"}{" "}
                            يوم
                          </strong>
                        </div>

                        {leave.notes && (
                          <div className="mobile-notes">
                            <span>
                              الملاحظات
                            </span>

                            <p>
                              {leave.notes}
                            </p>
                          </div>
                        )}

                        {getAttachmentUrl(
                          leave
                        ) && (
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
                      </div>

                      <div className="mobile-card-actions">
                        {/* ACCEPT + REJECT ONLY PENDING */}
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
                              disabled={saving}
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
                              disabled={saving}
                            >
                              <FaTimes />
                              رفض
                            </button>
                          </>
                        )}

                        {/* EDIT ALWAYS VISIBLE */}
                        <button
                          type="button"
                          className="mobile-action edit"
                          onClick={() =>
                            openEditLeave(
                              leave
                            )
                          }
                          disabled={saving}
                        >
                          <FaEdit />
                          تعديل
                        </button>

                        <button
                          type="button"
                          className="mobile-action view"
                          onClick={() =>
                            openLeaveDetails(
                              leave
                            )
                          }
                          disabled={saving}
                        >
                          <FaEye />
                          عرض
                        </button>

                        <button
                          type="button"
                          className="mobile-action delete"
                          onClick={() =>
                            requestDeleteLeave(
                              leave.leave_id
                            )
                          }
                          disabled={saving}
                        >
                          <FaTrash />
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedLeave && (
        <div
          className="modal-overlay"
          onClick={closeLeaveDetails}
        >
          <div
            className="details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  تفاصيل طلب الإجازة
                </h2>

                <p>
                  معلومات كاملة عن الطلب
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeLeaveDetails
                }
              >
                <FaClose />
              </button>
            </div>

            <div className="details-content">
              <div className="detail-employee">
                <div className="detail-avatar">
                  {getEmployeeName(
                    selectedLeave
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>
                    {getEmployeeName(
                      selectedLeave
                    )}
                  </h3>

                  <p>
                    {getEmployeeRole(
                      selectedLeave
                    )}
                  </p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span>
                    نوع الإجازة
                  </span>

                  <strong>
                    {getLeaveTypeLabel(
                      selectedLeave.type
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>الحالة</span>

                  <strong>
                    {getStatusLabel(
                      selectedLeave.status
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    تاريخ البداية
                  </span>

                  <strong>
                    {formatDate(
                      selectedLeave.from_date
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    تاريخ النهاية
                  </span>

                  <strong>
                    {formatDate(
                      selectedLeave.to_date
                    )}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>
                    عدد الأيام
                  </span>

                  <strong>
                    {selectedLeave.days ??
                      "-"}{" "}
                    يوم
                  </strong>
                </div>

                <div className="detail-item">
                  <span>المرفق</span>

                  <strong>
                    {getAttachmentUrl(
                      selectedLeave
                    )
                      ? "يوجد مرفق"
                      : "لا يوجد"}
                  </strong>
                </div>
              </div>

              {selectedLeave.notes && (
                <div className="details-notes">
                  <h4>
                    الملاحظات
                  </h4>

                  <p>
                    {selectedLeave.notes}
                  </p>
                </div>
              )}

              {getAttachmentUrl(
                selectedLeave
              ) && (
                <button
                  type="button"
                  className="details-attachment-button"
                  onClick={() =>
                    openAttachment(
                      selectedLeave
                    )
                  }
                >
                  <FaPaperclip />
                  عرض المرفق
                </button>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={
                  closeLeaveDetails
                }
              >
                إغلاق
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const leave =
                    selectedLeave;

                  setSelectedLeave(
                    null
                  );

                  openEditLeave(leave);
                }}
              >
                <FaEdit />
                تعديل الطلب
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
            className="attachment-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  مرفق طلب الإجازة
                </h2>

                <p>
                  {selectedAttachment.employeeName}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeAttachment
                }
              >
                <FaClose />
              </button>
            </div>

            <div className="attachment-preview">
              {selectedAttachment.isPdf ? (
                <iframe
                  src={
                    selectedAttachment.url
                  }
                  title="Leave Attachment"
                  className="pdf-preview"
                />
              ) : (
                <img
                  src={
                    selectedAttachment.url
                  }
                  alt="مرفق الإجازة"
                  className="image-preview"
                />
              )}
            </div>

            <div className="attachment-actions">
              <a
                href={
                  selectedAttachment.url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-action-button open"
              >
                <FaEye />
                فتح في نافذة جديدة
              </a>

              <a
                href={
                  selectedAttachment.url
                }
                download
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-action-button download"
              >
                <FaDownload />
                تحميل المرفق
              </a>

              <button
                type="button"
                className="attachment-action-button close"
                onClick={
                  closeAttachment
                }
              >
                <FaClose />
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
            className="edit-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  تعديل طلب الإجازة
                </h2>

                <p>
                  {getEmployeeName(
                    editingLeave
                  )}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeEditModal
                }
                disabled={saving}
              >
                <FaClose />
              </button>
            </div>

            <div className="edit-form">
              <div className="form-group">
                <label>
                  نوع الإجازة
                </label>

                <select
                  name="type"
                  value={
                    editForm.type
                  }
                  onChange={
                    handleEditChange
                  }
                  disabled={saving}
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
                        {getLeaveTypeLabel(
                          type
                        )}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    تاريخ البداية
                  </label>

                  <input
                    type="date"
                    name="from_date"
                    value={
                      editForm.from_date
                    }
                    onChange={
                      handleEditChange
                    }
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>
                    تاريخ النهاية
                  </label>

                  <input
                    type="date"
                    name="to_date"
                    value={
                      editForm.to_date
                    }
                    min={
                      editForm.from_date ||
                      undefined
                    }
                    onChange={
                      handleEditChange
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  الملاحظات
                </label>

                <textarea
                  name="notes"
                  value={
                    editForm.notes
                  }
                  onChange={
                    handleEditChange
                  }
                  placeholder="أدخل الملاحظات إن وجدت..."
                  rows="4"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>
                  المرفق
                </label>

                {getAttachmentUrl(
                  editingLeave
                ) && (
                  <div className="current-attachment">
                    <div>
                      <FaPaperclip />

                      <span>
                        يوجد مرفق حالي
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openAttachment(
                          editingLeave
                        )
                      }
                      disabled={saving}
                    >
                      <FaEye />
                      عرض
                    </button>
                  </div>
                )}

                <label className="file-upload-box">
                  <FaPaperclip />

                  <span>
                    {editForm.attachment
                      ? editForm
                          .attachment
                          .name
                      : "اختيار مرفق جديد"}
                  </span>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={
                      handleEditFileChange
                    }
                    disabled={saving}
                  />
                </label>

                <small>
                  يسمح بـ JPG, PNG, WEBP,
                  PDF — الحد الأقصى 5MB
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={
                  closeEditModal
                }
                disabled={saving}
              >
                <FaClose />
                إلغاء
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSyncAlt className="spin-icon" />
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
          CONFIRMATION MODAL
      ===================================================== */}

      {confirmModal && (
        <div
          className="modal-overlay"
          onClick={closeConfirmModal}
        >
          <div
            className={`confirm-modal ${confirmModal.type}`}
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

            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-cancel"
                onClick={
                  closeConfirmModal
                }
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                type="button"
                className={`confirm-submit ${confirmModal.type}`}
                onClick={
                  confirmAction
                }
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSyncAlt className="spin-icon" />
                    جاري التنفيذ...
                  </>
                ) : (
                  confirmModal.confirmText
                )}
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
          onClick={
            closeMessageModal
          }
        >
          <div
            className={`message-modal ${messageModal.type}`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="message-icon">
              {messageModal.type ===
                "success" && (
                <FaCheckCircle />
              )}

              {messageModal.type ===
                "error" && (
                <FaTimesCircle />
              )}

              {messageModal.type ===
                "warning" && (
                <FaClock />
              )}

              {messageModal.type ===
                "info" && (
                <FaFileAlt />
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
              className={`message-button ${messageModal.type}`}
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