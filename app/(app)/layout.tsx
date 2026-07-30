import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 bg-slate-100">{children}</main>
      </div>
    </div>
  );
}
