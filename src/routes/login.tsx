import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/safesky/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setState, getState } from "@/lib/safesky";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SAFESKY" },
      { name: "description", content: "Sign in to SAFESKY to access SOS alerts and live safety tools." },
      { property: "og:title", content: "Sign in — SAFESKY" },
      { property: "og:description", content: "Access SOS alerts and live safety tools." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 4) {
      toast.error("Enter a valid email and password (4+ characters).");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const profile = getState().profile;
      setState({ authed: true, profile: { ...profile, email, role: "user" } });
      toast.success("Welcome back to SAFESKY");
      navigate({ to: "/app" });
    }, 700);
  };

  return (
    <main className="bg-night flex min-h-screen items-center justify-center px-5 py-10">
      <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
        <Wordmark />
        <h1 className="font-display mt-8 text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your protection network is one tap away.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@safesky.app"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>
          <button
            type="button"
            onClick={() => toast.info("Password reset link sent to your email.")}
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
          <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base">
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />} Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Responder?{" "}
          <Link to="/head" className="text-danger hover:underline">
            Open the command app
          </Link>
        </p>
      </div>
    </main>
  );
}