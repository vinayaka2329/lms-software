import { useState } from "react";
import { Loader2, Plus, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { BlueprintShell } from "@/components/BlueprintShell";
import { ActivityLogPanel } from "@/components/ActivityLogPanel";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", username: "", temporaryPassword: "" });

  const overview = trpc.people.admin.overview.useQuery();

  const create = trpc.people.admin.createTeacher.useMutation({
    onSuccess: () => {
      toast.success("Teacher created in this school scope.");
      setShowForm(false);
      setForm({ name: "", email: "", username: "", temporaryPassword: "" });
      void utils.people.admin.overview.invalidate();
    },
    onError: error => toast.error(error.message)
  });

  const deleteTeacher = trpc.people.admin.deleteTeacher.useMutation({
    onSuccess: () => {
      toast.success("Teacher account removed from active access.");
      void utils.people.admin.overview.invalidate();
    },
    onError: error => toast.error(error.message)
  });

  const data = overview.data?.data as {
    metrics?: Record<string, number>;
    teachers?: Array<{ id: number; name: string | null; email: string | null; username: string | null; status: string; initialPassword?: string | null }>;
  } | undefined;

  const metrics = data?.metrics ?? {};
  const filteredTeachers = (data?.teachers ?? []).filter(teacher =>
    !filter.trim() || [teacher.name, teacher.email, teacher.username, teacher.status].some(value => String(value ?? "").toLowerCase().includes(filter.trim().toLowerCase()))
  );

  return (
    <BlueprintShell role="ADMIN">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">SCHOOL / FACULTY MANAGEMENT</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">School command center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 font-medium">
            Manage faculty inside your school boundary. Cross-school resources are rejected by the server before any state is changed.
          </p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)} className="bg-[#ff1f6d] text-white hover:bg-[#e0145c] font-bold shadow-md shadow-pink-600/20">
          <Plus className="mr-2 size-4" />
          Create teacher
        </Button>
      </header>

      {showForm && (
        <form onSubmit={(event) => { event.preventDefault(); create.mutate(form); }} className="blueprint-panel mt-6 grid gap-3 p-5 sm:grid-cols-2">
          <p className="eyebrow sm:col-span-2">FACULTY / SECURE PROVISIONING</p>
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className="text-xs font-semibold text-slate-700">
              {key.replace(/([A-Z])/g, " $1")}
              {key === "temporaryPassword" ? (
                <PasswordInput required value={value} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 border-slate-300 bg-white text-slate-900" />
              ) : (
                <Input required value={value} type="text" onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-1.5 border-slate-300 bg-white text-slate-900" />
              )}
            </label>
          ))}
          <div className="sm:col-span-2">
            <Button disabled={create.isPending} className="bg-[#ff1f6d] text-white hover:bg-[#e0145c] font-bold">
              {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create faculty account
            </Button>
          </div>
        </form>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Teachers", metrics.teachers ?? 0], ["Students", metrics.students ?? 0], ["Assessments", metrics.assessments ?? 0], ["Attempts", metrics.attempts ?? 0]].map(([label, value]) => (
          <div key={String(label)} className="metric-card flex-col items-start justify-between p-5">
            <div className="flex items-center gap-2">
              <UsersRound className="size-5 text-[#ff1f6d]" />
              <span>{label}</span>
            </div>
            <strong className="text-3xl font-extrabold text-[#ff1f6d] mt-2">{value}</strong>
          </div>
        ))}
      </section>

      <section className="blueprint-panel mt-5 p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">FACULTY DIRECTORY</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">Teachers in your school</h2>
          </div>
          <label className="text-xs font-semibold text-slate-700">
            Filter faculty
            <Input value={filter} onChange={(event) => setFilter(event.target.value)} className="mt-1.5 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400" placeholder="Name, email, username, or status…" />
          </label>
        </div>

        {overview.isLoading ? (
          <p className="empty-state">Loading school-scoped faculty records…</p>
        ) : filteredTeachers.length ? (
          <div className="mt-5 overflow-auto">
            <table className="technical-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>
                    <span className="flex items-center gap-1">
                      Password
                      <button type="button" onClick={() => setShowPasswords((v) => !v)} className="ml-1 text-[10px] text-[#ff1f6d] hover:underline">
                        {showPasswords ? "Hide" : "Show"}
                      </button>
                    </span>
                  </th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Operations</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="font-bold text-slate-900">{teacher.name || "Unnamed"}</td>
                    <td className="font-mono text-xs text-[#ff1f6d] font-bold">{teacher.username || "—"}</td>
                    <td className="font-mono text-xs">
                      <span className={teacher.initialPassword ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                        {teacher.initialPassword ? (showPasswords ? teacher.initialPassword : "••••••••••••") : "—"}
                      </span>
                    </td>
                    <td className="text-slate-700">{teacher.email}</td>
                    <td>
                      <span className="technical-chip border-emerald-300 bg-emerald-50 text-emerald-700">{teacher.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ${teacher.name || "this teacher"}? Their active access and managed students will be permanently deleted.`)) {
                            deleteTeacher.mutate({ teacherId: teacher.id });
                          }
                        }}
                        className="technical-chip border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 inline-flex items-center gap-1"
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No faculty members match the current filter.</p>
        )}
      </section>

      <ActivityLogPanel />
    </BlueprintShell>
  );
}


