import { BookOpenCheck, Building2, ClipboardCheck, ContactRound, FolderPlus, GraduationCap, LogOut, ShieldCheck, Trophy, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const roleConfig = {
  SUPER_ADMIN: { title: "Platform command", label: "SUPER ADMIN", icon: ShieldCheck, home: "/super-admin", links: [{ label: "Institution registry", href: "/super-admin", icon: Building2 }] },
  ADMIN: { title: "School command", label: "SCHOOL ADMIN", icon: Building2, home: "/admin", links: [{ label: "Faculty registry", href: "/admin", icon: UsersRound }] },
  TEACHER: { title: "Assessment studio", label: "TEACHER", icon: BookOpenCheck, home: "/teacher", links: [{ label: "Command center", href: "/teacher", icon: BookOpenCheck }, { label: "Student tables", href: "/teacher/tables", icon: FolderPlus }, { label: "Student directory", href: "/teacher/students", icon: UsersRound }, { label: "Test results", href: "/teacher/results", icon: Trophy }, { label: "Roster import", href: "/teacher/import", icon: ContactRound }] },
  STUDENT: { title: "Assessment console", label: "STUDENT", icon: GraduationCap, home: "/student", links: [{ label: "My assessments", href: "/student", icon: ClipboardCheck }, { label: "View results", href: "/student#results", icon: Trophy }] },
} as const;

export function BlueprintShell({ role, children }: { role: keyof typeof roleConfig; children: React.ReactNode }) {
  const [location, navigate] = useLocation(); const utils = trpc.useUtils();
  const auth = trpc.auth.me.useQuery(undefined, {
    onSuccess: (data) => {
      if (data && 'token' in data && typeof data.token === 'string') {
        try {
          sessionStorage.setItem("lms-tab-token", data.token);
        } catch {}
      }
    }
  });
  const logout = trpc.auth.logout.useMutation({ onSuccess: () => { try { sessionStorage.removeItem("lms-credential-session"); sessionStorage.removeItem("manus-cookie"); sessionStorage.removeItem("lms-tab-token"); localStorage.removeItem("manus-runtime-user-info"); } catch {} utils.auth.me.setData(undefined, null); toast.success("Signed out."); navigate("/"); } });
  const config = roleConfig[role]; const Icon = config.icon;
  const switchToOwner = () => { try { sessionStorage.removeItem("lms-credential-session"); sessionStorage.removeItem("manus-cookie"); sessionStorage.removeItem("lms-tab-token"); localStorage.removeItem("manus-runtime-user-info"); } catch {} navigate("/super-admin/login"); };
  if (auth.isLoading) return <main className="blueprint-surface flex min-h-screen items-center justify-center text-slate-700">Loading authenticated workspace…</main>;
  if (!auth.data) return <main className="blueprint-surface flex min-h-screen items-center justify-center p-6"><div className="blueprint-panel max-w-md p-7"><p className="eyebrow">SESSION REQUIRED</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">Sign in to access this workspace.</h1>{role === "SUPER_ADMIN" ? <button onClick={switchToOwner} className="mt-5 inline-flex rounded-lg bg-[#ff1f6d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e0145c]">Sign in as Super Admin</button> : <Link href="/" className="mt-5 inline-flex rounded-lg bg-[#ff1f6d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e0145c]">Return to sign in</Link>}</div></main>;
  if (auth.data.role !== role) return <main className="blueprint-surface flex min-h-screen items-center justify-center p-6"><div className="blueprint-panel max-w-md p-7"><p className="eyebrow">ACCESS BOUNDARY</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">This workspace is not assigned to your role.</h1>{role === "SUPER_ADMIN" ? <button onClick={switchToOwner} className="mt-5 inline-flex rounded-lg bg-[#ff1f6d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e0145c]">Switch to Super Admin sign-in</button> : <Link href={roleConfig[auth.data.role].home} className="mt-5 inline-flex rounded-lg bg-[#ff1f6d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e0145c]">Open assigned workspace</Link>}</div></main>;
  return (
    <main className="blueprint-surface min-h-screen bg-[#f8fafc]">
      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-800 bg-[#070c1e] p-5 text-white lg:border-b-0 lg:border-r flex flex-col justify-between">
          <div>
            <Link href={config.home} className="flex items-center gap-3">
              <div className="grid size-10 place-items-center border border-pink-500/30 bg-[#ff1f6d]/10 rounded-xl text-[#ff1f6d] font-bold">
                <Icon className="size-5 text-[#ff1f6d]" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-white">NORTHSTAR</p>
                <p className="eyebrow mt-0.5">{config.label}</p>
              </div>
            </Link>
            <nav className="mt-9 flex gap-2 overflow-auto lg:flex-col">
              {config.links.map(link => {
                const LinkIcon = link.icon;
                const isActive = location === link.href || (link.href !== "/teacher" && link.href !== "/student" && location.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#ff1f6d] text-white shadow-lg shadow-pink-600/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <LinkIcon className="size-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-5 lg:mt-20">
            <p className="text-sm font-semibold text-white">{auth.data.name}</p>
            <p className="mt-1 text-xs text-slate-400">{auth.data.email}</p>
            <button onClick={() => logout.mutate()} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-pink-400 transition">
              <LogOut className="size-3.5" />
              Sign out securely
            </button>
          </div>
        </aside>
        <div className="p-4 sm:p-7 bg-[#f8fafc]">{children}</div>
      </div>
    </main>
  );
}
