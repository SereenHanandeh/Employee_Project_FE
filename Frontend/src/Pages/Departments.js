import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

import {
  FaBuilding,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaUndo,
  FaSyncAlt,
  FaTimes,
  FaSave,
  FaUsers,
  FaCheckCircle,
  FaTrash,
  FaArrowRight,
  FaLayerGroup,
} from "react-icons/fa";

import "./Departments.css";

export default function Departments() {
  const nav = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showTrash, setShowTrash] = useState(false);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [form, setForm] = useState({
    name: "",
  });

  // =========================================================
  // FETCH DEPARTMENTS
  // =========================================================

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const res = await API.get("/departments");

      setDepartments(res.data || []);
    } catch (error) {
      console.error("Fetch Departments Error:", error);

      alert(
        error?.response?.data?.message ||
          "فشل تحميل الأقسام"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatusKey = (status) => {
    if (!status) return "";

    const value = String(status)
      .toLowerCase()
      .trim();

    if (value === "نشط" || value === "active") {
      return "active";
    }

    if (value === "محذوف" || value === "deleted") {
      return "deleted";
    }

    return value;
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = departments.length;

    const active = departments.filter(
      (department) =>
        Number(department.is_deleted) === 0 ||
        getStatusKey(department.status) === "active"
    ).length;

    const deleted = departments.filter(
      (department) =>
        Number(department.is_deleted) === 1 ||
        getStatusKey(department.status) === "deleted"
    ).length;

    const employeesCount = departments.reduce(
      (totalEmployees, department) => {
        return (
          totalEmployees +
          Number(department.employee_count || 0)
        );
      },
      0
    );

    return {
      total,
      active,
      deleted,
      employeesCount,
    };
  }, [departments]);

  // =========================================================
  // FILTERED DEPARTMENTS
  // =========================================================

  const filteredDepartments = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return departments.filter((department) => {
      const statusKey =
        Number(department.is_deleted) === 1
          ? "deleted"
          : "active";

      const matchesSearch = String(
        department.name || ""
      )
        .toLowerCase()
        .includes(searchValue);

      const matchesStatus = filterStatus
        ? statusKey === getStatusKey(filterStatus)
        : statusKey !== "deleted";

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, filterStatus]);

  // =========================================================
  // DELETED DEPARTMENTS
  // =========================================================

  const deletedDepartments = useMemo(() => {
    return departments.filter(
      (department) =>
        Number(department.is_deleted) === 1 ||
        getStatusKey(department.status) === "deleted"
    );
  }, [departments]);

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreate = () => {
    setEditing(null);

    setForm({
      name: "",
    });
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEdit = (department) => {
    setEditing(department);

    setForm({
      name: department.name || "",
    });
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setEditing(null);

    setForm({
      name: "",
    });
  };

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      name: e.target.value,
    });
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const saveDepartment = async () => {
    const departmentName = form.name.trim();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!departmentName) {
      alert("يرجى إدخال اسم القسم");
      return;
    }

    if (departmentName.length < 2) {
      alert(
        "اسم القسم يجب أن يحتوي على حرفين على الأقل"
      );
      return;
    }

    if (departmentName.length > 150) {
      alert(
        "اسم القسم يجب ألا يتجاوز 150 حرفًا"
      );
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // UPDATE
      // =====================================================

      if (editing) {
        const res = await API.put(
          `/departments/${editing.department_id}`,
          {
            name: departmentName,
          }
        );

        const updatedDepartment =
          res.data?.department;

        setDepartments((prev) =>
          prev.map((department) =>
            department.department_id ===
            editing.department_id
              ? {
                  ...department,
                  ...(updatedDepartment || {}),
                  name:
                    updatedDepartment?.name ||
                    departmentName,
                  is_deleted: 0,
                  status: "نشط",
                }
              : department
          )
        );

        setEditing(null);

        setForm({
          name: "",
        });

        alert("تم تعديل القسم بنجاح");

        return;
      }

      // =====================================================
      // CREATE
      // =====================================================

      const res = await API.post("/departments", {
        name: departmentName,
      });

      const newDepartment =
        res.data?.department;

      if (newDepartment) {
        setDepartments((prev) => [
          newDepartment,
          ...prev,
        ]);
      } else {
        await fetchDepartments();
      }

      setForm({
        name: "",
      });

      alert("تم إضافة القسم بنجاح");
    } catch (error) {
      console.error(
        "Save Department Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "حدث خطأ أثناء حفظ القسم"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE DEPARTMENT
  // =========================================================

  const deleteDepartment = async (id) => {
    const department = departments.find(
      (item) => item.department_id === id
    );

    if (!department) return;

    const employeeCount = Number(
      department.employee_count || 0
    );

    let message = `هل أنت متأكد من حذف القسم "${department.name}"؟`;

    if (employeeCount > 0) {
      message += `\n\nهذا القسم مرتبط حاليًا بـ ${employeeCount} موظف. سيتم حذف القسم مؤقتًا مع الاحتفاظ بارتباط الموظفين به.`;
    }

    const confirmed = window.confirm(message);

    if (!confirmed) return;

    try {
      const res = await API.delete(
        `/departments/${id}`
      );

      setDepartments((prev) =>
        prev.map((item) =>
          item.department_id === id
            ? {
                ...item,
                is_deleted: 1,
                status: "محذوف",
              }
            : item
        )
      );

      alert(
        res.data?.message ||
          "تم حذف القسم بنجاح"
      );
    } catch (error) {
      console.error(
        "Delete Department Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "فشل حذف القسم"
      );
    }
  };

  // =========================================================
  // RESTORE DEPARTMENT
  // =========================================================

  const restoreDepartment = async (id) => {
    try {
      const res = await API.put(
        `/departments/${id}/restore`
      );

      setDepartments((prev) =>
        prev.map((department) =>
          department.department_id === id
            ? {
                ...department,
                ...(res.data?.department || {}),
                is_deleted: 0,
                status: "نشط",
              }
            : department
        )
      );

      alert(
        res.data?.message ||
          "تم استرجاع القسم بنجاح"
      );
    } catch (error) {
      console.error(
        "Restore Department Error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "فشل استرجاع القسم"
      );
    }
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
  };

  // =========================================================
  // GET INITIAL
  // =========================================================

  const getInitial = (name) => {
    return String(name || "ق")
      .charAt(0)
      .toUpperCase();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="departments-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="departments-header">
        <div className="departments-header-content">

          <div className="departments-breadcrumb">
            <span>لوحة التحكم</span>

            <span className="breadcrumb-separator">
              /
            </span>

            <strong>الأقسام</strong>
          </div>

          <div className="departments-title-row">

            <div className="departments-title-icon">
              <FaBuilding />
            </div>

            <div>
              <h1>إدارة الأقسام</h1>

              <p>
                إدارة وتنظيم أقسام المؤسسة
              </p>
            </div>

          </div>
        </div>

        <div className="departments-header-actions">

          <button
            className="departments-btn departments-btn-secondary"
            onClick={() => nav(-1)}
          >
            <FaArrowRight />
            <span>رجوع</span>
          </button>

          <button
            className="departments-btn departments-btn-primary"
            onClick={openCreate}
          >
            <FaPlus />
            <span>إضافة قسم</span>
          </button>

        </div>
      </header>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="departments-stats">

        <div className="departments-stat-card stat-total">

          <div className="departments-stat-icon">
            <FaBuilding />
          </div>

          <div className="departments-stat-info">
            <span>إجمالي الأقسام</span>

            <strong>
              {statistics.total}
            </strong>

            <small>
              جميع سجلات الأقسام
            </small>
          </div>

        </div>

        <div className="departments-stat-card stat-active">

          <div className="departments-stat-icon">
            <FaCheckCircle />
          </div>

          <div className="departments-stat-info">
            <span>الأقسام النشطة</span>

            <strong>
              {statistics.active}
            </strong>

            <small>
              أقسام متاحة للاستخدام
            </small>
          </div>

        </div>

        <div className="departments-stat-card stat-deleted">

          <div className="departments-stat-icon">
            <FaTrash />
          </div>

          <div className="departments-stat-info">
            <span>الأقسام المحذوفة</span>

            <strong>
              {statistics.deleted}
            </strong>

            <small>
              داخل سلة المحذوفات
            </small>
          </div>

        </div>

        <div className="departments-stat-card stat-employees">

          <div className="departments-stat-icon">
            <FaUsers />
          </div>

          <div className="departments-stat-info">
            <span>الموظفون</span>

            <strong>
              {statistics.employeesCount}
            </strong>

            <small>
              مرتبطون بالأقسام
            </small>
          </div>

        </div>

      </section>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section className="departments-toolbar">

        <div className="departments-search">

          <FaSearch className="departments-search-icon" />

          <input
            type="text"
            placeholder="ابحث باسم القسم..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="departments-clear-search"
              onClick={() => setSearch("")}
            >
              <FaTimes />
            </button>
          )}

        </div>

        <div className="departments-filter-group">

          <div className="departments-filter">

            <FaLayerGroup />

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
            >
              <option value="">
                الأقسام النشطة
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
            className="departments-tool-btn departments-trash-btn"
            onClick={() => setShowTrash(true)}
          >
            <FaTrash />

            <span>السلة</span>

            {statistics.deleted > 0 && (
              <b>
                {statistics.deleted}
              </b>
            )}
          </button>

        </div>

      </section>

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <section className="departments-container">

        <div className="departments-section-header">

          <div className="departments-section-heading">

            <div className="departments-section-icon">
              <FaBuilding />
            </div>

            <div>
              <h2>قائمة الأقسام</h2>

              <p>
                عرض{" "}
                <strong>
                  {filteredDepartments.length}
                </strong>{" "}
                قسم
              </p>
            </div>

          </div>

          <button
            className="departments-refresh-btn"
            onClick={fetchDepartments}
            disabled={loading}
          >
            <FaSyncAlt
              className={
                loading
                  ? "departments-spin"
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

          <div className="departments-state">

            <div className="departments-loading-icon">
              <FaSyncAlt />
            </div>

            <h3>
              جاري تحميل الأقسام
            </h3>

            <p>
              يرجى الانتظار، يتم جلب البيانات...
            </p>

          </div>

        ) : filteredDepartments.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="departments-state">

            <div className="departments-empty-icon">
              <FaBuilding />
            </div>

            <h3>
              لا توجد أقسام
            </h3>

            <p>
              لم يتم العثور على أقسام مطابقة
              للبحث أو الفلاتر الحالية.
            </p>

            {(search || filterStatus) && (
              <button
                className="departments-clear-filters"
                onClick={clearFilters}
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

            <div className="departments-desktop-table">

              <div className="departments-table-head">
                <div>القسم</div>
                <div>عدد الموظفين</div>
                <div>الحالة</div>
                <div>الإجراءات</div>
              </div>

              {filteredDepartments.map(
                (department) => {

                  const active =
                    Number(
                      department.is_deleted
                    ) === 0;

                  return (
                    <div
                      className="departments-table-row"
                      key={
                        department.department_id
                      }
                    >

                      {/* Department */}

                      <div className="departments-name-cell">

                        <div className="departments-avatar">
                          {getInitial(
                            department.name
                          )}
                        </div>

                        <div className="departments-name-info">

                          <strong>
                            {department.name}
                          </strong>

                          <span>
                            قسم إداري
                          </span>

                        </div>

                      </div>

                      {/* Employee Count */}

                      <div className="departments-count-cell">

                        <FaUsers />

                        <span>
                          {Number(
                            department.employee_count ||
                              0
                          )}
                        </span>

                        <small>
                          موظف
                        </small>

                      </div>

                      {/* Status */}

                      <div>

                        <span
                          className={`departments-status ${
                            active
                              ? "departments-status-active"
                              : "departments-status-deleted"
                          }`}
                        >
                          <span className="departments-status-dot" />

                          {active
                            ? "نشط"
                            : "محذوف"}
                        </span>

                      </div>

                      {/* Actions */}

                      <div className="departments-actions">

                        {active ? (

                          <>
                            <button
                              className="departments-action edit"
                              title="تعديل القسم"
                              onClick={() =>
                                openEdit(
                                  department
                                )
                              }
                            >
                              <FaEdit />
                            </button>

                            <button
                              className="departments-action delete"
                              title="حذف القسم"
                              onClick={() =>
                                deleteDepartment(
                                  department.department_id
                                )
                              }
                            >
                              <FaTrashAlt />
                            </button>
                          </>

                        ) : (

                          <button
                            className="departments-restore"
                            onClick={() =>
                              restoreDepartment(
                                department.department_id
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
                }
              )}

            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="departments-mobile">

              {filteredDepartments.map(
                (department) => {

                  const active =
                    Number(
                      department.is_deleted
                    ) === 0;

                  return (
                    <article
                      className="departments-mobile-card"
                      key={
                        department.department_id
                      }
                    >

                      <div className="departments-mobile-header">

                        <div className="departments-name-cell">

                          <div className="departments-avatar">
                            {getInitial(
                              department.name
                            )}
                          </div>

                          <div className="departments-name-info">

                            <strong>
                              {department.name}
                            </strong>

                            <span>
                              قسم إداري
                            </span>

                          </div>

                        </div>

                        <span
                          className={`departments-status ${
                            active
                              ? "departments-status-active"
                              : "departments-status-deleted"
                          }`}
                        >
                          <span className="departments-status-dot" />

                          {active
                            ? "نشط"
                            : "محذوف"}
                        </span>

                      </div>

                      <div className="departments-mobile-details">

                        <div>

                          <small>
                            عدد الموظفين
                          </small>

                          <span>
                            <FaUsers />

                            {Number(
                              department.employee_count ||
                                0
                            )}{" "}
                            موظف
                          </span>

                        </div>

                        <div>

                          <small>
                            تاريخ الإنشاء
                          </small>

                          <span>
                            {department.created_at
                              ? new Date(
                                  department.created_at
                                ).toLocaleDateString(
                                  "ar-SA"
                                )
                              : "—"}
                          </span>

                        </div>

                      </div>

                      <div className="departments-mobile-actions">

                        {active ? (

                          <>
                            <button
                              className="mobile-edit"
                              onClick={() =>
                                openEdit(
                                  department
                                )
                              }
                            >
                              <FaEdit />
                              تعديل
                            </button>

                            <button
                              className="mobile-delete"
                              onClick={() =>
                                deleteDepartment(
                                  department.department_id
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
                              restoreDepartment(
                                department.department_id
                              )
                            }
                          >
                            <FaUndo />
                            استرجاع القسم
                          </button>

                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          </>
        )}

      </section>

      {/* =====================================================
          TRASH MODAL
      ===================================================== */}

      {showTrash && (

        <div
          className="departments-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowTrash(false);
            }
          }}
        >

          <div className="departments-modal">

            <div className="departments-modal-header">

              <div className="departments-modal-heading">

                <div className="departments-modal-icon trash">
                  <FaTrash />
                </div>

                <div>

                  <h2>
                    سلة المحذوفات
                  </h2>

                  <p>
                    الأقسام التي تم حذفها مؤقتًا
                  </p>

                </div>

              </div>

              <button
                className="departments-modal-close"
                onClick={() =>
                  setShowTrash(false)
                }
              >
                <FaTimes />
              </button>

            </div>

            <div className="departments-modal-body">

              {deletedDepartments.length === 0 ? (

                <div className="departments-trash-empty">

                  <div>
                    <FaCheckCircle />
                  </div>

                  <h3>
                    السلة فارغة
                  </h3>

                  <p>
                    لا يوجد أقسام محذوفة حاليًا.
                  </p>

                </div>

              ) : (

                <div className="departments-trash-list">

                  {deletedDepartments.map(
                    (department) => (

                      <div
                        className="departments-trash-card"
                        key={
                          department.department_id
                        }
                      >

                        <div className="departments-name-cell">

                          <div className="departments-avatar deleted">
                            {getInitial(
                              department.name
                            )}
                          </div>

                          <div className="departments-name-info">

                            <strong>
                              {department.name}
                            </strong>

                            <span>
                              {department.employee_count ||
                                0}{" "}
                              موظف مرتبط
                            </span>

                          </div>

                        </div>

                        <button
                          className="departments-restore"
                          onClick={() =>
                            restoreDepartment(
                              department.department_id
                            )
                          }
                        >
                          <FaUndo />
                          استرجاع
                        </button>

                      </div>

                    )
                  )}

                </div>
              )}

            </div>

            <div className="departments-modal-footer">

              <button
                className="departments-cancel"
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
          CREATE / EDIT MODAL
      ===================================================== */}

      {(editing || form.name !== "") && (

        <div
          className="departments-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
        >

          <div className="departments-modal edit-modal">

            <div className="departments-modal-header">

              <div className="departments-modal-heading">

                <div
                  className={`departments-modal-icon ${
                    editing ? "edit" : "add"
                  }`}
                >
                  {editing ? (
                    <FaEdit />
                  ) : (
                    <FaPlus />
                  )}
                </div>

                <div>

                  <h2>
                    {editing
                      ? "تعديل القسم"
                      : "إضافة قسم جديد"}
                  </h2>

                  <p>
                    {editing
                      ? `تعديل بيانات قسم ${editing.name}`
                      : "أدخل اسم القسم لإضافته إلى النظام"}
                  </p>

                </div>

              </div>

              <button
                className="departments-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            <div className="departments-form">

              <div className="departments-form-group">

                <label>
                  اسم القسم
                  <span>*</span>
                </label>

                <div className="departments-input-wrapper">

                  <FaBuilding />

                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="مثال: الموارد البشرية"
                    maxLength={150}
                    autoFocus
                    disabled={saving}
                  />

                </div>

                <small>
                  يجب أن يكون اسم القسم واضحًا
                  ومميزًا.
                </small>

              </div>

            </div>

            <div className="departments-modal-footer">

              <button
                className="departments-cancel"
                onClick={closeModal}
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                className="departments-save"
                onClick={saveDepartment}
                disabled={saving}
              >

                {saving ? (

                  <>
                    <FaSyncAlt className="departments-spin" />
                    جاري الحفظ...
                  </>

                ) : (

                  <>
                    <FaSave />

                    {editing
                      ? "حفظ التعديلات"
                      : "إضافة القسم"}
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