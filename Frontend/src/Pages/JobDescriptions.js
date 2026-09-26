import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import API from "../api/api";
import "./JobDescription.css";

import {
  Document,
  Packer,
  Table,
  TableRow,
  TableCell,
  Paragraph,
  TextRun,
  WidthType,
  AlignmentType,
  VerticalAlign,
  ShadingType,
  BorderStyle,
  VerticalMergeType,
} from "docx";
import { saveAs } from "file-saver";
import ImportJobDescriptionModal from "./ImportJobDescriptionModal";

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

  const [showImport, setShowImport] = useState(false);

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
  // FILE ATTACHMENT (رفع / عرض / تنزيل / حذف)
  // =====================================================

  const handleUploadFile = async (employeeId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post(
        `/employees/${employeeId}/job-description/file`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      alert("تم رفع الملف بنجاح");
      fetchData();
    } catch (err) {
      console.error("Upload File Error:", err);
      alert(err?.response?.data?.message || "حدث خطأ أثناء رفع الملف");
    }
  };

  const handleViewFile = async (employeeId) => {
    try {
      const res = await API.get(
        `/employees/${employeeId}/job-description/file`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(res.data);
      window.open(url, "_blank");
    } catch (err) {
      console.error("View File Error:", err);
      alert("تعذر فتح الملف");
    }
  };

  const handleDownloadFile = async (employeeId, fileName) => {
    try {
      const res = await API.get(
        `/employees/${employeeId}/job-description/file?download=true`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName || "job-description-file";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download File Error:", err);
      alert("تعذر تحميل الملف");
    }
  };

  const handleDeleteFile = async (employeeId) => {
    const confirmed = window.confirm("هل تريد حذف الملف المرفق؟");
    if (!confirmed) return;

    try {
      await API.delete(`/employees/${employeeId}/job-description/file`);
      fetchData();
    } catch (err) {
      console.error("Delete File Error:", err);
      alert("حدث خطأ أثناء حذف الملف");
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
    ];

    (headers);

    list.forEach((emp) => {
      const points = emp.job_description_points || [];
      const startRow = rows.length; // index قبل ما نضيف صفوف هذا الموظف (0-based شامل الهيدر)

      if (points.length === 0) {
        rows.push([
          emp.name || "",
          emp.email || "",
          emp.department_name || "",
          emp.position || "",
          "",
          "لا يوجد وصف وظيفي",
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
          ]);
        });
      }

      const endRow = rows.length - 1;

   if (endRow > startRow) {
  [0, 1, 2, 3].forEach((col) => {
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
  // EXPORT TO WORD (مع دمج خلايا بيانات الموظف عموديًا)
  // =====================================================

  const exportToWord = async (list, filename) => {
    if (list.length === 0) {
      alert("لا يوجد موظفين لتصديرهم");
      return;
    }

    const headers = [
      "الاسم",
      "البريد الإلكتروني",
      "القسم",
      "المسمى الوظيفي",
      "#",
      "نقطة الوصف الوظيفي",
     
    ];

    const colWidths = [1900, 2400, 1500, 1700, 500, 4200];

    // =====================================================
    // HELPER - إنشاء خلية بنص، مع دعم الدمج العمودي
    // =====================================================

    const makeCell = (text, options = {}) => {
      return new TableCell({
        width: { size: options.width || 1500, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        verticalMerge: options.merge, // "restart" | "continue" | undefined
        shading: options.isHeader
          ? { fill: "6366F1", type: ShadingType.CLEAR, color: "auto" }
          : options.isAltRow
            ? { fill: "F9FAFB", type: ShadingType.CLEAR, color: "auto" }
            : undefined,
        children:
          options.merge === VerticalMergeType.CONTINUE
            ? [new Paragraph({ children: [] })] // خلية مدموجة يجب أن تكون فارغة
            : [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: String(text ?? ""),
                      bold: !!options.isHeader,
                      color: options.isHeader ? "FFFFFF" : "1F2937",
                      size: options.isHeader ? 22 : 20,
                      rightToLeft: true,
                    }),
                  ],
                }),
              ],
      });
    };

    // =====================================================
    // رأس الجدول
    // =====================================================

    const headerRow = new TableRow({
      tableHeader: true,
      children: headers.map((h, i) =>
        makeCell(h, { isHeader: true, width: colWidths[i] }),
      ),
    });

    const rows = [headerRow];
    let rowCounter = 0;

    // =====================================================
    // صفوف البيانات
    // =====================================================

    list.forEach((emp) => {
      const points = emp.job_description_points || [];
      const isAlt = rowCounter % 2 === 1;

      if (points.length === 0) {
        rows.push(
          new TableRow({
            children: [
              makeCell(emp.name, { width: colWidths[0], isAltRow: isAlt }),
              makeCell(emp.email, { width: colWidths[1], isAltRow: isAlt }),
              makeCell(emp.department_name, {
                width: colWidths[2],
                isAltRow: isAlt,
              }),
              makeCell(emp.position, {
                width: colWidths[3],
                isAltRow: isAlt,
              }),
              makeCell("", { width: colWidths[4], isAltRow: isAlt }),
              makeCell("لا يوجد وصف وظيفي", {
                width: colWidths[5],
                isAltRow: isAlt,
              }),
            ],
          }),
        );

        rowCounter++;
      } else {
        const hasMultiplePoints = points.length > 1;

        points.forEach((point, index) => {
          const isFirst = index === 0;

          // نوع الدمج: أول صف "restart"، باقي الصفوف "continue"
          const mergeType = hasMultiplePoints
            ? isFirst
              ? VerticalMergeType.RESTART
              : VerticalMergeType.CONTINUE
            : undefined;

          rows.push(
            new TableRow({
              children: [
                makeCell(emp.name, {
                  width: colWidths[0],
                  isAltRow: isAlt,
                  merge: mergeType,
                }),
                makeCell(emp.email, {
                  width: colWidths[1],
                  isAltRow: isAlt,
                  merge: mergeType,
                }),
                makeCell(emp.department_name, {
                  width: colWidths[2],
                  isAltRow: isAlt,
                  merge: mergeType,
                }),
                makeCell(emp.position, {
                  width: colWidths[3],
                  isAltRow: isAlt,
                  merge: mergeType,
                }),
                makeCell(index + 1, {
                  width: colWidths[4],
                  isAltRow: isAlt,
                }),
                makeCell(point, {
                  width: colWidths[5],
                  isAltRow: isAlt,
                }),
               
              ],
            }),
          );

          rowCounter++;
        });
      }
    });

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
        left: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
        right: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB" },
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: "E5E7EB",
        },
        insideVertical: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: "E5E7EB",
        },
      },
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { orientation: "landscape" },
              margin: { top: 700, bottom: 700, left: 700, right: 700 },
            },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: "تقرير الوصف الوظيفي للموظفين",
                  bold: true,
                  size: 32,
                  color: "1F2937",
                  rightToLeft: true,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: [
                new TextRun({
                  text: `تاريخ التصدير: ${new Date().toLocaleDateString(
                    "ar-SA",
                  )} — عدد الموظفين: ${list.length}`,
                  size: 20,
                  color: "6B7280",
                  rightToLeft: true,
                }),
              ],
            }),
            table,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  };

  const exportAllWord = () => {
    exportToWord(filteredEmployees, "الوصف-الوظيفي-جميع-الموظفين");
  };

  const exportSelectedWord = () => {
    const selected = employees.filter((e) =>
      selectedIds.includes(e.employee_id),
    );

    if (selected.length === 0) {
      alert("الرجاء تحديد موظف واحد على الأقل");
      return;
    }

    exportToWord(selected, "الوصف-الوظيفي-موظفين-محددين");
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

          <button className="jd-export-btn word" onClick={exportAllWord}>
            📄 تنزيل الكل (Word)
          </button>

          <button
            className="jd-export-btn word selected"
            onClick={exportSelectedWord}
            disabled={selectedIds.length === 0}
          >
            📄 تنزيل المحدد (Word)
          </button>

          <button className="jd-export-btn" onClick={() => setShowImport(true)}>
            📤 استيراد من إكسل
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
              <div className="jd-file-section">
                {emp.has_job_description_file ? (
                  <>
                    <div className="jd-file-info">
                      <span>📎 {emp.job_description_file_name}</span>
                      {emp.job_description_file_uploaded_at && (
                        <small>
                          {new Date(
                            emp.job_description_file_uploaded_at,
                          ).toLocaleDateString("ar-SA")}
                        </small>
                      )}
                    </div>

                    <div className="jd-file-actions">
                      <button onClick={() => handleViewFile(emp.employee_id)}>
                        👁 عرض
                      </button>

                      <button
                        onClick={() =>
                          handleDownloadFile(
                            emp.employee_id,
                            emp.job_description_file_name,
                          )
                        }
                      >
                        ⬇️ تنزيل
                      </button>

                      <label className="jd-replace-file-btn">
                        🔄 استبدال
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleUploadFile(emp.employee_id, e.target.files[0])
                          }
                        />
                      </label>

                      <button onClick={() => handleDeleteFile(emp.employee_id)}>
                        🗑 حذف الملف
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="jd-upload-file-btn">
                    📤 رفع ملف الوصف الوظيفي
                    <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleUploadFile(emp.employee_id, e.target.files[0])
                      }
                    />
                  </label>
                )}
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

      {showImport && (
        <ImportJobDescriptionModal
          onClose={() => setShowImport(false)}
          onImported={() => fetchData()}
        />
      )}
    </div>
  );
}
