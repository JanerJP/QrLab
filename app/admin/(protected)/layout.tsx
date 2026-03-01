import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LogoutButton from "../LogoutButton";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-sm">QRLab Admin</span>
            <span className="text-blue-200 text-xs ml-2">FGL 015</span>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <a href="/admin" className="text-sm text-blue-100 hover:text-white transition-colors">Laboratorios</a>
          <a href="/admin/registros" className="text-sm text-blue-100 hover:text-white transition-colors">Registros</a>
          <LogoutButton />
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
