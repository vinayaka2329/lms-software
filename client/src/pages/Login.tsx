import { useState } from "react";
import { ArrowRight, Building2, GraduationCap, Loader2, ShieldCheck, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { trpc } from "@/lib/trpc";

const destinations = { ADMIN: "/admin", TEACHER: "/teacher", STUDENT: "/student" } as const;
const roles = [
  { value: "ADMIN", label: "Institution Admin", icon: Building2, copy: "School or college operations" },
  { value: "TEACHER", label: "Teacher", icon: UsersRound, copy: "Roster and assessment studio" },
  { value: "STUDENT", label: "Student", icon: GraduationCap, copy: "Assigned assessment console" },
] as const;

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("STUDENT");
  const [institutionCode, setInstitutionCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: async (result) => {
      try {
        sessionStorage.setItem("lms-credential-session", "1");
        sessionStorage.removeItem("manus-cookie");
        localStorage.removeItem("manus-runtime-user-info");
        if (result.data.token) sessionStorage.setItem("lms-tab-token", result.data.token);
      } catch {}
      utils.auth.me.setData(undefined, result.data.user);
      await utils.auth.me.invalidate();
      toast.success("Secure session established.");
      navigate(destinations[result.data.user.role as keyof typeof destinations]);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <main className="blueprint-surface flex min-h-screen items-center justify-center p-4 sm:p-8 bg-[#f8fafc]">
      <section className="blueprint-panel w-full max-w-2xl p-6 sm:p-8">
        <Link href="/" className="eyebrow text-[#ff1f6d] hover:underline font-bold">
          ← RETURN TO NORTHSTAR
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-pink-200 bg-pink-50">
            <ShieldCheck className="size-6 text-[#ff1f6d]" />
          </div>
          <div>
            <p className="eyebrow">PRE-PROVISIONED ACCESS</p>
            <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Sign in to your workspace</h1>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600 font-medium">
          Select the role assigned to you and enter the institution code and credentials issued by your Administrator or Teacher.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {roles.map((item) => {
            const Icon = item.icon;
            const selected = role === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(item.value)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-[#ff1f6d] bg-pink-50/60 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Icon className={`size-5 ${selected ? "text-[#ff1f6d]" : "text-slate-500"}`} />
                <p className="mt-3 text-sm font-bold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.copy}</p>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate({ role, institutionCode, identifier, password });
          }}
          className="mt-7 grid gap-4"
        >
          <label className="text-xs font-bold text-slate-700">
            Institution code
            <Input
              required
              value={institutionCode}
              onChange={(event) => setInstitutionCode(event.target.value.toUpperCase())}
              className="mt-1.5 border-slate-300 bg-white font-mono uppercase text-slate-900 placeholder:text-slate-400"
              placeholder="E.G., NORTH-7K29X"
              autoComplete="organization"
            />
          </label>

          <label className="text-xs font-bold text-slate-700">
            {role === "STUDENT" ? "Username, USN, or roll number" : "Email or username"}
            <Input
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="mt-1.5 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              autoComplete="username"
            />
          </label>

          <label className="text-xs font-bold text-slate-700">
            Password
            <PasswordInput
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              className="mt-1.5 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              autoComplete="current-password"
            />
          </label>

          <Button
            disabled={login.isPending}
            className="w-full bg-[#ff1f6d] text-white hover:bg-[#e0145c] font-bold py-3 text-sm shadow-md shadow-pink-600/20"
          >
            {login.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Sign in securely
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          No issued credentials?{" "}
          <Link href="/signup" className="font-bold text-[#ff1f6d] hover:underline">
            View account access guidance
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
