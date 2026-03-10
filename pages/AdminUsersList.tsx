import {
  Download, Filter,
  Mail, Plus,
  RefreshCw,
  Search,
  Shield, TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { AdminTable, AdminTableColumn } from '../components/Admin/AdminTable';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { showToast } from '../components/ui/toast';
import { adminAPI } from '../services/apiAdmin';
import { User } from '../types';

export const AdminUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Unexpected data format:', data);
        showToast('Format de données invalide', 'error');
      }
    } catch (error: any) {
      const message = error.message || 'Impossible de charger les utilisateurs';
      showToast(message, 'error');
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExport = () => {
    showToast('Export des données démarré', 'success');
  };

  const handleRefresh = () => {
    fetchUsers();
    showToast('Liste rafraîchie', 'success');
  };

  const handleDeleteUser = (user: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.nom} ?`)) {
      showToast(`Utilisateur ${user.nom} supprimé`, 'success');
    }
  };

  const handleEditUser = (user: any) => {
    console.log('Éditer:', user);
  };

  const handleViewDetails = (user: any) => {
    console.log('Voir détails:', user);
  };

  const tableColumns: AdminTableColumn[] = [
    {
      header: 'Utilisateur',
      accessor: 'nom',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.email}`} alt={row.nom} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(row.nom || 'U')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{row.nom}</p>
            <p className="text-sm text-gray-600">ID: {row.id?.slice(0, 8)}...</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      header: 'Rôle',
      accessor: 'role',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Badge className={`${getRoleColor(value)} capitalize`}>
            {value === 'admin' && <Shield className="h-3 w-3 mr-1" />}
            {value}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Date d\'inscription',
      accessor: 'date_inscription',
      render: (value: string) => (
        <div className="space-y-1">
          <p className="text-gray-700">
            {new Date(value).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
          <p className="text-xs text-gray-600">
            {Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))} jours
          </p>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-700">Chargement des utilisateurs...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="text-gray-600 mt-2">
                Gérez {users.length} utilisateurs inscrits sur la plateforme
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-600 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                className="border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-600 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>

              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6 border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Barre de recherche */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Filtre par rôle */}
              <div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="border-gray-300 text-gray-900 bg-white">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtres secondaires */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Résultats de la recherche</span>
              </div>

              <div className="text-sm text-gray-600">
                {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total d'utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Administrateurs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux d'inscription</p>
                  <p className="text-2xl font-bold text-gray-900">100%</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau */}
        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900">Liste des Utilisateurs</CardTitle>
            <CardDescription className="text-gray-600">
              Gérez et suivez tous les utilisateurs inscrits sur votre plateforme
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <AdminTable
              columns={tableColumns}
              data={filteredUsers}
              onView={handleViewDetails}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};