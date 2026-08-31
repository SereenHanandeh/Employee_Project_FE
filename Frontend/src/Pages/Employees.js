import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

import {
  FaUsers,
  FaUserCheck,
  FaTrash,
  FaBuilding,
  FaSearch,
  FaPlus,
  FaArrowRight,
  FaEdit,
  FaTrashAlt,
  FaUndo,
  FaSyncAlt,
  FaFileExcel,
  FaTimes,
  FaSave,
  FaEnvelope,
  FaBriefcase,
  FaUserTie,
  FaCheckCircle,
  FaLayerGroup,
} from "react-icons/fa";

import "./Employees.css";

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

  /* =========================================================
     FETCH
  ========================================================= */

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await API.get("/employees");

      setEmployees(res.data || []);
    } catch (error) {
      console.error("Fetch Employees Error:", error);
      alert("فشل تحميل الموظفين");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatusKey = (status) => {
    if (!status) return "";

    const value = String(status).toLowerCase().trim();

    if (value === "نشط" || value === "active") {
      return "active";
    }

    if (value === "محذوف" || value === "deleted") {
      return "deleted";
    }

    return value;
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

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
        .filter(
          (emp) => getStatusKey(emp.status) === "active"
        )
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

  /* =========================================================
     DEPARTMENTS
  ========================================================= */

  const departments = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((emp) => emp.department)
          .filter(Boolean)
      ),
    ];
  }, [employees]);

  /* =========================================================
     FILTER
  ========================================================= */

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
          .includes(searchValue) ||
        String(emp.department || "")
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
  }, [
    employees,
    search,
    filterDept,
    filterStatus,
  ]);

  const deletedEmployees = useMemo(() => {
    return employees.filter(
      (emp) => getStatusKey(emp.status) === "deleted"
    );
  }, [employees]);

  /* =========================================================
     DELETE
  ========================================================= */

  const deleteEmployee = async (id) => {
    const employee = employees.find(
      (emp) => emp.employee_id === id
    );

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف الموظف "${employee?.name || ""}"؟`
    );

    if (!confirmed) return;

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
      console.error("Delete Employee Error:", error);
      alert("فشل عملية الحذف");
    }
  };

  /* =========================================================
     RESTORE
  ========================================================= */

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
      console.error("Restore Employee Error:", error);
      alert("فشل الاسترجاع");
    }
  };

  /* =========================================================
     EDIT
  ========================================================= */

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

  const closeEdit = () => {
    if (saving) return;

    setEditing(null);

    setForm({
      name: "",
      email: "",
      department: "",
      position: "",
      role: "",
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
      setForm({
        name: "",
        email: "",
        department: "",
        position: "",
        role: "",
      });
    } catch (error) {
      console.error("Update Employee Error:", error);
      alert("فشل التعديل");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     EXCEL
  ========================================================= */

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
      الحالة:
        getStatusKey(emp.status) === "active"
          ? "نشط"
          : "محذوف",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 32 },
      { wch: 20 },
      { wch: 25 },
      { wch: 18 },
      { wch: 12 },
    ];

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

  /* =========================================================
     HELPERS
  ========================================================= */

  const getInitial = (name) => {
    return String(name || "م").charAt(0);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterDept("");
    setFilterStatus("");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="employees-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="employees-header">

        <div className="employees-header-content">

          <div className="employees-breadcrumb">
            <span>لوحة التحكم</span>
            <span className="breadcrumb-separator">/</span>
            <strong>الموظفين</strong>
          </div>

          <div className="employees-title-row">

            <div className="employees-title-icon">
              <FaUsers />
            </div>

            <div>
              <h1>إدارة الموظفين</h1>

              <p>
                إدارة ومتابعة بيانات الموظفين في النظام
              </p>
            </div>

          </div>

        </div>

        <div className="employees-header-actions">

          <button
            className="employees-btn employees-btn-secondary"
            onClick={() => nav(-1)}
          >
            <FaArrowRight />
            <span>رجوع</span>
          </button>

          <button
            className="employees-btn employees-btn-primary"
            onClick={() => nav("/add-employee")}
          >
            <FaPlus />
            <span>إضافة موظف</span>
          </button>

        </div>

      </header>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="employees-stats">

        <div className="employees-stat-card stat-total">

          <div className="employees-stat-icon">
            <FaUsers />
          </div>

          <div className="employees-stat-info">
            <span>إجمالي الموظفين</span>
            <strong>{statistics.total}</strong>
            <small>
              جميع سجلات الموظفين
            </small>
          </div>

        </div>

        <div className="employees-stat-card stat-active">

          <div className="employees-stat-icon">
            <FaUserCheck />
          </div>

          <div className="employees-stat-info">
            <span>الموظفون النشطون</span>
            <strong>{statistics.active}</strong>
            <small>
              موظفون يعملون حاليًا
            </small>
          </div>

        </div>

        <div className="employees-stat-card stat-deleted">

          <div className="employees-stat-icon">
            <FaTrash />
          </div>

          <div className="employees-stat-info">
            <span>المحذوفون</span>
            <strong>{statistics.deleted}</strong>
            <small>
              داخل سلة المحذوفات
            </small>
          </div>

        </div>

        <div className="employees-stat-card stat-departments">

          <div className="employees-stat-icon">
            <FaBuilding />
          </div>

          <div className="employees-stat-info">
            <span>الأقسام</span>
            <strong>{statistics.departments}</strong>
            <small>
              الأقسام النشطة
            </small>
          </div>

        </div>

      </section>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section className="employees-toolbar">

        <div className="employees-search">

          <FaSearch className="employees-search-icon" />

          <input
            type="text"
            placeholder="ابحث بالاسم، البريد، القسم أو المنصب..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="employees-clear-search"
              onClick={() => setSearch("")}
            >
              <FaTimes />
            </button>
          )}

        </div>

        <div className="employees-filter-group">

          <div className="employees-filter">

            <FaBuilding />

            <select
              value={filterDept}
              onChange={(e) =>
                setFilterDept(e.target.value)
              }
            >
              <option value="">
                كل الأقسام
              </option>

              {departments.map((dept) => (
                <option
                  key={dept}
                  value={dept}
                >
                  {dept}
                </option>
              ))}
            </select>

          </div>

          <div className="employees-filter">

            <FaLayerGroup />

            <select
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

          </div>

          <button
            className="employees-tool-btn employees-trash-btn"
            onClick={() => setShowTrash(true)}
          >
            <FaTrash />
            <span>السلة</span>

            {statistics.deleted > 0 && (
              <b>{statistics.deleted}</b>
            )}
          </button>

          <button
            className="employees-tool-btn employees-excel-btn"
            onClick={exportToExcel}
          >
            <FaFileExcel />
            <span>تصدير Excel</span>
          </button>

        </div>

      </section>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <section className="employees-container">

        <div className="employees-section-header">

          <div className="employees-section-heading">

            <div className="employees-section-icon">
              <FaUserTie />
            </div>

            <div>
              <h2>قائمة الموظفين</h2>

              <p>
                عرض{" "}
                <strong>
                  {filteredEmployees.length}
                </strong>{" "}
                موظف
              </p>
            </div>

          </div>

          <button
            className="employees-refresh-btn"
            onClick={fetchEmployees}
            disabled={loading}
          >
            <FaSyncAlt
              className={
                loading
                  ? "employees-spin"
                  : ""
              }
            />

            <span>تحديث</span>
          </button>

        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (

          <div className="employees-state">

            <div className="employees-loading-icon">
              <FaSyncAlt />
            </div>

            <h3>
              جاري تحميل الموظفين
            </h3>

            <p>
              يرجى الانتظار، يتم جلب البيانات...
            </p>

          </div>

        ) : filteredEmployees.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="employees-state">

            <div className="employees-empty-icon">
              <FaUsers />
            </div>

            <h3>
              لا يوجد موظفون
            </h3>

            <p>
              لم يتم العثور على موظفين مطابقين
              للبحث أو الفلاتر الحالية.
            </p>

            {(search ||
              filterDept ||
              filterStatus) && (
              <button
                className="employees-clear-filters"
                onClick={clearFilters}
              >
                مسح الفلاتر
              </button>
            )}

          </div>

        ) : (

          <>

            {/* =================================================
                DESKTOP
            ================================================= */}

            <div className="employees-desktop-table">

              <div className="employees-table-head">

                <div>الموظف</div>
                <div>البريد الإلكتروني</div>
                <div>القسم</div>
                <div>المنصب</div>
                <div>الحالة</div>
                <div>الإجراءات</div>

              </div>

              {filteredEmployees.map((emp) => {

                const active =
                  getStatusKey(emp.status) === "active";

                return (
                  <div
                    className="employees-table-row"
                    key={emp.employee_id}
                  >

                    <div className="employees-employee-cell">

                      <div className="employees-avatar">
                        {getInitial(emp.name)}
                      </div>

                      <div className="employees-employee-info">

                        <strong>
                          {emp.name}
                        </strong>

                        <span>
                          {emp.role || "موظف"}
                        </span>

                      </div>

                    </div>

                    <div className="employees-email-cell">

                      <FaEnvelope />

                      <span>
                        {emp.email || "—"}
                      </span>

                    </div>

                    <div>

                      <span className="employees-department">

                        <FaBuilding />

                        {emp.department || "غير محدد"}

                      </span>

                    </div>

                    <div className="employees-position-cell">

                      <FaBriefcase />

                      <span>
                        {emp.position || "غير محدد"}
                      </span>

                    </div>

                    <div>

                      <span
                        className={`employees-status ${
                          active
                            ? "employees-status-active"
                            : "employees-status-deleted"
                        }`}
                      >

                        <span className="employees-status-dot" />

                        {active
                          ? "نشط"
                          : "محذوف"}

                      </span>

                    </div>

                    <div className="employees-actions">

                      {active ? (
                        <>
                          <button
                            className="employees-action edit"
                            title="تعديل الموظف"
                            onClick={() =>
                              openEdit(emp)
                            }
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="employees-action delete"
                            title="حذف الموظف"
                            onClick={() =>
                              deleteEmployee(
                                emp.employee_id
                              )
                            }
                          >
                            <FaTrashAlt />
                          </button>
                        </>
                      ) : (

                        <button
                          className="employees-restore"
                          onClick={() =>
                            restoreEmployee(
                              emp.employee_id
                            )
                          }
                        >
                          <FaUndo />
                          استرجاع
                        </button>

                      )}

                    </div>

                  </div>
                );
              })}

            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="employees-mobile">

              {filteredEmployees.map((emp) => {

                const active =
                  getStatusKey(emp.status) === "active";

                return (
                  <article
                    className="employees-mobile-card"
                    key={emp.employee_id}
                  >

                    <div className="employees-mobile-header">

                      <div className="employees-employee-cell">

                        <div className="employees-avatar">
                          {getInitial(emp.name)}
                        </div>

                        <div className="employees-employee-info">

                          <strong>
                            {emp.name}
                          </strong>

                          <span>
                            {emp.role || "موظف"}
                          </span>

                        </div>

                      </div>

                      <span
                        className={`employees-status ${
                          active
                            ? "employees-status-active"
                            : "employees-status-deleted"
                        }`}
                      >
                        <span className="employees-status-dot" />

                        {active
                          ? "نشط"
                          : "محذوف"}
                      </span>

                    </div>

                    <div className="employees-mobile-details">

                      <div>
                        <small>
                          البريد الإلكتروني
                        </small>

                        <span>
                          <FaEnvelope />
                          {emp.email || "—"}
                        </span>
                      </div>

                      <div>
                        <small>
                          القسم
                        </small>

                        <span>
                          <FaBuilding />
                          {emp.department || "غير محدد"}
                        </span>
                      </div>

                      <div>
                        <small>
                          المنصب
                        </small>

                        <span>
                          <FaBriefcase />
                          {emp.position || "غير محدد"}
                        </span>
                      </div>

                    </div>

                    <div className="employees-mobile-actions">

                      {active ? (
                        <>
                          <button
                            className="mobile-edit"
                            onClick={() =>
                              openEdit(emp)
                            }
                          >
                            <FaEdit />
                            تعديل
                          </button>

                          <button
                            className="mobile-delete"
                            onClick={() =>
                              deleteEmployee(
                                emp.employee_id
                              )
                            }
                          >
                            <FaTrashAlt />
                            حذف
                          </button>
                        </>
                      ) : (

                        <button
                          className="mobile-restore"
                          onClick={() =>
                            restoreEmployee(
                              emp.employee_id
                            )
                          }
                        >
                          <FaUndo />
                          استرجاع الموظف
                        </button>

                      )}

                    </div>

                  </article>
                );
              })}

            </div>

          </>

        )}

      </section>

      {/* =====================================================
          TRASH MODAL
      ===================================================== */}

      {showTrash && (

        <div
          className="employees-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowTrash(false);
            }
          }}
        >

          <div className="employees-modal">

            <div className="employees-modal-header">

              <div className="employees-modal-heading">

                <div className="employees-modal-icon trash">
                  <FaTrash />
                </div>

                <div>
                  <h2>سلة المحذوفات</h2>

                  <p>
                    الموظفون الذين تم حذفهم مؤقتًا
                  </p>
                </div>

              </div>

              <button
                className="employees-modal-close"
                onClick={() =>
                  setShowTrash(false)
                }
              >
                <FaTimes />
              </button>

            </div>

            <div className="employees-modal-body">

              {deletedEmployees.length === 0 ? (

                <div className="employees-trash-empty">

                  <div>
                    <FaCheckCircle />
                  </div>

                  <h3>
                    السلة فارغة
                  </h3>

                  <p>
                    لا يوجد موظفون محذوفون حاليًا.
                  </p>

                </div>

              ) : (

                <div className="employees-trash-list">

                  {deletedEmployees.map((emp) => (

                    <div
                      className="employees-trash-card"
                      key={emp.employee_id}
                    >

                      <div className="employees-employee-cell">

                        <div className="employees-avatar deleted">
                          {getInitial(emp.name)}
                        </div>

                        <div className="employees-employee-info">

                          <strong>
                            {emp.name}
                          </strong>

                          <span>
                            {emp.email}
                          </span>

                        </div>

                      </div>

                      <button
                        className="employees-restore"
                        onClick={() =>
                          restoreEmployee(
                            emp.employee_id
                          )
                        }
                      >
                        <FaUndo />
                        استرجاع
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

            <div className="employees-modal-footer">

              <button
                className="employees-cancel"
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

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (

        <div
          className="employees-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeEdit();
            }
          }}
        >

          <div className="employees-modal edit-modal">

            <div className="employees-modal-header">

              <div className="employees-modal-heading">

                <div className="employees-modal-icon edit">
                  <FaEdit />
                </div>

                <div>
                  <h2>
                    تعديل بيانات الموظف
                  </h2>

                  <p>
                    تعديل بيانات{" "}
                    <strong>
                      {editing.name}
                    </strong>
                  </p>
                </div>

              </div>

              <button
                className="employees-modal-close"
                onClick={closeEdit}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <div className="employees-form">

              <div className="employees-form-group">

                <label>
                  اسم الموظف
                </label>

                <div className="employees-input-wrapper">
                  <FaUserTie />

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="أدخل اسم الموظف"
                  />
                </div>

              </div>

              <div className="employees-form-group">

                <label>
                  البريد الإلكتروني
                </label>

                <div className="employees-input-wrapper">
                  <FaEnvelope />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>

              </div>

              <div className="employees-form-grid">

                <div className="employees-form-group">

                  <label>
                    القسم
                  </label>

                  <div className="employees-input-wrapper">
                    <FaBuilding />

                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          department:
                            e.target.value,
                        })
                      }
                      placeholder="اسم القسم"
                    />
                  </div>

                </div>

                <div className="employees-form-group">

                  <label>
                    المنصب
                  </label>

                  <div className="employees-input-wrapper">
                    <FaBriefcase />

                    <input
                      type="text"
                      value={form.position}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          position:
                            e.target.value,
                        })
                      }
                      placeholder="المسمى الوظيفي"
                    />
                  </div>

                </div>

              </div>

              <div className="employees-form-group">

                <label>
                  الدور الوظيفي
                </label>

                <div className="employees-input-wrapper">
                  <FaUsers />

                  <input
                    type="text"
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

            </div>

            <div className="employees-modal-footer">

              <button
                className="employees-cancel"
                onClick={closeEdit}
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                className="employees-save"
                onClick={updateEmployee}
                disabled={saving}
              >

                {saving ? (
                  <>
                    <FaSyncAlt className="employees-spin" />
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

    </div>
  );
};