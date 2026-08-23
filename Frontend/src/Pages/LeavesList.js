import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

export default function LeavesList() {
  const nav = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);

  // عرض تفاصيل
  const [selectedLeave, setSelectedLeave] = useState(null);

  // تعديل الإجازة
  const [editingLeave, setEditingLeave] = useState(null);

  const [editForm, setEditForm] = useState({
    type: "",
    from_date: "",
    to_date: "",
    notes: "",
  });

  // =========================================================
  // FETCH
  // =========================================================

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await API.get("/leaves");

      setLeaves(res.data || []);
    } catch (error) {
      console.error(error);
      alert("فشل تحميل الإجازات");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusKey = (status) => {
    if (!status) return "pending";

    const s = String(status).toLowerCase().trim();

    if (
      s === "approved" ||
      s === "مقبول"
    ) {
      return "approved";
    }

    if (
      s === "rejected" ||
      s === "مرفوض"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const getStatusInfo = (status) => {
    const key = getStatusKey(status);

    if (key === "approved") {
      return {
        text: "مقبول",
        color: "#4ade80",
        background: "rgba(34,197,94,0.1)",
        border: "1px solid rgba(34,197,94,0.2)",
      };
    }

    if (key === "rejected") {
      return {
        text: "مرفوض",
        color: "#f87171",
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.2)",
      };
    }

    return {
      text: "قيد الانتظار",
      color: "#facc15",
      background: "rgba(234,179,8,0.1)",
      border: "1px solid rgba(234,179,8,0.2)",
    };
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = leaves.length;

    const pending = leaves.filter(
      (leave) =>
        getStatusKey(leave.status) === "pending"
    ).length;

    const approved = leaves.filter(
      (leave) =>
        getStatusKey(leave.status) === "approved"
    ).length;

    const rejected = leaves.filter(
      (leave) =>
        getStatusKey(leave.status) === "rejected"
    ).length;

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }, [leaves]);

  // =========================================================
  // TYPES
  // =========================================================

  const leaveTypes = [
    ...new Set(
      leaves
        .map((leave) => leave.type)
        .filter(Boolean)
    ),
  ];

  // =========================================================
  // FILTER
  // =========================================================

  const filteredLeaves = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return leaves.filter((leave) => {
      const statusKey = getStatusKey(leave.status);

      const matchesSearch =
        String(leave.name || "")
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
        ? statusKey === getStatusKey(filterStatus)
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

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (id, status) => {
    const leave = leaves.find(
      (item) => item.leave_id === id
    );

    const actionText =
      status === "approved"
        ? "قبول"
        : "رفض";

    if (
      !window.confirm(
        `هل أنت متأكد من ${actionText} طلب الإجازة للموظف "${leave?.name || ""}"؟`
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
        prev.map((leave) =>
          leave.leave_id === id
            ? {
                ...leave,
                status,
              }
            : leave
        )
      );

      setSelectedLeave(null);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          `فشل ${actionText} طلب الإجازة`
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

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

  // =========================================================
  // UPDATE LEAVE
  // =========================================================

  const updateLeave = async () => {
    if (
      !editForm.type ||
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
          leave.leave_id ===
          editingLeave.leave_id
            ? {
                ...leave,
                ...res.data,
              }
            : leave
        )
      );

      setEditingLeave(null);

      alert("تم تعديل الإجازة بنجاح");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "فشل تعديل الإجازة"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EXCEL
  // =========================================================

  const exportToExcel = () => {
    if (filteredLeaves.length === 0) {
      alert("لا توجد بيانات لتصديرها");
      return;
    }

    const data = filteredLeaves.map((leave) => ({
      الموظف: leave.name,
      "نوع الإجازة": leave.type,
      "من تاريخ": leave.from_date,
      "إلى تاريخ": leave.to_date,
      "عدد الأيام": leave.days,
      الملاحظات: leave.notes || "",
      الحالة: getStatusInfo(leave.status).text,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

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

  // =========================================================
  // NAVIGATION
  // =========================================================

  const goTo = (path) => {
    setMobileMenu(false);
    nav(path);
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      const d = new Date(date);

      if (Number.isNaN(d.getTime())) {
        return date;
      }

      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return date;
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div style={styles.app}>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        style={{
          ...styles.sidebar,
          ...(mobileMenu
            ? styles.sidebarMobileOpen
            : {}),
        }}
      >
        <div style={styles.logoArea}>

          <div style={styles.logoIcon}>
            HR
          </div>

          <div>
            <div style={styles.logoTitle}>
              إدارة الموظفين
            </div>

            <div style={styles.logoSubtitle}>
              نظام الموارد البشرية
            </div>
          </div>

        </div>

        <div style={styles.sidebarDivider} />

        <div style={styles.menuTitle}>
          القائمة الرئيسية
        </div>

        <button
          style={styles.menuItem}
          onClick={() =>
            goTo("/admin-dashboard")
          }
        >
          <span style={styles.menuIcon}>
            ⌂
          </span>

          لوحة التحكم
        </button>

        <button
          style={styles.menuItem}
          onClick={() =>
            goTo("/employees")
          }
        >
          <span style={styles.menuIcon}>
            👨‍💼
          </span>

          الموظفين
        </button>

        <button
          style={{
            ...styles.menuItem,
            ...styles.menuItemActive,
          }}
          onClick={() =>
            goTo("/leaves-list")
          }
        >
          <span style={styles.menuIcon}>
            📅
          </span>

          الإجازات
        </button>

        <button
          style={styles.menuItem}
          onClick={() =>
            goTo("/history")
          }
        >
          <span style={styles.menuIcon}>
            📊
          </span>

          التقييمات
        </button>

        <button
          style={styles.menuItem}
          onClick={() =>
            goTo("/tasks")
          }
        >
          <span style={styles.menuIcon}>
            ✓
          </span>

          المهام
        </button>

        <div style={styles.sidebarBottom}>

          <button
            style={styles.menuItem}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              nav("/");
            }}
          >
            <span style={styles.menuIcon}>
              🚪
            </span>

            تسجيل الخروج
          </button>

        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main style={styles.main}>

        {/* HEADER */}

        <header style={styles.header}>

          <div style={styles.headerRight}>

            <button
              style={styles.mobileMenuButton}
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
            >
              ☰
            </button>

            <div>

              <div style={styles.breadcrumb}>
                لوحة التحكم / الإجازات
              </div>

              <h1 style={styles.pageTitle}>
                إدارة الإجازات
              </h1>

              <p style={styles.pageDescription}>
                إدارة ومتابعة طلبات إجازات الموظفين
              </p>

            </div>

          </div>

          <div style={styles.headerActions}>

            <button
              style={styles.backButton}
              onClick={() => nav(-1)}
            >
              ← رجوع
            </button>

            <button
              style={styles.primaryButton}
              onClick={() =>
                nav("/leave")
              }
            >
              <span>＋</span>
              إضافة إجازة
            </button>

          </div>

        </header>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section style={styles.statsGrid}>

          {/* TOTAL */}

          <div
            style={{
              ...styles.statCard,
              borderTop:
                "3px solid #6366f1",
            }}
          >
            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(99,102,241,0.15)",
              }}
            >
              📅
            </div>

            <div>

              <div style={styles.statLabel}>
                إجمالي الإجازات
              </div>

              <div style={styles.statNumber}>
                {statistics.total}
              </div>

            </div>
          </div>

          {/* PENDING */}

          <div
            style={{
              ...styles.statCard,
              borderTop:
                "3px solid #eab308",
            }}
          >
            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(234,179,8,0.15)",
              }}
            >
              ⏳
            </div>

            <div>

              <div style={styles.statLabel}>
                قيد الانتظار
              </div>

              <div
                style={{
                  ...styles.statNumber,
                  color: "#facc15",
                }}
              >
                {statistics.pending}
              </div>

            </div>
          </div>

          {/* APPROVED */}

          <div
            style={{
              ...styles.statCard,
              borderTop:
                "3px solid #22c55e",
            }}
          >
            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(34,197,94,0.15)",
              }}
            >
              ✓
            </div>

            <div>

              <div style={styles.statLabel}>
                الإجازات المقبولة
              </div>

              <div
                style={{
                  ...styles.statNumber,
                  color: "#4ade80",
                }}
              >
                {statistics.approved}
              </div>

            </div>
          </div>

          {/* REJECTED */}

          <div
            style={{
              ...styles.statCard,
              borderTop:
                "3px solid #ef4444",
            }}
          >
            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(239,68,68,0.15)",
              }}
            >
              ✕
            </div>

            <div>

              <div style={styles.statLabel}>
                الإجازات المرفوضة
              </div>

              <div
                style={{
                  ...styles.statNumber,
                  color: "#f87171",
                }}
              >
                {statistics.rejected}
              </div>

            </div>
          </div>

        </section>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <section style={styles.toolbar}>

          <div style={styles.searchWrapper}>

            <span style={styles.searchIcon}>
              🔍
            </span>

            <input
              type="text"
              placeholder="ابحث باسم الموظف أو نوع الإجازة..."
              style={styles.searchInput}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div style={styles.filters}>

            {/* TYPE */}

            <select
              style={styles.select}
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

            {/* STATUS */}

            <select
              style={styles.select}
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
                مقبول
              </option>

              <option value="rejected">
                مرفوض
              </option>
            </select>

            {/* EXCEL */}

            <button
              style={styles.excelButton}
              onClick={exportToExcel}
            >
              📥 Excel
            </button>

          </div>

        </section>

        {/* ===================================================
            TABLE
        =================================================== */}

        <section style={styles.tableContainer}>

          <div style={styles.tableHeader}>

            <div>

              <h2 style={styles.sectionTitle}>
                قائمة الإجازات
              </h2>

              <span style={styles.resultsCount}>
                عرض {filteredLeaves.length} طلب إجازة
              </span>

            </div>

            <button
              style={styles.refreshButton}
              onClick={fetchLeaves}
              disabled={loading}
            >
              ↻ تحديث
            </button>

          </div>

          {/* LOADING */}

          {loading ? (

            <div style={styles.emptyState}>

              <div style={styles.loadingSpinner}>
                ⟳
              </div>

              <p>
                جاري تحميل الإجازات...
              </p>

            </div>

          ) : filteredLeaves.length === 0 ? (

            /* EMPTY */

            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                📅
              </div>

              <h3>
                لا توجد إجازات
              </h3>

              <p>
                لم يتم العثور على طلبات إجازات
                مطابقة للبحث أو الفلاتر الحالية.
              </p>

            </div>

          ) : (

            <>

              {/* =============================================
                  DESKTOP TABLE
              ============================================= */}

              <div style={styles.desktopTable}>

                <div style={styles.tableHead}>

                  <div>
                    الموظف
                  </div>

                  <div>
                    نوع الإجازة
                  </div>

                  <div>
                    من
                  </div>

                  <div>
                    إلى
                  </div>

                  <div>
                    الحالة
                  </div>

                  <div>
                    الإجراءات
                  </div>

                </div>

                {filteredLeaves.map(
                  (leave) => {

                    const status =
                      getStatusInfo(
                        leave.status
                      );

                    const statusKey =
                      getStatusKey(
                        leave.status
                      );

                    return (

                      <div
                        key={leave.leave_id}
                        style={styles.tableRow}
                      >

                        {/* EMPLOYEE */}

                        <div style={styles.employeeCell}>

                          <div style={styles.avatar}>
                            {String(
                              leave.name || "م"
                            ).charAt(0)}
                          </div>

                          <div>

                            <div
                              style={
                                styles.employeeName
                              }
                            >
                              {leave.name ||
                                "غير محدد"}
                            </div>

                            <div
                              style={
                                styles.employeeRole
                              }
                            >
                              طلب إجازة
                            </div>

                          </div>

                        </div>

                        {/* TYPE */}

                        <div>

                          <span
                            style={
                              styles.leaveTypeBadge
                            }
                          >
                            {leave.type || "—"}
                          </span>

                        </div>

                        {/* FROM */}

                        <div style={styles.dateCell}>
                          {formatDate(
                            leave.from_date
                          )}
                        </div>

                        {/* TO */}

                        <div style={styles.dateCell}>
                          {formatDate(
                            leave.to_date
                          )}
                        </div>

                        {/* STATUS */}

                        <div>

                          <span
                            style={{
                              ...styles.statusBadge,
                              background:
                                status.background,
                              color:
                                status.color,
                              border:
                                status.border,
                            }}
                          >

                            <span
                              style={{
                                ...styles.statusDot,
                                background:
                                  status.color,
                              }}
                            />

                            {status.text}

                          </span>

                        </div>

                        {/* ACTIONS */}

                        <div style={styles.actions}>

                          {statusKey ===
                          "pending" ? (

                            <>

                              {/* قبول */}

                              <button
                                style={
                                  styles.acceptButton
                                }
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

                              {/* رفض */}

                              <button
                                style={
                                  styles.rejectButton
                                }
                                title="رفض الطلب"
                                onClick={() =>
                                  updateStatus(
                                    leave.leave_id,
                                    "rejected"
                                  )
                                }
                                disabled={saving}
                              >
                                ✕
                              </button>

                              {/* تعديل */}

                              <button
                                style={
                                  styles.editButton
                                }
                                title="تعديل الإجازة"
                                onClick={() =>
                                  openEditLeave(
                                    leave
                                  )
                                }
                                disabled={saving}
                              >
                                ✏️
                              </button>

                            </>

                          ) : (

                            <button
                              style={
                                styles.viewButton
                              }
                              title="عرض التفاصيل"
                              onClick={() =>
                                setSelectedLeave(
                                  leave
                                )
                              }
                            >
                              👁️
                            </button>

                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              {/* =============================================
                  MOBILE CARDS
              ============================================= */}

              <div style={styles.mobileCards}>

                {filteredLeaves.map(
                  (leave) => {

                    const status =
                      getStatusInfo(
                        leave.status
                      );

                    const statusKey =
                      getStatusKey(
                        leave.status
                      );

                    return (

                      <div
                        key={leave.leave_id}
                        style={
                          styles.mobileLeaveCard
                        }
                      >

                        {/* TOP */}

                        <div
                          style={
                            styles.mobileLeaveTop
                          }
                        >

                          <div
                            style={
                              styles.employeeCell
                            }
                          >

                            <div
                              style={
                                styles.avatar
                              }
                            >
                              {String(
                                leave.name || "م"
                              ).charAt(0)}
                            </div>

                            <div>

                              <div
                                style={
                                  styles.employeeName
                                }
                              >
                                {leave.name ||
                                  "غير محدد"}
                              </div>

                              <div
                                style={
                                  styles.employeeRole
                                }
                              >
                                {leave.type ||
                                  "إجازة"}
                              </div>

                            </div>

                          </div>

                          <span
                            style={{
                              ...styles.statusBadge,
                              background:
                                status.background,
                              color:
                                status.color,
                              border:
                                status.border,
                            }}
                          >

                            <span
                              style={{
                                ...styles.statusDot,
                                background:
                                  status.color,
                              }}
                            />

                            {status.text}

                          </span>

                        </div>

                        {/* INFO */}

                        <div
                          style={
                            styles.mobileInfo
                          }
                        >

                          <div>
                            <small>
                              نوع الإجازة
                            </small>

                            <span>
                              {leave.type || "—"}
                            </span>
                          </div>

                          <div>
                            <small>
                              من
                            </small>

                            <span>
                              {formatDate(
                                leave.from_date
                              )}
                            </span>
                          </div>

                          <div>
                            <small>
                              إلى
                            </small>

                            <span>
                              {formatDate(
                                leave.to_date
                              )}
                            </span>
                          </div>

                          <div>
                            <small>
                              عدد الأيام
                            </small>

                            <span>
                              {leave.days || "—"}
                            </span>
                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div
                          style={
                            styles.mobileActions
                          }
                        >

                          {statusKey ===
                          "pending" ? (

                            <>

                              <button
                                style={
                                  styles.mobileAcceptButton
                                }
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
                                style={
                                  styles.mobileRejectButton
                                }
                                onClick={() =>
                                  updateStatus(
                                    leave.leave_id,
                                    "rejected"
                                  )
                                }
                                disabled={saving}
                              >
                                ✕ رفض
                              </button>

                              <button
                                style={
                                  styles.mobileEditButton
                                }
                                onClick={() =>
                                  openEditLeave(
                                    leave
                                  )
                                }
                                disabled={saving}
                              >
                                ✏️ تعديل
                              </button>

                            </>

                          ) : (

                            <button
                              style={
                                styles.mobileViewButton
                              }
                              onClick={() =>
                                setSelectedLeave(
                                  leave
                                )
                              }
                            >
                              👁️ عرض التفاصيل
                            </button>

                          )}

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
          DETAILS MODAL
      ===================================================== */}

      {selectedLeave && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  📅 تفاصيل طلب الإجازة
                </h2>

                <p style={styles.modalSubtitle}>
                  تفاصيل الطلب المقدم من{" "}
                  <strong>
                    {selectedLeave.name}
                  </strong>
                </p>

              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setSelectedLeave(null)
                }
              >
                ✕
              </button>

            </div>

            <div style={styles.modalBody}>

              <div style={styles.detailGrid}>

                <div style={styles.detailItem}>
                  <span>الموظف</span>

                  <strong>
                    {selectedLeave.name ||
                      "—"}
                  </strong>
                </div>

                <div style={styles.detailItem}>
                  <span>نوع الإجازة</span>

                  <strong>
                    {selectedLeave.type ||
                      "—"}
                  </strong>
                </div>

                <div style={styles.detailItem}>
                  <span>من تاريخ</span>

                  <strong>
                    {formatDate(
                      selectedLeave.from_date
                    )}
                  </strong>
                </div>

                <div style={styles.detailItem}>
                  <span>إلى تاريخ</span>

                  <strong>
                    {formatDate(
                      selectedLeave.to_date
                    )}
                  </strong>
                </div>

                <div style={styles.detailItem}>
                  <span>عدد الأيام</span>

                  <strong>
                    {selectedLeave.days ||
                      "—"}
                  </strong>
                </div>

                <div style={styles.detailItem}>
                  <span>الملاحظات</span>

                  <strong>
                    {selectedLeave.notes ||
                      "لا توجد ملاحظات"}
                  </strong>
                </div>

                <div
                  style={{
                    ...styles.detailItem,
                    gridColumn: "1 / -1",
                  }}
                >
                  <span>الحالة</span>

                  <strong
                    style={{
                      color:
                        getStatusInfo(
                          selectedLeave.status
                        ).color,
                    }}
                  >
                    {
                      getStatusInfo(
                        selectedLeave.status
                      ).text
                    }
                  </strong>
                </div>

              </div>

            </div>

            <div style={styles.modalFooter}>

              <button
                style={styles.cancelButton}
                onClick={() =>
                  setSelectedLeave(null)
                }
              >
                إغلاق
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT LEAVE MODAL
      ===================================================== */}

      {editingLeave && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  ✏️ تعديل طلب الإجازة
                </h2>

                <p style={styles.modalSubtitle}>
                  تعديل طلب الإجازة للموظف{" "}
                  <strong>
                    {editingLeave.name}
                  </strong>
                </p>

              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setEditingLeave(null)
                }
                disabled={saving}
              >
                ✕
              </button>

            </div>

            <div style={styles.modalBody}>

              {/* TYPE */}

              <div style={styles.formGroup}>

                <label style={styles.formLabel}>
                  نوع الإجازة
                </label>

                <input
                  type="text"
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      type: e.target.value,
                    })
                  }
                  style={styles.formInput}
                  placeholder="مثال: إجازة سنوية"
                />

              </div>

              {/* DATES */}

              <div style={styles.editDateGrid}>

                <div style={styles.formGroup}>

                  <label style={styles.formLabel}>
                    من تاريخ
                  </label>

                  <input
                    type="date"
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
                    style={styles.formInput}
                  />

                </div>

                <div style={styles.formGroup}>

                  <label style={styles.formLabel}>
                    إلى تاريخ
                  </label>

                  <input
                    type="date"
                    value={
                      editForm.to_date
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        to_date:
                          e.target.value,
                      })
                    }
                    style={styles.formInput}
                  />

                </div>

              </div>

              {/* DAYS */}

              {editForm.from_date &&
                editForm.to_date &&
                new Date(editForm.to_date) >=
                  new Date(
                    editForm.from_date
                  ) && (

                  <div style={styles.daysPreview}>
                    عدد أيام الإجازة بعد التعديل:{" "}
                    <strong>
                      {Math.ceil(
                        (
                          new Date(
                            editForm.to_date
                          ).getTime() -
                          new Date(
                            editForm.from_date
                          ).getTime()
                        ) /
                          (1000 *
                            60 *
                            60 *
                            24)
                      ) + 1}
                    </strong>{" "}
                    يوم
                  </div>
                )}

              {/* NOTES */}

              <div style={styles.formGroup}>

                <label style={styles.formLabel}>
                  الملاحظات
                </label>

                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      notes: e.target.value,
                    })
                  }
                  style={styles.formTextarea}
                  placeholder="أدخل الملاحظات..."
                  rows={4}
                />

              </div>

            </div>

            <div style={styles.modalFooter}>

              <button
                style={styles.cancelButton}
                onClick={() =>
                  setEditingLeave(null)
                }
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                style={styles.primaryButton}
                onClick={updateLeave}
                disabled={saving}
              >
                {saving
                  ? "جاري الحفظ..."
                  : "💾 حفظ التعديلات"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileMenu && (

        <div
          style={styles.mobileOverlay}
          onClick={() =>
            setMobileMenu(false)
          }
        />

      )}

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {

  app: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #070d1a 0%, #0f172a 50%, #111827 100%)",
    color: "#fff",
    direction: "rtl",
    fontFamily:
      "Cairo, Tahoma, Arial, sans-serif",
    display: "flex",
  },

  /* ================= SIDEBAR ================= */

  sidebar: {
    width: "260px",
    minHeight: "100vh",
    background:
      "rgba(15,23,42,0.95)",
    borderLeft:
      "1px solid rgba(255,255,255,0.08)",
    padding: "25px 16px",
    position: "fixed",
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    boxSizing: "border-box",
    backdropFilter: "blur(20px)",
    transition: "0.3s",
  },

  sidebarMobileOpen: {
    transform: "translateX(0)",
  },

  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "5px 8px 20px",
  },

  logoIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "15px",
    boxShadow:
      "0 8px 25px rgba(99,102,241,0.35)",
  },

  logoTitle: {
    fontSize: "15px",
    fontWeight: "800",
  },

  logoSubtitle: {
    color: "#64748b",
    fontSize: "11px",
    marginTop: "3px",
  },

  sidebarDivider: {
    height: "1px",
    background:
      "rgba(255,255,255,0.07)",
    margin: "5px 8px 22px",
  },

  menuTitle: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    margin:
      "0 10px 10px",
  },

  menuItem: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    marginBottom: "6px",
    borderRadius: "11px",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "right",
    transition: "0.2s",
    fontFamily: "inherit",
  },

  menuItemActive: {
    background:
      "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.12))",
    color: "#fff",
    border:
      "1px solid rgba(99,102,241,0.25)",
  },

  menuIcon: {
    width: "24px",
    textAlign: "center",
    fontSize: "16px",
  },

  sidebarBottom: {
    position: "absolute",
    bottom: "25px",
    left: "16px",
    right: "16px",
    borderTop:
      "1px solid rgba(255,255,255,0.06)",
    paddingTop: "15px",
  },

  /* ================= MAIN ================= */

  main: {
    marginRight: "260px",
    width: "calc(100% - 260px)",
    minHeight: "100vh",
    padding: "30px",
    boxSizing: "border-box",
  },

  /* ================= HEADER ================= */

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  breadcrumb: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "6px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  pageDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  backButton: {
    padding: "10px 15px",
    borderRadius: "10px",
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "inherit",
  },

  primaryButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 17px",
    borderRadius: "10px",
    border: "none",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow:
      "0 8px 20px rgba(99,102,241,0.25)",
    fontFamily: "inherit",
  },

  mobileMenuButton: {
    display: "none",
    border: "none",
    background:
      "rgba(255,255,255,0.07)",
    color: "#fff",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "18px",
    cursor: "pointer",
  },

  /* ================= STATS ================= */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },

  statCard: {
    background:
      "rgba(15,23,42,0.72)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.18)",
  },

  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    marginBottom: "5px",
  },

  statNumber: {
    fontSize: "25px",
    fontWeight: "800",
  },

  /* ================= TOOLBAR ================= */

  toolbar: {
    background:
      "rgba(15,23,42,0.72)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "15px",
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },

  searchWrapper: {
    position: "relative",
    flex: 1,
    minWidth: "240px",
  },

  searchIcon: {
    position: "absolute",
    right: "13px",
    top: "50%",
    transform:
      "translateY(-50%)",
    opacity: 0.6,
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    background:
      "rgba(255,255,255,0.04)",
    border:
      "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    padding:
      "11px 40px 11px 13px",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "12px",
  },

  filters: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  select: {
    background: "#111827",
    border:
      "1px solid rgba(255,255,255,0.1)",
    color: "#cbd5e1",
    padding: "10px 12px",
    borderRadius: "9px",
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
  },

  excelButton: {
    background:
      "rgba(34,197,94,0.1)",
    border:
      "1px solid rgba(34,197,94,0.2)",
    color: "#4ade80",
    padding: "10px 12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  /* ================= TABLE ================= */

  tableContainer: {
    background:
      "rgba(15,23,42,0.72)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 12px 30px rgba(0,0,0,0.15)",
  },

  tableHeader: {
    padding: "18px 20px",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "800",
  },

  resultsCount: {
    display: "block",
    marginTop: "4px",
    color: "#64748b",
    fontSize: "11px",
  },

  refreshButton: {
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  desktopTable: {
    width: "100%",
  },

  tableHead: {
    display: "grid",
    gridTemplateColumns:
      "1.7fr 1.3fr 1.1fr 1.1fr 1.2fr 1fr",
    gap: "15px",
    padding: "13px 20px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns:
      "1.7fr 1.3fr 1.1fr 1.1fr 1.2fr 1fr",
    gap: "15px",
    alignItems: "center",
    padding: "14px 20px",
    borderBottom:
      "1px solid rgba(255,255,255,0.045)",
    transition: "0.2s",
    fontSize: "12px",
  },

  employeeCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },

  avatar: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg,#6366f1,#8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "14px",
  },

  employeeName: {
    fontWeight: "700",
    color: "#f8fafc",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  employeeRole: {
    color: "#64748b",
    fontSize: "10px",
    marginTop: "3px",
  },

  leaveTypeBadge: {
    display: "inline-block",
    background:
      "rgba(56,189,248,0.1)",
    color: "#38bdf8",
    padding: "5px 9px",
    borderRadius: "7px",
    fontSize: "10px",
  },

  dateCell: {
    color: "#cbd5e1",
    direction: "ltr",
    textAlign: "right",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  statusDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
  },

  actions: {
    display: "flex",
    gap: "6px",
  },

  acceptButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border:
      "1px solid rgba(34,197,94,0.2)",
    background:
      "rgba(34,197,94,0.1)",
    color: "#4ade80",
    cursor: "pointer",
    fontWeight: "700",
  },

  rejectButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border:
      "1px solid rgba(239,68,68,0.2)",
    background:
      "rgba(239,68,68,0.1)",
    color: "#f87171",
    cursor: "pointer",
    fontWeight: "700",
  },

  editButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border:
      "1px solid rgba(245,158,11,0.2)",
    background:
      "rgba(245,158,11,0.1)",
    color: "#fbbf24",
    cursor: "pointer",
    fontWeight: "700",
  },

  viewButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border:
      "1px solid rgba(59,130,246,0.2)",
    background:
      "rgba(59,130,246,0.1)",
    cursor: "pointer",
  },

  /* ================= MOBILE ================= */

  mobileCards: {
    display: "none",
  },

  mobileLeaveCard: {
    background:
      "rgba(255,255,255,0.025)",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: "13px",
    padding: "14px",
    marginBottom: "10px",
  },

  mobileLeaveTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "10px",
  },

  mobileInfo: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "10px",
    marginTop: "15px",
  },

  mobileActions: {
    display: "flex",
    gap: "8px",
    marginTop: "14px",
  },

  mobileAcceptButton: {
    flex: 1,
    background:
      "rgba(34,197,94,0.12)",
    color: "#4ade80",
    border:
      "1px solid rgba(34,197,94,0.2)",
    padding: "9px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  mobileRejectButton: {
    flex: 1,
    background:
      "rgba(239,68,68,0.12)",
    color: "#f87171",
    border:
      "1px solid rgba(239,68,68,0.2)",
    padding: "9px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  mobileEditButton: {
    flex: 1,
    background:
      "rgba(245,158,11,0.12)",
    color: "#fbbf24",
    border:
      "1px solid rgba(245,158,11,0.2)",
    padding: "9px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
  },

  mobileViewButton: {
    flex: 1,
    background:
      "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    border:
      "1px solid rgba(59,130,246,0.2)",
    padding: "9px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* ================= EMPTY ================= */

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
    opacity: 0.6,
  },

  loadingSpinner: {
    fontSize: "35px",
    animation:
      "spin 1s linear infinite",
  },

  /* ================= MODAL ================= */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,0.75)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
    boxSizing: "border-box",
  },

  modal: {
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
    background:
      "linear-gradient(145deg,#111827,#0f172a)",
    border:
      "1px solid rgba(255,255,255,0.09)",
    borderRadius: "18px",
    boxShadow:
      "0 25px 80px rgba(0,0,0,0.5)",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    padding: "20px",
    borderBottom:
      "1px solid rgba(255,255,255,0.06)",
  },

  modalTitle: {
    margin: 0,
    fontSize: "18px",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  closeButton: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    border: "none",
    background:
      "rgba(255,255,255,0.06)",
    color: "#94a3b8",
    cursor: "pointer",
  },

  modalBody: {
    padding: "20px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "15px",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "14px",
  },

  modalFooter: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: "10px",
    padding: "15px 20px",
    borderTop:
      "1px solid rgba(255,255,255,0.06)",
  },

  cancelButton: {
    padding: "10px 18px",
    borderRadius: "9px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#cbd5e1",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* ================= EDIT FORM ================= */

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "16px",
  },

  formLabel: {
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "700",
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    background:
      "rgba(255,255,255,0.04)",
    border:
      "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "11px 12px",
    borderRadius: "9px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "12px",
  },

  formTextarea: {
    width: "100%",
    boxSizing: "border-box",
    background:
      "rgba(255,255,255,0.04)",
    border:
      "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "11px 12px",
    borderRadius: "9px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: "12px",
    resize: "vertical",
  },

  editDateGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "12px",
  },

  daysPreview: {
    background:
      "rgba(99,102,241,0.1)",
    border:
      "1px solid rgba(99,102,241,0.2)",
    color: "#a5b4fc",
    padding: "11px 13px",
    borderRadius: "9px",
    marginBottom: "16px",
    fontSize: "12px",
  },

  mobileOverlay: {
    display: "none",
  },
};

