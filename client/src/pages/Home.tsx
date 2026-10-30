import { ArrowRight, Building2, GraduationCap, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <main className="blueprint-surface min-h-screen p-4 sm:p-8 bg-[#f8fafc]">
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.25fr_.75fr]">
        <section>
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl border border-pink-200 bg-pink-50">
              <ShieldCheck className="size-6 text-[#ff1f6d]" />
            </div>
            <div>
              <p className="font-bold tracking-tight text-slate-900">NORTHSTAR</p>
              <p className="eyebrow mt-0.5">INSTITUTION ASSESSMENT SAAS</p>
            </div>
          </div>

          <p className="eyebrow mt-12">SELLABLE / MULTI-TENANT / ACCOUNT-PROVISIONED</p>

          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
            Assessment operations built for <span className="text-[#ff1f6d]">every institution.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 font-medium">
            Northstar gives each school or college a separately scoped command center for faculty, student rosters, protected MCQ assessments, integrity events, and audit-ready results.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {[
              [Building2, "Institution boundary", "Each school receives its own code, Admin, data scope, and audit trail."],
              [UsersRound, "Provisioned access", "Admins create Teachers. Teachers create or import Students."],
              [GraduationCap, "Controlled testing", "Students use issued credentials and a unique code to start assigned tests."],
            ].map(([Icon, title, copy]) => {
              const FeatureIcon = Icon as typeof ShieldCheck;
              return (
                <div key={title as string} className="blueprint-panel p-5">
                  <FeatureIcon className="size-5 text-[#ff1f6d]" />
                  <p className="mt-4 font-bold text-slate-900">{title as string}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{copy as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="blueprint-panel p-6 sm:p-8">
          <p className="eyebrow">INSTITUTION ACCESS</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Use your issued account</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Accounts are created by the platform owner, an institution Admin, or a Teacher. Public registration is intentionally disabled to protect school data boundaries.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-[#ff1f6d] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-600/20 transition hover:bg-[#e0145c]"
          >
            Open login <ArrowRight className="ml-2 size-4" />
          </Link>

          <Link
            href="/signup"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#ff1f6d] hover:text-[#ff1f6d]"
          >
            Need an account?
          </Link>

          <Link
            href="/super-admin/login"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-pink-200 bg-pink-50/50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#ff1f6d] transition hover:bg-pink-100/60"
          >
            Platform owner sign in
          </Link>

          <div className="mt-7 border-t border-slate-100 pt-5">
            <p className="eyebrow">ACCESS HIERARCHY</p>
            <p className="mt-2 text-xs leading-6 text-slate-600">
              <strong className="text-slate-900">Super Admin:</strong> owner-only. <strong className="text-slate-900">Institution Admin:</strong> created by the owner. <strong className="text-slate-900">Teacher:</strong> created by their institution Admin. <strong className="text-slate-900">Student:</strong> created or imported by their Teacher.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
