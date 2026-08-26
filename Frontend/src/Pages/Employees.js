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

  // =========================================================
  // FETCH EMPLOYEES
  // =========================================================

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

  // =========================================================
  // STATUS
  // =========================================================

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

  // =========================================================
  // STATISTICS
  // =========================================================

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

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  const departments = useMemo(() => {
    return [
      ...new Set(
        employees
          .map((emp) => emp.department)
          .filter(Boolean)
      ),
    ];
  }, [employees]);

  // =========================================================
  // FILTER
  // =========================================================

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

  // =========================================================
  // DELETE EMPLOYEE
  // =========================================================

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

  // =========================================================
  // RESTORE EMPLOYEE
  // =========================================================

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

  // =========================================================
  // EDIT
  // =========================================================

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

      closeEdit();
    } catch (error) {
      console.error("Update Employee Error:", error);
      alert("فشل التعديل");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EXCEL
  // =========================================================

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

  // =========================================================
  // EMPLOYEE AVATAR
  // =========================================================

  const getInitial = (name) => {
    return String(name || "م").charAt(0);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="employees-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="employees-header">

        <div className="header-content">

          <div className="breadcrumb">
            لوحة التحكم
            <span>/</span>
            الموظفين
          </div>

          <h1>إدارة الموظفين</h1>

          <p>
            إدارة ومتابعة بيانات الموظفين في النظام
          </p>

        </div>

        <div className="header-actions">

          <button
            className="btn btn-secondary"
            onClick={() => nav(-1)}
          >
            <FaArrowRight />
            <span>رجوع</span>
          </button>

          <button
            className="btn btn-primary"
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

        {/* Total */}

        <div className="stat-card stat-purple">

          <div className="stat-icon">
            <FaUsers />
          </div>

          <div className="stat-content">

            <span>إجمالي الموظفين</span>

            <strong>
              {statistics.total}
            </strong>

          </div>

        </div>

        {/* Active */}

        <div className="stat-card stat-green">

          <div className="stat-icon">
            <FaUserCheck />
          </div>

          <div className="stat-content">

            <span>الموظفون النشطون</span>

            <strong>
              {statistics.active}
            </strong>

          </div>

        </div>

        {/* Deleted */}

        <div className="stat-card stat-red">

          <div className="stat-icon">
            <FaTrash />
          </div>

          <div className="stat-content">

            <span>المحذوفون</span>

            <strong>
              {statistics.deleted}
            </strong>

          </div>

        </div>

        {/* Departments */}

        <div className="stat-card stat-blue">

          <div className="stat-icon">
            <FaBuilding />
          </div>

          <div className="stat-content">

            <span>الأقسام</span>

            <strong>
              {statistics.departments}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="employees-toolbar">

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد أو المنصب..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              type="button"
            >
              <FaTimes />
            </button>
          )}

        </div>

        <div className="filter-actions">

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

          <button
            className="toolbar-btn trash-toolbar-btn"
            onClick={() =>
              setShowTrash(true)
            }
          >
            <FaTrash />

            <span>السلة</span>

            {statistics.deleted > 0 && (
              <b>
                {statistics.deleted}
              </b>
            )}
          </button>

          <button
            className="toolbar-btn excel-toolbar-btn"
            onClick={exportToExcel}
          >
            <FaFileExcel />
            <span>Excel</span>
          </button>

        </div>

      </section>

      {/* =====================================================
          EMPLOYEES TABLE
      ===================================================== */}

      <section className="employees-container">

        <div className="section-header">

          <div>

            <h2>
              قائمة الموظفين
            </h2>

            <span>
              عرض {filteredEmployees.length} موظف
            </span>

          </div>

          <button
            className="refresh-btn"
            onClick={fetchEmployees}
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

        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (
          <div className="employees-empty">

            <div className="loading-spinner">
              <FaSyncAlt />
            </div>

            <h3>
              جاري تحميل الموظفين...
            </h3>

            <p>
              يرجى الانتظار قليلاً
            </p>

          </div>
        ) : filteredEmployees.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="employees-empty">

            <div className="empty-icon">
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
                className="clear-filters-btn"
                onClick={() => {
                  setSearch("");
                  setFilterDept("");
                  setFilterStatus("");
                }}
              >
                مسح الفلاتر
              </button>
            )}

          </div>

        ) : (

          <>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="employees-table">

              <div className="table-head">

                <div>الموظف</div>
                <div>البريد الإلكتروني</div>
                <div>القسم</div>
                <div>المنصب</div>
                <div>الحالة</div>
                <div>الإجراءات</div>

              </div>

              {filteredEmployees.map((emp) => {

                const active =
                  getStatusKey(emp.status) ===
                  "active";

                return (
                  <div
                    className="table-row"
                    key={emp.employee_id}
                  >

                    {/* Employee */}

                    <div className="employee-info">

                      <div className="employee-avatar">
                        {getInitial(emp.name)}
                      </div>

                      <div className="employee-details">

                        <strong>
                          {emp.name}
                        </strong>

                        <span>
                          {emp.role || "موظف"}
                        </span>

                      </div>

                    </div>

                    {/* Email */}

                    <div className="employee-email">
                      <FaEnvelope />
                      {emp.email}
                    </div>

                    {/* Department */}

                    <div>

                      <span className="department-badge">
                        <FaBuilding />
                        {emp.department || "—"}
                      </span>

                    </div>

                    {/* Position */}

                    <div className="employee-position">

                      <FaBriefcase />

                      {emp.position || "—"}

                    </div>

                    {/* Status */}

                    <div>

                      <span
                        className={`status-badge ${
                          active
                            ? "status-active"
                            : "status-deleted"
                        }`}
                      >

                        <span className="status-dot" />

                        {active
                          ? "نشط"
                          : "محذوف"}

                      </span>

                    </div>

                    {/* Actions */}

                    <div className="employee-actions">

                      {active ? (
                        <>
                          <button
                            className="action-btn edit-btn"
                            title="تعديل الموظف"
                            onClick={() =>
                              openEdit(emp)
                            }
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="action-btn delete-btn"
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
                          className="restore-btn"
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
                MOBILE CARDS
            ================================================= */}

            <div className="employees-mobile">

              {filteredEmployees.map((emp) => {

                const active =
                  getStatusKey(emp.status) ===
                  "active";

                return (
                  <div
                    className="employee-mobile-card"
                    key={emp.employee_id}
                  >

                    <div className="mobile-card-top">

                      <div className="employee-info">

                        <div className="employee-avatar">
                          {getInitial(emp.name)}
                        </div>

                        <div className="employee-details">

                          <strong>
                            {emp.name}
                          </strong>

                          <span>
                            {emp.role || "موظف"}
                          </span>

                        </div>

                      </div>

                      <span
                        className={`status-badge ${
                          active
                            ? "status-active"
                            : "status-deleted"
                        }`}
                      >
                        <span className="status-dot" />

                        {active
                          ? "نشط"
                          : "محذوف"}
                      </span>

                    </div>

                    <div className="mobile-info">

                      <div className="mobile-info-item">

                        <small>
                          البريد الإلكتروني
                        </small>

                        <span>
                          <FaEnvelope />
                          {emp.email}
                        </span>

                      </div>

                      <div className="mobile-info-item">

                        <small>
                          القسم
                        </small>

                        <span>
                          <FaBuilding />
                          {emp.department || "—"}
                        </span>

                      </div>

                      <div className="mobile-info-item">

                        <small>
                          المنصب
                        </small>

                        <span>
                          <FaBriefcase />
                          {emp.position || "—"}
                        </span>

                      </div>

                    </div>

                    <div className="mobile-actions">

                      {active ? (
                        <>
                          <button
                            className="mobile-edit-btn"
                            onClick={() =>
                              openEdit(emp)
                            }
                          >
                            <FaEdit />
                            تعديل
                          </button>

                          <button
                            className="mobile-delete-btn"
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
                          className="mobile-restore-btn"
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

                  </div>
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
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowTrash(false);
            }
          }}
        >

          <div className="modal trash-modal">

            <div className="modal-header">

              <div className="modal-heading">

                <div className="modal-icon trash-icon">
                  <FaTrash />
                </div>

                <div>

                  <h2>
                    سلة المحذوفات
                  </h2>

                  <p>
                    الموظفون الذين تم حذفهم مؤقتًا
                  </p>

                </div>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowTrash(false)
                }
              >
                <FaTimes />
              </button>

            </div>

            <div className="modal-body">

              {deletedEmployees.length === 0 ? (

                <div className="empty-trash">

                  <div className="empty-trash-icon">
                    <FaTrash />
                  </div>

                  <h3>
                    السلة فارغة
                  </h3>

                  <p>
                    لا يوجد موظفون محذوفون حاليًا.
                  </p>

                </div>

              ) : (

                <div className="trash-list">

                  {deletedEmployees.map((emp) => (

                    <div
                      className="trash-card"
                      key={emp.employee_id}
                    >

                      <div className="employee-info">

                        <div className="employee-avatar deleted-avatar">
                          {getInitial(emp.name)}
                        </div>

                        <div className="employee-details">

                          <strong>
                            {emp.name}
                          </strong>

                          <span>
                            {emp.email}
                          </span>

                        </div>

                      </div>

                      <button
                        className="restore-btn"
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

            <div className="modal-footer">

              <button
                className="cancel-btn"
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
          className="modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeEdit();
            }
          }}
        >

          <div className="modal edit-modal">

            <div className="modal-header">

              <div className="modal-heading">

                <div className="modal-icon edit-icon">
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
                className="modal-close"
                onClick={closeEdit}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <div className="edit-form">

              {/* Name */}

              <div className="form-group">

                <label>
                  اسم الموظف
                </label>

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

              {/* Email */}

              <div className="form-group">

                <label>
                  البريد الإلكتروني
                </label>

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

              {/* Department + Position */}

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    القسم
                  </label>

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

                <div className="form-group">

                  <label>
                    المنصب
                  </label>

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

              {/* Role */}

              <div className="form-group">

                <label>
                  الدور الوظيفي
                </label>

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

            <div className="modal-footer">

              <button
                className="cancel-btn"
                onClick={closeEdit}
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                className="save-btn"
                onClick={updateEmployee}
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

    </div>
  );
}