/* =========================================================
   RESPONSIVE
========================================================= */

if (typeof document !== "undefined") {
  const styleId =
    "leaves-responsive-styles";

  if (!document.getElementById(styleId)) {
    const style =
      document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      button:hover {
        opacity: 0.9;
      }

      input::placeholder,
      textarea::placeholder {
        color: #64748b;
      }

      select option {
        background: #111827;
        color: #fff;
      }

      input[type="date"] {
        color-scheme: dark;
      }

      @media (max-width: 900px) {

        .leaves-responsive {}

      }

      @media (max-width: 768px) {

        body {
          overflow-x: hidden;
        }

        /* Sidebar */

        aside {
          transform: translateX(100%);
        }

        /* Main */

        main {
          margin-right: 0 !important;
          width: 100% !important;
          padding: 20px !important;
        }

        /* Mobile menu */

        button {
          -webkit-tap-highlight-color: transparent;
        }

      }

      @media (max-width: 700px) {

        header {
          align-items: flex-start !important;
          flex-direction: column !important;
        }

        .leaves-responsive {}

      }

      @media (max-width: 600px) {

        /* Stats */

        section {
          max-width: 100%;
        }

        /* Table */

        [style*="grid-template-columns: 1.7fr"] {
          display: none !important;
        }

      }

      @media (max-width: 500px) {

        .leaves-responsive {}

      }
    `;

    document.head.appendChild(style);
  }
}