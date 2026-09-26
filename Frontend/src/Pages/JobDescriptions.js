import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import "./JobDescription.css";

export default function JobDescriptions() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

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

  const startEdit = (emp) => {
    setEditingId(emp.employee_id);
    setDraft(emp.job_description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const saveEdit = async (employeeId) => {
    try {
      await API.put(`/employees/${employeeId}/job-description`, {
        job_description: draft,
      });

      setEmployees((prev) =>
        prev.map((e) =>
          e.employee_id === employeeId
            ? { ...e, job_description: draft }
            : e
        )
      );

      setEditingId(null);
    } catch (err) {
      console.error("Save Job Description Error:", err);
    }
  };

  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const normalizeStatusClass = (status) => {
    const s = String(status || "").trim().toLowerCase();

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

      {filteredEmployees.length === 0 ? (
        <div className="jd-empty">
          <div className="jd-empty-icon">📄</div>
          <strong>لا يوجد نتائج</strong>
          <span>جرّبي كلمة بحث مختلفة أو تأكدي من وجود موظفين</span>
        </div>
      ) : (
        <div className="jd-grid">
          {filteredEmployees.map((emp) => (
            <div className="jd-card" key={emp.employee_id}>
              <div className="jd-card-top">
                <div className="jd-avatar">
                  {emp.name?.charAt(0) || "؟"}
                </div>

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
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={4}
                      placeholder="اكتبي وصف المهام والمسؤوليات..."
                      autoFocus
                    />

                    <div className="jd-edit-actions">
                      <button onClick={() => saveEdit(emp.employee_id)}>
                        حفظ
                      </button>
                      <button onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      {emp.job_description || "لا يوجد وصف وظيفي بعد."}
                    </p>

                    <button
                      className="jd-edit-btn"
                      onClick={() => startEdit(emp)}
                    >
                      ✏️ تعديل الوصف
                    </button>
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
                            t.status
                          )}`}
                        >
                          {statusLabel(t.status)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="jd-no-tasks">
                    لا توجد مهام مسندة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}