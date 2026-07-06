"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ShieldCheck, LogIn } from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { isAdminUser } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login({
        email,
        password,
        totp_code: needs2fa ? totpCode : undefined,
      });

      if ("requires_2fa" in data) {
        setNeeds2fa(true);
        return;
      }

      setTokens(data.access_token, data.refresh_token);
      if (!isAdminUser()) {
        useAuthStore.getState().logout();
        toast.error("This account does not have admin access.");
        return;
      }

      const { data: user } = await authApi.me();
      setUser(user);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-xl p-8">
        <div className="text-center mb-6">
          <span className="text-2xl font-extrabold tracking-tight text-white">
            amaz<span className="text-primary-500">ra</span>
          </span>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!needs2fa ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-primary-500"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                <ShieldCheck size={15} className="text-primary-500" />
                6-digit authenticator code
              </label>
              <input
                type="text"
                required
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full h-10 px-3 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-100 tracking-[0.3em] text-center focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-50 transition-colors"
          >
            <LogIn size={16} />
            {loading ? "Signing in…" : needs2fa ? "Verify Code" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
