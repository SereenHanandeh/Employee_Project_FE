import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import API from "../api/api";
import "./JobDescription.css";

export default function JobDescriptions() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [draftPoints, setDraftPoints] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [showTrash, setShowTrash] = useState(false);
  const [trashItems, setTrashItems] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await API.get("/employees/job-descriptions");
      setEmployees(res.data);
    } catch (err) {
      console.error("Fetch Job Descriptions Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT MODE (نقاط متعددة)
  // =====================================================

  const startEdit = (emp) => {
    setEditingId(emp.employee_id);

    const points =
      emp.job_description_points?.length > 0
        ? [...emp.job_description_points]
        : [""];

    setDraftPoints(points);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftPoints([]);
  };

  const updatePoint = (index, value) => {
    setDraftPoints((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const addPoint = () => {
    setDraftPoints((prev) => [...prev, ""]);
  };

  const removePoint = (index) => {
    setDraftPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const saveEdit = async (employeeId) => {
    try {
      const cleanPoints = draftPoints
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const res = await API.put(`/employees/${employeeId}/job-description`, {
        points: cleanPoints,
      });

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === employeeId
            ? {
                ...e,
                job_description_points: res.data.job_description_points,
              }
            : e,
        ),
      );

      setEditingId(null);
      setDraftPoints([]);
    } catch (err) {
      console.error("Save Job Description Error:", err);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  // =====================================================
  // DELETE (نقل لسلة المهملات)
  // =====================================================

  const handleDelete = async (emp) => {
    if (!emp.job_description_points?.length) {
      alert("لا يوجد وصف وظيفي لحذفه");
      return;
    }

    const confirmed = window.confirm(
      `هل تريدين نقل الوصف الوظيفي لـ "${emp.name}" إلى سلة المهملات؟`,
    );

    if (!confirmed) return;

    try {
      await API.delete(`/employees/${emp.employee_id}/job-description`);

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === emp.employee_id
            ? { ...e, job_description_points: [] }
            : e,
        ),
      );
    } catch (err) {
      console.error("Delete Job Description Error:", err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // =====================================================
  // TRASH
  // =====================================================

  const openTrash = async () => {
    setShowTrash(true);
    setTrashLoading(true);

    try {
      const res = await API.get("/employees/job-descriptions/trash");
      setTrashItems(res.data);
    } catch (err) {
      console.error("Fetch Trash Error:", err);
    } finally {
      setTrashLoading(false);
    }
  };

  const closeTrash = () => {
    setShowTrash(false);
  };

  const restoreFromTrash = async (trashItem) => {
    try {
      await API.put(
        `/employees/job-descriptions/trash/${trashItem.trash_id}/restore`,
      );

      setTrashItems((prev) =>
        prev.filter((t) => t.trash_id !== trashItem.trash_id),
      );

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === trashItem.employee_id
            ? {
                ...e,
                job_description_points: trashItem.job_description_points,
              }
            : e,
        ),
      );
    } catch (err) {
      console.error("Restore Error:", err);
      alert("حدث خطأ أثناء الاسترجاع، تأكدي أن الموظف مازال موجودًا");
    }
  };

  const permanentlyDelete = async (trashItem) => {
    const confirmed = window.confirm(
      "هل أنتِ متأكدة؟ هذا الإجراء لا يمكن التراجع عنه.",
    );

    if (!confirmed) return;

    try {
      await API.delete(
        `/employees/job-descriptions/trash/${trashItem.trash_id}`,
      );

      setTrashItems((prev) =>
        prev.filter((t) => t.trash_id !== trashItem.trash_id),
      );
    } catch (err) {
      console.error("Permanent Delete Error:", err);
    }
  };

  // =====================================================
  // IMPORT FROM WORD
  // =====================================================

  const openImportModal = () => {
    setShowImportModal(true);
    setImportFile(null);
    setImportPreview(null);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const isDocx = file.name.toLowerCase().endsWith(".docx");

    if (!isDocx) {
      alert("الرجاء اختيار ملف Word بصيغة .docx فقط");
      return;
    }

    setImportFile(file);
    setImportPreview(null);
  };

  const uploadForPreview = async () => {
    if (!importFile) {
      alert("الرجاء اختيار ملف أولاً");
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await API.post(
        "/employees/job-descriptions/import/preview",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setImportPreview(res.data);
    } catch (err) {
      console.error("Import Preview Error:", err);
      alert(err.response?.data?.message || "حدث خطأ أثناء قراءة الملف");
    } finally {
      setImportLoading(false);
    }
  };

  const updateMatchedEmployee = (index, employeeId) => {
    setImportPreview((prev) => {
      const rows = [...prev.rows];

      const emp = prev.available_employees.find(
        (e) => e.employee_id === Number(employeeId),
      );

      rows[index] = {
        ...rows[index],
        matched_employee_id: emp ? emp.employee_id : null,
        matched_employee_name: emp ? emp.name : null,
        match_type: emp ? "manual" : "none",
      };

      return { ...prev, rows };
    });
  };

  const confirmImport = async () => {
    const items = importPreview.rows
      .filter((r) => r.matched_employee_id)
      .map((r) => ({
        employee_id: r.matched_employee_id,
        points: r.points,
      }));

    if (items.length === 0) {
      alert("لا يوجد صفوف مطابقة لموظفين لاستيرادها");
      return;
    }

    const confirmed = window.confirm(
      `سيتم تحديث الوصف الوظيفي لـ ${items.length} موظف. هل تريد المتابعة؟`,
    );

    if (!confirmed) return;

    setConfirmLoading(true);

    try {
      const res = await API.put("/employees/job-descriptions/import/confirm", {
        items,
      });

      alert(res.data.message);

      await fetchData();
      closeImportModal();
    } catch (err) {
      console.error("Confirm Import Error:", err);
      alert("حدث خطأ أثناء تطبيق الاستيراد");
    } finally {
      setConfirmLoading(false);
    }
  };
  // =====================================================
  // SELECTION (للتصدير)
  // =====================================================

  const toggleSelect = (employeeId) => {
    setSelectedIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredEmployees.map((e) => e.employee_id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // =====================================================
  // EXPORT TO EXCEL
  // =====================================================

  // =====================================================
  // EXPORT TO EXCEL (كل نقطة بصف منفصل)
  // =====================================================

  const exportToExcel = (list, filename) => {
    if (list.length === 0) {
      alert("لا يوجد موظفين لتصديرهم");
      return;
    }

    const rows = [];
    const merges = [];

    // رأس الجدول
    const headers = [
      "الاسم",
      "البريد الإلكتروني",
      "القسم",
      "المسمى الوظيفي",
      "#",
      "نقطة الوصف الوظيفي",
      "عدد المهام",
    ];

    rows.push(headers);

    list.forEach((emp) => {
      const points = emp.job_description_points || [];
      const startRow = rows.length;

      if (points.length === 0) {
        rows.push([
          emp.name || "",
          emp.email || "",
          emp.department_name || "",
          emp.position || "",
          "",
          "لا يوجد وصف وظيفي",
          emp.tasks?.length || 0,
        ]);
      } else {
        points.forEach((point, index) => {
          rows.push([
            index === 0 ? emp.name || "" : "",
            index === 0 ? emp.email || "" : "",
            index === 0 ? emp.department_name || "" : "",
            index === 0 ? emp.position || "" : "",
            index + 1,
            point,
            index === 0 ? emp.tasks?.length || 0 : "",
          ]);
        });
      }

      const endRow = rows.length - 1;

      if (endRow > startRow) {
        [0, 1, 2, 3, 6].forEach((col) => {
          merges.push({
            s: { r: startRow, c: col },
            e: { r: endRow, c: col },
          });
        });
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    worksheet["!merges"] = merges;

    worksheet["!cols"] = [
      { wch: 22 }, // الاسم
      { wch: 28 }, // البريد
      { wch: 18 }, // القسم
      { wch: 20 }, // المسمى
      { wch: 5 }, // #
      { wch: 50 }, // النقطة
      { wch: 12 }, // عدد المهام
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الوصف الوظيفي");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportAll = () => {
    exportToExcel(filteredEmployees, "الوصف-الوظيفي-جميع-الموظفين");
  };

  const exportSelected = () => {
    const selected = employees.filter((e) =>
      selectedIds.includes(e.employee_id),
    );

    if (selected.length === 0) {
      alert("الرجاء تحديد موظف واحد على الأقل");
      return;
    }

    exportToExcel(selected, "الوصف-الوظيفي-موظفين-محددين");
  };

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return employees;

    return employees.filter((emp) => {
      return (
        emp.name?.toLowerCase().includes(term) ||
        emp.position?.toLowerCase().includes(term) ||
        emp.department_name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
      );
    });
  }, [employees, search]);

  // =====================================================
  // TASK STATUS HELPERS
  // =====================================================

  const normalizeStatusClass = (status) => {
    const s = String(status || "")
      .trim()
      .toLowerCase();

    if (["completed", "complete", "done", "finished"].includes(s)) {
      return "completed";
    }

    if (["in_progress", "in-progress", "progress", "working"].includes(s)) {
      return "in_progress";
    }

    return "pending";
  };

  const statusLabel = (status) => {
    const cls = normalizeStatusClass(status);

    const labels = {
      pending: "قيد الانتظار",
      in_progress: "قيد التنفيذ",
      completed: "مكتملة",
    };

    return labels[cls];
  };

  if (loading) {
    return <div className="jd-loading">جاري التحميل...</div>;
  }

  return (
    <div className="job-descriptions" dir="rtl">
      <header className="jd-header">
        <div>
          <h1>الوصف الوظيفي</h1>
          <p>تفاصيل كل موظف، مهامه الحالية، ومسؤولياته</p>
        </div>

        <div className="jd-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="ابحث بالاسم، القسم، أو المسمى الوظيفي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <div className="jd-toolbar">
        <div className="jd-toolbar-left">
          <button className="jd-toolbar-btn" onClick={selectAll}>
            تحديد الكل ({filteredEmployees.length})
          </button>

          <button className="jd-toolbar-btn ghost" onClick={clearSelection}>
            إلغاء التحديد
          </button>

          <span className="jd-selected-count">
            {selectedIds.length > 0
              ? `تم تحديد ${selectedIds.length} موظف`
              : "لم يتم تحديد أحد"}
          </span>
        </div>

        <div className="jd-toolbar-right">
          <button className="jd-import-btn" onClick={openImportModal}>
            📤 استيراد من Word
          </button>
          <button className="jd-export-btn" onClick={exportAll}>
            📥 تنزيل الكل (Excel)
          </button>

          <button
            className="jd-export-btn selected"
            onClick={exportSelected}
            disabled={selectedIds.length === 0}
          >
            📥 تنزيل المحدد ({selectedIds.length})
          </button>

          <button className="jd-trash-btn" onClick={openTrash}>
            🗑 سلة المهملات
          </button>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="jd-empty">
          <div className="jd-empty-icon">📄</div>
          <strong>لا يوجد نتائج</strong>
          <span>جرّب كلمة بحث مختلفة أو تأكد من وجود موظفين</span>
        </div>
      ) : (
        <div className="jd-grid">
          {filteredEmployees.map((emp) => (
            <div
              className={`jd-card ${
                selectedIds.includes(emp.employee_id) ? "selected" : ""
              }`}
              key={emp.employee_id}
            >
              <label className="jd-card-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(emp.employee_id)}
                  onChange={() => toggleSelect(emp.employee_id)}
                />
              </label>

              <div className="jd-card-top">
                <div className="jd-avatar">{emp.name?.charAt(0) || "؟"}</div>

                <div>
                  <strong>{emp.name}</strong>
                  <span>{emp.position || "بدون مسمى وظيفي"}</span>
                </div>
              </div>

              <div className="jd-meta">
                <span>🏢 {emp.department_name || "بدون قسم"}</span>
                <span>✉️ {emp.email}</span>
              </div>

              <div className="jd-description">
                {editingId === emp.employee_id ? (
                  <>
                    <div className="jd-points-editor">
                      {draftPoints.map((point, index) => (
                        <div className="jd-point-row" key={index}>
                          <span className="jd-point-bullet">•</span>

                          <input
                            type="text"
                            value={point}
                            onChange={(e) => updatePoint(index, e.target.value)}
                            placeholder={`نقطة رقم ${index + 1}`}
                          />

                          <button
                            type="button"
                            className="jd-point-remove"
                            onClick={() => removePoint(index)}
                            title="حذف هذه النقطة"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="jd-add-point-btn"
                        onClick={addPoint}
                      >
                        + إضافة نقطة
                      </button>
                    </div>

                    <div className="jd-edit-actions">
                      <button onClick={() => saveEdit(emp.employee_id)}>
                        حفظ
                      </button>
                      <button onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </>
                ) : (
                  <>
                    {emp.job_description_points?.length > 0 ? (
                      <ul className="jd-points-list">
                        {emp.job_description_points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="jd-no-description">
                        لا يوجد وصف وظيفي بعد.
                      </p>
                    )}

                    <div className="jd-description-actions">
                      <button
                        className="jd-edit-btn"
                        onClick={() => startEdit(emp)}
                      >
                        ✏️ تعديل الوصف
                      </button>

                      {emp.job_description_points?.length > 0 && (
                        <button
                          className="jd-delete-btn"
                          onClick={() => handleDelete(emp)}
                        >
                          🗑 حذف
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="jd-tasks">
                <h4>المهام ({emp.tasks?.length || 0})</h4>

                {emp.tasks?.length ? (
                  <ul>
                    {emp.tasks.map((t) => (
                      <li key={t.task_id}>
                        <span>{t.title}</span>

                        <span
                          className={`jd-status ${normalizeStatusClass(
                            t.status,
                          )}`}
                        >
                          {statusLabel(t.status)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="jd-no-tasks">لا توجد مهام مسندة</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================
          TRASH MODAL
      =================================================== */}

      {showTrash && (
        <div className="jd-modal-overlay" onClick={closeTrash}>
          <div className="jd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="jd-modal-header">
              <h3>🗑 سلة المهملات</h3>
              <button className="jd-modal-close" onClick={closeTrash}>
                ×
              </button>
            </div>

            <div className="jd-modal-body">
              {trashLoading ? (
                <div className="jd-trash-loading">جاري التحميل...</div>
              ) : trashItems.length === 0 ? (
                <div className="jd-trash-empty">
                  <div className="jd-empty-icon">🗑</div>
                  <strong>سلة المهملات فارغة</strong>
                </div>
              ) : (
                <div className="jd-trash-list">
                  {trashItems.map((item) => (
                    <div className="jd-trash-item" key={item.trash_id}>
                      <div className="jd-trash-item-header">
                        <strong>{item.employee_name}</strong>
                        <span className="jd-trash-date">
                          {new Date(item.deleted_at).toLocaleString("ar-SA")}
                        </span>
                      </div>

                      <ul className="jd-trash-points">
                        {item.job_description_points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>

                      <div className="jd-trash-actions">
                        <button
                          className="jd-restore-btn"
                          onClick={() => restoreFromTrash(item)}
                        >
                          ↩️ استرجاع
                        </button>

                        <button
                          className="jd-permanent-delete-btn"
                          onClick={() => permanentlyDelete(item)}
                        >
                          حذف نهائي
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
            {/* ===================================================
          IMPORT MODAL
      =================================================== */}

      {showImportModal && (
        <div className="jd-modal-overlay" onClick={closeImportModal}>
          <div
            className="jd-modal jd-import-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="jd-modal-header">
              <h3>📤 استيراد من ملف Word</h3>
              <button className="jd-modal-close" onClick={closeImportModal}>
                ×
              </button>
            </div>

            <div className="jd-modal-body">
              {!importPreview ? (
                <div className="jd-import-upload">
                                   <div className="jd-import-instructions">
                    <strong>تعليمات الملف:</strong>
                    <p>
                      يجب أن يحتوي الملف على جدول بنفس أعمدة ملف الإكسل
                      المصدَّر بالضبط، وبنفس الترتيب:
                    </p>
                    <p style={{ marginTop: 8, fontWeight: 700 }}>
                      الاسم | البريد الإلكتروني | القسم | المسمى الوظيفي | # |
                      نقطة الوصف الوظيفي | عدد المهام
                    </p>
                    <p style={{ marginTop: 8 }}>
                      أسهل طريقة: نزّلي ملف الإكسل الحالي، عدّلي عليه، ثم
                      انسخي الجدول إلى Word مع دمج الخلايا (Merge) لبيانات
                      نفس الموظف عبر عدة نقاط.
                    </p>
                  </div>

                  <label className="jd-file-input-label">
                    <input
                      type="file"
                      accept=".docx"
                      onChange={handleFileSelect}
                      hidden
                    />
                    <span className="jd-file-input-icon">📄</span>
                    <span>
                      {importFile
                        ? importFile.name
                        : "اضغط لاختيار ملف Word (.docx)"}
                    </span>
                  </label>

                  <button
                    className="jd-import-analyze-btn"
                    onClick={uploadForPreview}
                    disabled={!importFile || importLoading}
                  >
                    {importLoading ? "جاري التحليل..." : "تحليل الملف"}
                  </button>
                </div>
              ) : (
                <div className="jd-import-preview">
                  <div className="jd-import-summary">
                    <span className="jd-import-stat total">
                      {importPreview.total_rows} صف
                    </span>
                    <span className="jd-import-stat matched">
                      {importPreview.matched_count} مطابق
                    </span>
                    <span className="jd-import-stat unmatched">
                      {importPreview.unmatched_count} غير مطابق
                    </span>
                  </div>

                  <div className="jd-import-rows">
                    {importPreview.rows.map((row, index) => (
                      <div
                        className={`jd-import-row ${
                          row.matched_employee_id ? "matched" : "unmatched"
                        }`}
                        key={index}
                      >
                        <div className="jd-import-row-header">
                          <div className="jd-import-raw-name">
                            <span className="jd-import-label">
                              الاسم بالملف:
                            </span>
                            <strong>{row.raw_name}</strong>
                          </div>

                          <select
                            value={row.matched_employee_id || ""}
                            onChange={(e) =>
                              updateMatchedEmployee(index, e.target.value)
                            }
                          >
                            <option value="">— غير مطابق —</option>
                            {importPreview.available_employees.map((emp) => (
                              <option
                                key={emp.employee_id}
                                value={emp.employee_id}
                              >
                                {emp.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <ul className="jd-import-points">
                          {row.points.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="jd-import-actions">
                    <button
                      className="jd-import-back-btn"
                      onClick={() => setImportPreview(null)}
                    >
                      رجوع
                    </button>

                    <button
                      className="jd-import-confirm-btn"
                      onClick={confirmImport}
                      disabled={confirmLoading}
                    >
                      {confirmLoading
                        ? "جاري الحفظ..."
                        : `✓ تأكيد الاستيراد (${importPreview.matched_count})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
