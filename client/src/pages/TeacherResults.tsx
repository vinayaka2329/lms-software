import { Download, Search, Trophy, Filter, ArrowUpDown, FileSpreadsheet } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlueprintShell } from "@/components/BlueprintShell";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { exportResultsToExcel } from "@/lib/excelTemplates";

type ResultRow = {
  attemptId: number;
  assessmentId: number;
  assessmentTitle: string;
  resultsPublished: boolean;
  studentId: number;
  studentName: string | null;
  studentEmail: string | null;
  status: string;
  score: number | null;
  totalMarks: number;
  percentage: number | null;
  violationCount: number;
  submittedAt: Date | string | null;
};

type TableRecord = {
  id: number;
  name: string;
  studentUserIds: number[];
};

function makeCsv(rows: Array<Array<string | number | null | undefined>>) {
  return rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
}

function downloadCsv(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
}

export default function TeacherResults() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<number | "all">("all");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"default" | "desc" | "asc" | "name">("desc");

  const results = trpc.assessments.teacherResults.useQuery();
  const tablesQuery = trpc.tables.list.useQuery();
  const tables = (tablesQuery.data?.data ?? []) as TableRecord[];

  const toggleResultsPublish = trpc.assessments.toggleResultsPublish.useMutation({
    onSuccess: res => { toast.success(res.message); void utils.assessments.teacherResults.invalidate(); },
    onError: err => toast.error(err.message),
  });

  const publishAllResults = trpc.assessments.publishAllResults.useMutation({
    onSuccess: res => { toast.success(res.message); void utils.assessments.teacherResults.invalidate(); },
    onError: err => toast.error(err.message),
  });

  const allResults = (results.data?.data ?? []) as ResultRow[];

  // Build unique assessments list from results
  const assessmentOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const r of allResults) if (!seen.has(r.assessmentId)) seen.set(r.assessmentId, r.assessmentTitle);
    return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
  }, [allResults]);

  // Build student→table map
  const studentTableMap = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const table of tables) {
      for (const sid of table.studentUserIds) {
        const existing = map.get(sid) ?? [];
        map.set(sid, [...existing, table.name]);
      }
    }
    return map;
  }, [tables]);

  // Apply filters
  const needle = search.trim().toLowerCase();
  const filteredResults = useMemo(() => {
    return allResults.filter(r => {
      // Assessment filter
      if (selectedAssessmentId !== "all" && r.assessmentId !== selectedAssessmentId) return false;
      // Table filter
      if (selectedTableId !== "all") {
        const table = tables.find(t => t.id === selectedTableId);
        if (!table || !table.studentUserIds.includes(r.studentId)) return false;
      }
      // Search filter
      if (needle && ![r.assessmentTitle, r.studentName, r.studentEmail, r.status].some(v => String(v ?? "").toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [allResults, selectedAssessmentId, selectedTableId, needle, tables]);

  // Group by assessment and sort rows
  const grouped = useMemo(() => {
    const groups = new Map<number, { title: string; resultsPublished: boolean; rows: ResultRow[] }>();
    for (const r of filteredResults) {
      if (!groups.has(r.assessmentId)) groups.set(r.assessmentId, { title: r.assessmentTitle, resultsPublished: r.resultsPublished, rows: [] });
      groups.get(r.assessmentId)!.rows.push(r);
    }
    return Array.from(groups.entries()).map(([id, g]) => {
      const sortedRows = [...g.rows].sort((a, b) => {
        if (sortBy === "desc") {
          return (b.percentage ?? 0) - (a.percentage ?? 0);
        }
        if (sortBy === "asc") {
          return (a.percentage ?? 0) - (b.percentage ?? 0);
        }
        if (sortBy === "name") {
          return String(a.studentName ?? "").localeCompare(String(b.studentName ?? ""));
        }
        return 0;
      });
      return { assessmentId: id, ...g, rows: sortedRows };
    });
  }, [filteredResults, sortBy]);

  const publishedCount = allResults.filter(r => r.resultsPublished).length;
  const unpublishedCount = allResults.filter(r => !r.resultsPublished).length;
  const avgPct = allResults.length ? Math.round(allResults.reduce((s, r) => s + Number(r.percentage ?? 0), 0) / allResults.length) : null;

  const exportExcel = () => {
    const exportData = filteredResults.map(r => ({
      assessmentTitle: r.assessmentTitle,
      studentName: r.studentName,
      studentEmail: r.studentEmail,
      tables: (studentTableMap.get(r.studentId) ?? ["No table"]).join(" | "),
      status: r.status,
      score: r.score,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      violationCount: r.violationCount,
      resultsPublished: r.resultsPublished,
      submittedAt: r.submittedAt,
    }));
    exportResultsToExcel("teacher-assessment-results.xlsx", exportData);
    toast.success("Excel report exported successfully.");
  };

  const exportResults = () => downloadCsv("teacher-results.csv", makeCsv([
    ["Assessment", "Student", "Email", "Table(s)", "Status", "Score", "Total Marks", "Percentage", "Integrity Events", "Results Published", "Submitted At"],
    ...filteredResults.map(r => [
      r.assessmentTitle, r.studentName, r.studentEmail,
      (studentTableMap.get(r.studentId) ?? ["No table"]).join(" | "),
      r.status, r.score, r.totalMarks, r.percentage, r.violationCount, r.resultsPublished ? "Yes" : "No",
      r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "—",
    ]),
  ]));

  return (
    <BlueprintShell role="TEACHER">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">TEACHER / RESULTS DASHBOARD</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Test results</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Review all student attempt records grouped by assessment. Filter by table or test to see results per cohort.
          </p>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          Search results
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 lg:w-72"
              placeholder="Student, assessment, status…"
            />
          </div>
        </label>
      </header>

      {/* Metrics */}
      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="metric-card"><Trophy className="size-5 text-[#ff1f6d]" /><span>Total attempts</span><strong>{allResults.length}</strong></div>
        <div className="metric-card"><Trophy className="size-5 text-emerald-500" /><span>Published</span><strong>{publishedCount}</strong></div>
        <div className="metric-card"><Trophy className="size-5 text-amber-500" /><span>Hidden</span><strong>{unpublishedCount}</strong></div>
        <div className="metric-card"><Trophy className="size-5 text-[#ff1f6d]" /><span>Avg score</span><strong>{avgPct !== null ? `${avgPct}%` : "—"}</strong></div>
      </section>

      {/* Filters + Bulk Actions */}
      <section className="blueprint-panel mt-5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="size-4 text-[#ff1f6d]" />
            <label className="text-xs font-semibold text-slate-700">
              Filter by table
              <select
                value={selectedTableId}
                onChange={e => setSelectedTableId(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="ml-2 h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 shadow-sm focus:border-[#ff1f6d]"
              >
                <option value="all">All tables</option>
                {tables.map(t => <option key={t.id} value={t.id}>{t.name} ({t.studentUserIds.length})</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Filter by assessment
              <select
                value={selectedAssessmentId}
                onChange={e => setSelectedAssessmentId(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="ml-2 h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 shadow-sm focus:border-[#ff1f6d]"
              >
                <option value="all">All assessments</option>
                {assessmentOptions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700 flex items-center">
              <ArrowUpDown className="mr-1 size-3.5 text-[#ff1f6d] inline" />
              Sort by
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="ml-2 h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 shadow-sm focus:border-[#ff1f6d]"
              >
                <option value="desc">Percentage (High → Low)</option>
                <option value="asc">Percentage (Low → High)</option>
                <option value="name">Student Name (A → Z)</option>
                <option value="default">Original Order</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => publishAllResults.mutate({ publish: true })}
              disabled={publishAllResults.isPending || unpublishedCount === 0}
              className="bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Publish all results
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => publishAllResults.mutate({ publish: false })}
              disabled={publishAllResults.isPending || publishedCount === 0}
              className="border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              Hide all results
            </Button>
            <button
              type="button"
              onClick={exportExcel}
              disabled={!filteredResults.length}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              Export Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={exportResults}
              disabled={!filteredResults.length}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <Download className="size-4 text-slate-500" />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {/* Grouped by Assessment */}
      {results.isLoading ? (
        <div className="blueprint-panel mt-5 flex min-h-40 items-center justify-center text-slate-600">Loading results…</div>
      ) : grouped.length === 0 ? (
        <p className="empty-state mt-5">No results match the current filters.</p>
      ) : (
        <div className="mt-5 space-y-5">
          {grouped.map(group => (
            <section key={group.assessmentId} className="blueprint-panel p-5">
              {/* Assessment header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="eyebrow">ASSESSMENT</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{group.title}</h2>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="technical-chip">{group.rows.length} attempt{group.rows.length !== 1 ? "s" : ""}</span>
                    {group.resultsPublished ? (
                      <span className="technical-chip border-emerald-300 bg-emerald-50 text-emerald-700">Results visible to students</span>
                    ) : (
                      <span className="technical-chip border-pink-200 bg-pink-50 text-[#ff1f6d]">Results hidden from students</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleResultsPublish.mutate({ assessmentId: group.assessmentId, publish: !group.resultsPublished })}
                    disabled={toggleResultsPublish.isPending}
                    className={`technical-chip ${group.resultsPublished ? "border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400" : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400"}`}
                  >
                    {group.resultsPublished ? "Hide results" : "Publish results"}
                  </button>
                </div>
              </div>

              {/* Results table */}
              <div className="mt-4 overflow-x-auto">
                <table className="technical-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Table(s)</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Integrity Events</th>
                      <th>Result Visibility</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map(result => (
                      <tr key={result.attemptId}>
                        <td>
                          <p className="font-semibold text-slate-900">{result.studentName}</p>
                          <p className="text-xs text-slate-500">{result.studentEmail}</p>
                        </td>
                        <td>
                          {(studentTableMap.get(result.studentId) ?? []).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(studentTableMap.get(result.studentId) ?? []).map(tname => (
                                <span key={tname} className="technical-chip text-[10px]">{tname}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">No table</span>
                          )}
                        </td>
                        <td><span className="technical-chip">{result.status}</span></td>
                        <td>
                          <span className="font-mono font-medium text-slate-900">{result.score ?? 0} / {result.totalMarks}</span>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-[#ff1f6d]">{result.percentage ?? 0}%</span>
                        </td>
                        <td>
                          <span className={result.violationCount > 0 ? "font-semibold text-amber-600" : "font-medium text-emerald-600"}>
                            {result.violationCount} event{result.violationCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td>
                          {result.resultsPublished ? (
                            <span className="technical-chip border-emerald-300 bg-emerald-50 text-emerald-700">Visible</span>
                          ) : (
                            <span className="technical-chip border-pink-200 bg-pink-50 text-[#ff1f6d]">Hidden</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => toggleResultsPublish.mutate({ assessmentId: result.assessmentId, publish: !result.resultsPublished })}
                            disabled={toggleResultsPublish.isPending}
                            className={`technical-chip ${result.resultsPublished ? "border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400" : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400"}`}
                          >
                            {result.resultsPublished ? "Unpublish" : "Publish score"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </BlueprintShell>
  );
}
