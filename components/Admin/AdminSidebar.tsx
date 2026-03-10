import { Link, useLocation } from 'react-router-dom';
import { Users, Calendar, Music, Layers, ClipboardList, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { size } from 'zod';

export const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: '👥 Utilisateurs',
      path: '/admin/users',
      icon: Users,
    },
    {
      label: '🎟️ Événements',
      path: '/admin/events',
      icon: Calendar,
    },
    {
      label: '🎤 Artistes',
      path: '/admin/artistes',
      icon: Music,
    },
    {
      label: '🗂️ Catégories',
      path: '/admin/categories',
      icon: Layers,
    },
    {
      label: '📅 Réservations',
      path: '/admin/reservations',
      icon: ClipboardList,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-y-auto transition-transform duration-300 lg:relative lg:translate-x-0 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 mt-12 lg:mt-0">
          <div className="mb-8 pb-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <p className="text-slate-400 text-sm mt-1">Gestion complète</p>
          </div>

          <nav className="space-y-1">
            <Link
              to="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive('/admin/dashboard')
                  ? 'bg-blue-600 text-white font-semibold shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              📊 Dashboard
            </Link>

            <div className="my-4 border-t border-slate-700" />

            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white font-semibold shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
