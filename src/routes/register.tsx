import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/safesky/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setState, getState } from "@/lib/safesky";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — SAFESKY" },
      { name: "description", content: "Register for SAFESKY emergency protection in under a minute." },
      { property: "og:title", content: "Create account — SAFESKY" },
      { property: "og:description", content: "Register for SAFESKY emergency protection." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      toast.error("Please fill all fields.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setState({
        authed: true,
        profile: { ...getState().profile, name: form.name, phone: form.phone, email: form.email, role: "user" },
      });
      toast.success("Account created — you are protected.");
      navigate({ to: "/app" });
    }, 800);
  };

  const fields: { key: keyof typeof form; label: string; type?: string }[] = [
    { key: "name", label: "Full name" },
    { key: "phone", label: "Phone number", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "password", label: "Password", type: "password" },
    { key: "confirm", label: "Confirm password", type: "password" },
  ];

  return (
    <main className="bg-night flex min-h-screen items-center justify-center px-5 py-10">
      <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
        <Wordmark />
        <h1 className="font-display mt-8 text-2xl font-semibold">Create account</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                type={f.type ?? "text"}
                value={form[f.key]}
                onChange={set(f.key)}
                className="h-11"
              />
            </div>
          ))}
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />} Sign up
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}