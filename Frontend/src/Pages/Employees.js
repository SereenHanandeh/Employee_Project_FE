import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

export default function Employees() {
  const nav = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");


  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    role: "",
  });

  // ================= FETCH =================

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await API.get("/employees");

      setEmployees(res.data || []);
    } catch (error) {
      console.error(error);
      alert("فشل تحميل الموظفين");
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS =================

  const getStatusKey = (status) => {
    if (!status) return "";

    const s = String(status).toLowerCase().trim();

    if (s === "نشط" || s === "active") {
      return "active";
    }

    if (s === "محذوف" || s === "deleted") {
      return "deleted";
    }

    return s;
  };

  // ================= STATISTICS =================

  const statistics = useMemo(() => {
    const total = employees.length;

    const active = employees.filter(
      (emp) => getStatusKey(emp.status) === "active"
    ).length;

    const deleted = employees.filter(
      (emp) => getStatusKey(emp.status) === "deleted"
    ).length;

    const departments = new Set(
      employees
        .filter((emp) => getStatusKey(emp.status) === "active")
        .map((emp) => emp.department)
        .filter(Boolean)
    ).size;

    return {
      total,
      active,
      deleted,
      departments,
    };
  }, [employees]);

  // ================= FILTER =================

  const filteredEmployees = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return employees.filter((emp) => {
      const statusKey = getStatusKey(emp.status);

      const matchesSearch =
        String(emp.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(emp.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(emp.position || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesDepartment = filterDept
        ? emp.department === filterDept
        : true;

      const matchesStatus = filterStatus
        ? statusKey === getStatusKey(filterStatus)
        : statusKey !== "deleted";

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [employees, search, filterDept, filterStatus]);

  const deletedEmployees = employees.filter(
    (emp) => getStatusKey(emp.status) === "deleted"
  );

  // ================= DELETE =================

  const deleteEmployee = async (id) => {
    const employee = employees.find(
      (emp) => emp.employee_id === id
    );

    if (
      !window.confirm(
        `هل أنت متأكد من حذف الموظف "${employee?.name || ""}"؟`
      )
    ) {
      return;
    }

    try {
      await API.delete(`/employees/${id}/delete`);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_id === id
            ? {
                ...emp,
                status: "محذوف",
              }
            : emp
        )
      );
    } catch (error) {
      console.error(error);
      alert("فشل عملية الحذف");
    }
  };

  // ================= RESTORE =================

  const restoreEmployee = async (id) => {
    try {
      await API.put(`/employees/${id}/restore`);

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_id === id
            ? {
                ...emp,
                status: "نشط",
              }
            : emp
        )
      );
    } catch (error) {
      console.error(error);
      alert("فشل الاسترجاع");
    }
  };

  // ================= EDIT =================

  const openEdit = (emp) => {
    setEditing(emp);

    setForm({
      name: emp.name || "",
      email: emp.email || "",
      department: emp.department || "",
      position: emp.position || "",
      role: emp.role || "",
    });
  };

  const updateEmployee = async () => {
    if (!form.name.trim()) {
      alert("يرجى إدخال اسم الموظف");
      return;
    }

    if (!form.email.trim()) {
      alert("يرجى إدخال البريد الإلكتروني");
      return;
    }

    try {
      setSaving(true);

      await API.put(
        `/employees/${editing.employee_id}/update`,
        form
      );

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_id === editing.employee_id
            ? {
                ...emp,
                ...form,
              }
            : emp
        )
      );

      setEditing(null);
    } catch (error) {
      console.error(error);
      alert("فشل التعديل");
    } finally {
      setSaving(false);
    }
  };

  // ================= EXCEL =================

  const exportToExcel = () => {
    if (filteredEmployees.length === 0) {
      alert("لا توجد بيانات لتصديرها");
      return;
    }

    const data = filteredEmployees.map((emp) => ({
      الاسم: emp.name,
      "البريد الإلكتروني": emp.email,
      القسم: emp.department,
      المنصب: emp.position,
      الدور: emp.role,
      الحالة: emp.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "الموظفين"
    );

    const file = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([file], {
        type: "application/octet-stream",
      }),
      "الموظفين.xlsx"
    );
  };

  // ================= DEPARTMENTS =================

  const departments = [
    ...new Set(
      employees
        .map((emp) => emp.department)
        .filter(Boolean)
    ),
  ];



  // ================= RENDER =================

  return (
    <div style={styles.app}>

      {/* ================= MAIN ================= */}

    <main style={styles.main}>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerRight}>

          <div>
            <div style={styles.breadcrumb}>
              لوحة التحكم / الموظفين
            </div>

            <h1 style={styles.pageTitle}>
              إدارة الموظفين
            </h1>

            <p style={styles.pageDescription}>
              إدارة ومتابعة بيانات الموظفين في النظام
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
            onClick={() => nav("/add-employee")}
          >
            <span>＋</span>
            إضافة موظف
          </button>

        </div>
      </header>

        {/* ================= STATISTICS ================= */}

      <section style={styles.statsGrid}>

        {/* إجمالي */}
        <div
          style={{
            ...styles.statCard,
            borderTop: "3px solid #6366f1",
          }}
        >
          <div
            style={{
              ...styles.statIcon,
              background: "rgba(99,102,241,0.10)",
            }}
          >
            👥
          </div>

          <div>
            <div style={styles.statLabel}>
              إجمالي الموظفين
            </div>

            <div style={styles.statNumber}>
              {statistics.total}
            </div>
          </div>
        </div>

        {/* النشطون */}
        <div
          style={{
            ...styles.statCard,
            borderTop: "3px solid #22c55e",
          }}
        >
          <div
            style={{
              ...styles.statIcon,
              background: "rgba(34,197,94,0.10)",
            }}
          >
            ✓
          </div>

          <div>
            <div style={styles.statLabel}>
              الموظفون النشطون
            </div>

            <div
              style={{
                ...styles.statNumber,
                color: "#16a34a",
              }}
            >
              {statistics.active}
            </div>
          </div>
        </div>

        {/* المحذوفون */}
        <div
          style={{
            ...styles.statCard,
            borderTop: "3px solid #ef4444",
          }}
        >
          <div
            style={{
              ...styles.statIcon,
              background: "rgba(239,68,68,0.10)",
            }}
          >
            🗑️
          </div>

          <div>
            <div style={styles.statLabel}>
              المحذوفون
            </div>

            <div
              style={{
                ...styles.statNumber,
                color: "#dc2626",
              }}
            >
              {statistics.deleted}
            </div>
          </div>
        </div>

        {/* الأقسام */}
        <div
          style={{
            ...styles.statCard,
            borderTop: "3px solid #0ea5e9",
          }}
        >
          <div
            style={{
              ...styles.statIcon,
              background: "rgba(14,165,233,0.10)",
            }}
          >
            🏢
          </div>

          <div>
            <div style={styles.statLabel}>
              الأقسام
            </div>

            <div
              style={{
                ...styles.statNumber,
                color: "#0284c7",
              }}
            >
              {statistics.departments}
            </div>
          </div>
        </div>

      </section>

        {/* ================= TOOLBAR ================= */}

        <section style={styles.toolbar}>

        <div style={styles.searchWrapper}>

          <span style={styles.searchIcon}>
            🔍
          </span>

          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد أو المنصب..."
            style={styles.searchInput}
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div style={styles.filters}>

          <select
            style={styles.select}
            value={filterDept}
            onChange={(e) =>
              setFilterDept(e.target.value)
            }
          >
            <option value="">
              كل الأقسام
            </option>

            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
          >
            <option value="">
              الموظفون النشطون
            </option>

            <option value="نشط">
              نشط
            </option>

            <option value="محذوف">
              محذوف
            </option>
          </select>

          <button
            style={styles.trashButton}
            onClick={() => setShowTrash(true)}
          >
            🗑️ السلة

            {statistics.deleted > 0 && (
              <span style={styles.counter}>
                {statistics.deleted}
              </span>
            )}
          </button>

          <button
            style={styles.excelButton}
            onClick={exportToExcel}
          >
            📥 Excel
          </button>

        </div>

      </section>
      
        {/* ================= TABLE ================= */}

        <section style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                قائمة الموظفين
              </h2>

              <span style={styles.resultsCount}>
                عرض {filteredEmployees.length} موظف
              </span>
            </div>

            <button
              style={styles.refreshButton}
              onClick={fetchEmployees}
            >
              ↻ تحديث
            </button>
          </div>

          {loading ? (
            <div style={styles.emptyState}>
              <div style={styles.loadingSpinner}>
                ⟳
              </div>

              <p>جاري تحميل الموظفين...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                👥
              </div>

              <h3>لا يوجد موظفون</h3>

              <p>
                لم يتم العثور على موظفين مطابقين
                للبحث أو الفلاتر الحالية.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div style={styles.desktopTable}>
                <div style={styles.tableHead}>
                  <div>الموظف</div>
                  <div>البريد الإلكتروني</div>
                  <div>القسم</div>
                  <div>المنصب</div>
                  <div>الحالة</div>
                  <div>الإجراءات</div>
                </div>

                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.employee_id}
                    style={styles.tableRow}
                  >
                    <div style={styles.employeeCell}>
                      <div style={styles.avatar}>
                        {String(
                          emp.name || "م"
                        ).charAt(0)}
                      </div>

                      <div>
                        <div
                          style={
                            styles.employeeName
                          }
                        >
                          {emp.name}
                        </div>

                        <div
                          style={
                            styles.employeeRole
                          }
                        >
                          {emp.role || "موظف"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={styles.emailCell}
                    >
                      {emp.email}
                    </div>

                    <div>
                      <span
                        style={
                          styles.departmentBadge
                        }
                      >
                        {emp.department || "—"}
                      </span>
                    </div>

                    <div style={styles.position}>
                      {emp.position || "—"}
                    </div>

                    <div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(getStatusKey(
                            emp.status
                          ) === "active"
                            ? styles.statusActive
                            : styles.statusDeleted),
                        }}
                      >
                        <span
                          style={
                            styles.statusDot
                          }
                        />
                        {getStatusKey(
                          emp.status
                        ) === "active"
                          ? "نشط"
                          : "محذوف"}
                      </span>
                    </div>

                    <div style={styles.actions}>
                      {getStatusKey(
                        emp.status
                      ) === "active" ? (
                        <>
                          <button
                            style={
                              styles.iconEditButton
                            }
                            title="تعديل"
                            onClick={() =>
                              openEdit(emp)
                            }
                          >
                            ✏️
                          </button>

                          <button
                            style={
                              styles.iconDeleteButton
                            }
                            title="حذف"
                            onClick={() =>
                              deleteEmployee(
                                emp.employee_id
                              )
                            }
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          style={
                            styles.restoreButton
                          }
                          onClick={() =>
                            restoreEmployee(
                              emp.employee_id
                            )
                          }
                        >
                          ↻ استرجاع
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* MOBILE CARDS */}

              <div style={styles.mobileCards}>
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.employee_id}
                    style={styles.mobileEmployeeCard}
                  >
                    <div
                      style={
                        styles.mobileEmployeeTop
                      }
                    >
                      <div
                        style={
                          styles.employeeCell
                        }
                      >
                        <div style={styles.avatar}>
                          {String(
                            emp.name || "م"
                          ).charAt(0)}
                        </div>

                        <div>
                          <div
                            style={
                              styles.employeeName
                            }
                          >
                            {emp.name}
                          </div>

                          <div
                            style={
                              styles.employeeRole
                            }
                          >
                            {emp.role ||
                              "موظف"}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(getStatusKey(
                            emp.status
                          ) === "active"
                            ? styles.statusActive
                            : styles.statusDeleted),
                        }}
                      >
                        <span
                          style={
                            styles.statusDot
                          }
                        />

                        {getStatusKey(
                          emp.status
                        ) === "active"
                          ? "نشط"
                          : "محذوف"}
                      </span>
                    </div>

                    <div
                      style={
                        styles.mobileInfo
                      }
                    >
                      <div>
                        <small>
                          البريد
                        </small>

                        <span>
                          {emp.email}
                        </span>
                      </div>

                      <div>
                        <small>
                          القسم
                        </small>

                        <span>
                          {emp.department ||
                            "—"}
                        </span>
                      </div>

                      <div>
                        <small>
                          المنصب
                        </small>

                        <span>
                          {emp.position ||
                            "—"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.mobileActions
                      }
                    >
                      {getStatusKey(
                        emp.status
                      ) === "active" ? (
                        <>
                          <button
                            style={
                              styles.mobileEditButton
                            }
                            onClick={() =>
                              openEdit(emp)
                            }
                          >
                            ✏️ تعديل
                          </button>

                          <button
                            style={
                              styles.mobileDeleteButton
                            }
                            onClick={() =>
                              deleteEmployee(
                                emp.employee_id
                              )
                            }
                          >
                            🗑️ حذف
                          </button>
                        </>
                      ) : (
                        <button
                          style={
                            styles.restoreButton
                          }
                          onClick={() =>
                            restoreEmployee(
                              emp.employee_id
                            )
                          }
                        >
                          ↻ استرجاع الموظف
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ================= TRASH MODAL ================= */}

      {showTrash && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  🗑️ سلة المحذوفات
                </h2>

                <p style={styles.modalSubtitle}>
                  الموظفون الذين تم حذفهم
                  مؤقتًا
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setShowTrash(false)
                }
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              {deletedEmployees.length === 0 ? (
                <div
                  style={styles.emptyTrash}
                >
                  <div
                    style={styles.emptyIcon}
                  >
                    🗑️
                  </div>

                  <h3>
                    السلة فارغة
                  </h3>

                  <p>
                    لا يوجد موظفون محذوفون
                    حاليًا.
                  </p>
                </div>
              ) : (
                deletedEmployees.map(
                  (emp) => (
                    <div
                      key={
                        emp.employee_id
                      }
                      style={
                        styles.trashCard
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
                            emp.name ||
                              "م"
                          ).charAt(0)}
                        </div>

                        <div>
                          <div
                            style={
                              styles.employeeName
                            }
                          >
                            {emp.name}
                          </div>

                          <div
                            style={
                              styles.employeeRole
                            }
                          >
                            {emp.email}
                          </div>
                        </div>
                      </div>

                      <button
                        style={
                          styles.restoreButton
                        }
                        onClick={() =>
                          restoreEmployee(
                            emp.employee_id
                          )
                        }
                      >
                        ↻ استرجاع
                      </button>
                    </div>
                  )
                )
              )}
            </div>

            <div
              style={styles.modalFooter}
            >
              <button
                style={styles.cancelButton}
                onClick={() =>
                  setShowTrash(false)
                }
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}

      {editing && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modal,
              maxWidth: "650px",
            }}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  ✏️ تعديل بيانات الموظف
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  تعديل بيانات{" "}
                  <strong>
                    {editing.name}
                  </strong>
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setEditing(null)
                }
              >
                ✕
              </button>
            </div>

            <div
              style={
                styles.formContainer
              }
            >
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  اسم الموظف
                </label>

                <input
                  style={styles.formInput}
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="اسم الموظف"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  البريد الإلكتروني
                </label>

                <input
                  type="email"
                  style={styles.formInput}
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="example@email.com"
                />
              </div>

              <div style={styles.formRow}>
                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={styles.label}
                  >
                    القسم
                  </label>

                  <input
                    style={
                      styles.formInput
                    }
                    value={
                      form.department
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        department:
                          e.target.value,
                      })
                    }
                    placeholder="القسم"
                  />
                </div>

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={styles.label}
                  >
                    المنصب
                  </label>

                  <input
                    style={
                      styles.formInput
                    }
                    value={
                      form.position
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        position:
                          e.target.value,
                      })
                    }
                    placeholder="المنصب"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  الدور
                </label>

                <input
                  style={styles.formInput}
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                    })
                  }
                  placeholder="الدور الوظيفي"
                />
              </div>
            </div>

            <div
              style={
                styles.modalFooter
              }
            >
              <button
                style={styles.cancelButton}
                onClick={() =>
                  setEditing(null)
                }
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                style={styles.saveButton}
                onClick={updateEmployee}
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
    padding: "11px 40px 11px 13px",
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

  trashButton: {
    background:
      "rgba(239,68,68,0.1)",
    border:
      "1px solid rgba(239,68,68,0.2)",
    color: "#f87171",
    padding: "10px 12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
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

  counter: {
    background: "#ef4444",
    color: "#fff",
    borderRadius: "20px",
    padding: "2px 6px",
    fontSize: "10px",
    marginRight: "5px",
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
  },

  desktopTable: {
    width: "100%",
  },

  tableHead: {
    display: "grid",
    gridTemplateColumns:
      "1.6fr 2fr 1.1fr 1.2fr 1fr 1fr",
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
      "1.6fr 2fr 1.1fr 1.2fr 1fr 1fr",
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

  emailCell: {
    color: "#94a3b8",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    direction: "ltr",
    textAlign: "right",
  },

  position: {
    color: "#cbd5e1",
  },

  departmentBadge: {
    display: "inline-block",
    background:
      "rgba(56,189,248,0.1)",
    color: "#38bdf8",
    padding: "5px 9px",
    borderRadius: "7px",
    fontSize: "10px",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "700",
  },

  statusActive: {
    background:
      "rgba(34,197,94,0.1)",
    color: "#4ade80",
  },

  statusDeleted: {
    background:
      "rgba(239,68,68,0.1)",
    color: "#f87171",
  },

  statusDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "currentColor",
  },

  actions: {
    display: "flex",
    gap: "6px",
  },

  iconEditButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border:
      "1px solid rgba(59,130,246,0.2)",
    background:
      "rgba(59,130,246,0.1)",
    cursor: "pointer",
  },

  iconDeleteButton: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border:
      "1px solid rgba(239,68,68,0.2)",
    background:
      "rgba(239,68,68,0.1)",
    cursor: "pointer",
  },

  restoreButton: {
    background:
      "rgba(34,197,94,0.1)",
    border:
      "1px solid rgba(34,197,94,0.2)",
    color: "#4ade80",
    padding: "7px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "600",
    fontSize: "11px",
  },

  /* ================= MOBILE ================= */

  mobileCards: {
    display: "none",
  },

  mobileEmployeeCard: {
    background:
      "rgba(255,255,255,0.025)",
    border:
      "1px solid rgba(255,255,255,0.06)",
    borderRadius: "13px",
    padding: "14px",
    marginBottom: "10px",
  },

  mobileEmployeeTop: {
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

  mobileEditButton: {
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

  mobileDeleteButton: {
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
    animation: "spin 1s linear infinite",
  },

  /* ================= MODALS ================= */

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

  trashCard: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "8px",
  },

  emptyTrash: {
    textAlign: "center",
    color: "#64748b",
    padding: "30px",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
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

  saveButton: {
    padding: "10px 20px",
    borderRadius: "9px",
    border: "none",
    background:
      "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "700",
  },

  formContainer: {
    padding: "20px",
  },

  formRow: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "15px",
  },

  formGroup: {
    marginBottom: "15px",
  },

  label: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "7px",
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: "9px",
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.04)",
    color: "#fff",
    outline: "none",
    fontFamily: "inherit",
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
    "employees-responsive-styles";

  if (!document.getElementById(styleId)) {
    const style =
      document.createElement("style");

    style.id = styleId;

    style.innerHTML = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      button:hover {
        opacity: 0.9;
      }

      input::placeholder {
        color: #64748b;
      }

      select option {
        background: #111827;
        color: #fff;
      }

      @media (max-width: 1100px) {
        .employees-table-placeholder {}
      }

      @media (max-width: 900px) {
        .employees-mobile {}
      }
    `;

    document.head.appendChild(style);
  }
}