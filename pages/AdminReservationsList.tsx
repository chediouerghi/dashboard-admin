import { Calendar, Download, Filter, RefreshCw, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { AdminTable, AdminTableColumn } from '../components/Admin/AdminTable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { showToast } from '../components/ui/toast';
import { adminAPI } from '../services/apiAdmin';
import { Reservation } from '../types';

export const AdminReservationsList = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [newStatus, setNewStatus] = useState<'en_attente' | 'confirmee' | 'refusee' | 'annulee'>('en_attente');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, statusFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllReservations();
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        console.error('Unexpected data format:', data);
        showToast('Format de données invalide', 'error');
      }
    } catch (error: any) {
      const message = error.message || 'Impossible de charger les réservations';
      showToast(message, 'error');
      console.error('Erreur chargement réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    if (searchTerm) {
      filtered = filtered.filter(res =>
        res.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.evenement?.titre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(res => res.statut === statusFilter);
    }

    setFilteredReservations(filtered);
  };

  const handleStatusChange = async () => {
    if (!selectedReservation) return;
    try {
      await adminAPI.updateReservationStatus(selectedReservation.id, newStatus);

      setReservations(reservations.map((r) =>
        r.id === selectedReservation.id ? { ...r, statut: newStatus } : r
      ));

      const statusText = {
        'en_attente': 'en attente',
        'confirmee': 'confirmée',
        'annulee': 'annulée',
        'refusee': 'refusée'
      }[newStatus];

      showToast(`Réservation ${statusText} avec succès`, 'success');
    } catch (error: any) {
      const message = error.message || 'Impossible de mettre à jour la réservation';
      showToast(message, 'error');
      console.error('Erreur mise à jour réservation:', error);
    } finally {
      setShowStatusDialog(false);
      setSelectedReservation(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedReservation) return;
    try {
      await adminAPI.deleteReservation(selectedReservation.id);
      setReservations(reservations.filter((r) => r.id !== selectedReservation.id));
      showToast('Réservation supprimée avec succès', 'success');
    } catch (error: any) {
      const message = error.message || 'Impossible de supprimer la réservation';
      showToast(message, 'error');
      console.error('Erreur suppression réservation:', error);
    } finally {
      setShowDeleteDialog(false);
      setSelectedReservation(null);
    }
  };

  const handleExport = () => showToast('Export démarré', 'success');
  const handleRefresh = () => fetchReservations().then(() => showToast('Liste rafraîchie', 'success'));

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'en_attente': { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
      'confirmee': { label: 'Confirmée', color: 'bg-green-100 text-green-700' },
      'annulee': { label: 'Annulée', color: 'bg-gray-100 text-gray-700' },
      'refusee': { label: 'Refusée', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const columns: AdminTableColumn[] = [
    {
      header: 'Utilisateur',
      accessor: 'user',
      render: (value: any) => <span className="font-medium text-gray-900">{value?.nom || 'N/A'}</span>
    },
    {
      header: 'Événement',
      accessor: 'evenement',
      render: (value: any) => <span className="text-gray-700">{value?.titre || 'N/A'}</span>
    },
    {
      header: 'Statut',
      accessor: 'statut',
      render: (value: string) => {
        const { label, color } = getStatusInfo(value);
        return <Badge className={`${color}`}>{label}</Badge>;
      }
    },
    {
      header: 'Date',
      accessor: 'date_reservation',
      render: (value: string) => (
        <div className="space-y-1">
          <span className="text-gray-700">{value ? new Date(value).toLocaleDateString('fr-FR') : '-'}</span>
          <span className="text-xs text-gray-600">{value ? new Date(value).toLocaleTimeString('fr-FR') : ''}</span>
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
            <p className="mt-4 text-lg font-medium text-gray-700">Chargement des réservations...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
              <p className="text-gray-600 mt-2">Gérez {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={handleRefresh} variant="outline" className="border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-600 hover:text-white">
                <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
              </Button>
              <Button onClick={handleExport} variant="outline" className="border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-600 hover:text-white">
                <Download className="h-4 w-4 mr-2" /> Exporter
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-6 border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par utilisateur ou événement..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 text-gray-900 placeholder:text-gray-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-300 text-gray-900 bg-white">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="confirmee">Confirmée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                    <SelectItem value="refusee">Refusée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Résultats</span>
              </div>
              <div className="text-sm text-gray-600">
                {filteredReservations.length} réservation{filteredReservations.length !== 1 ? 's' : ''} trouvée{filteredReservations.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
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
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => r.statut === 'en_attente').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => r.statut === 'confirmee').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Badge className="bg-emerald-100 text-emerald-700">Confirmée</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Annulées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => r.statut === 'annulee').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gray-100">
                  <Calendar className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Refusées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reservations.filter(r => r.statut === 'refusee').length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-red-100">
                  <Badge className="bg-red-100 text-red-700">Refus</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900">Liste des Réservations</CardTitle>
            <CardDescription className="text-gray-600">
              Gérez toutes les réservations des utilisateurs
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <AdminTable
              columns={columns}
              data={filteredReservations}
              onView={(res) => console.log('Voir:', res)}
              onEdit={(res) => { setSelectedReservation(res); setNewStatus(res.statut); setShowStatusDialog(true); }}
              onDelete={(res) => { setSelectedReservation(res); setShowDeleteDialog(true); }}
              loading={loading}
            />
          </CardContent>
        </Card>

        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="bg-white rounded-lg border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Modifier le statut</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Utilisateur: <span className="font-semibold">{selectedReservation?.user?.nom}</span></p>
                <p className="text-sm text-gray-600">Événement: {selectedReservation?.evenement?.titre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Nouveau statut</label>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger className="border-gray-300 bg-white text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="confirmee">Confirmée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                    <SelectItem value="refusee">Refusée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)} className="border-gray-300 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-white">
                Annuler
              </Button>
              <Button onClick={handleStatusChange} className="bg-blue-600 hover:bg-blue-700 text-white">
                Mettre à jour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white rounded-lg border border-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-gray-900">Supprimer la réservation ?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer la réservation de {selectedReservation?.user?.nom} pour {selectedReservation?.evenement?.titre} ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="border-gray-300 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-white">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Supprimer
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};