import { Building2, GraduationCap, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";

const paths = [
  {
    icon: Building2,
    title: "Institution Admin",
    copy: "Contact the Northstar platform owner. Your school or college receives a unique institution code and its first Admin credentials.",
  },
  {
    icon: UsersRound,
    title: "Teacher",
    copy: "Contact your institution Admin. They create your school-scoped teacher account and issue your credentials.",
  },
  {
    icon: GraduationCap,
    title: "Student",
    copy: "Contact your Teacher. They create or import your roster record and issue a username or USN/roll-number login.",
  },
];

export default function Signup() {
  return (
    <main className="blueprint-surface flex min-h-screen items-center justify-center p-4 sm:p-8 bg-[#f8fafc]">
      <section className="blueprint-panel w-full max-w-3xl p-6 sm:p-8">
        <Link href="/" className="eyebrow text-[#ff1f6d] hover:underline font-bold">
          ← RETURN TO NORTHSTAR
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <div className="grid size-10 place-items-center rounded-xl border border-pink-200 bg-pink-50 shrink-0">
            <ShieldCheck className="size-6 text-[#ff1f6d]" />
          </div>
          <div>
            <p className="eyebrow">ACCOUNT CREATION / CONTROLLED</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Accounts are provisioned, not public</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 font-medium">
              To protect institutions and student records, Northstar does not permit self-registration. Follow the appropriate route below to receive your pre-created account.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <article key={path.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="size-6 text-[#ff1f6d]" />
                <h2 className="mt-4 font-bold text-slate-900 text-base">{path.title}</h2>
                <p className="mt-2 text-xs leading-6 text-slate-600">{path.copy}</p>
              </article>
            );
          })}
        </div>

        <Link
          href="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#ff1f6d] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-600/20 transition hover:bg-[#e0145c]"
        >
          I have issued credentials — sign in
        </Link>
      </section>
    </main>
  );
}
