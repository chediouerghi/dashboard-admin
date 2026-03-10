import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

export const AdminHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="flex items-center justify-between px-6 md:px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, {user?.nom || 'Admin'} !
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2 border-slate-300 text-slate-700 bg-gray-100 hover:bg-gray-600 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </Button>
      </div>
    </header>
  );
};
