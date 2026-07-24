import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-grid overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-full bg-grid">
        <Outlet />
      </main>
    </div>
  );
}
