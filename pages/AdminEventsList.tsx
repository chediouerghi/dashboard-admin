import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Filter,
  Loader2,
  MapPin,
  Music,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { AdminTable, AdminTableColumn } from '../components/Admin/AdminTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { showToast } from '../components/ui/toast';
import { apiClient } from '../services/api';
import { adminAPI } from '../services/apiAdmin';
import { useAuthStore } from '../store/authStore';

interface EventFormData {
  titre: string;
  description: string;
  date_event: string;
  lieu: string;
  categorie_id: string;
  capacite_max: number;
  artiste_ids: string[];
}

export const AdminEventsList = () => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [artistes, setArtistes] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState<EventFormData>({
    titre: '',
    description: '',
    date_event: '',
    lieu: '',
    categorie_id: '',
    capacite_max: 100,
    artiste_ids: []
  });

  useEffect(() => {
    fetchEvents();
    fetchArtistes();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, categoryFilter, statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllEvents();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('Unexpected data format:', data);
        showToast('Format de données invalide', 'error');
      }
    } catch (error: any) {
      const message = error.message || 'Impossible de charger les événements';
      showToast(message, 'error');
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistes = async () => {
    try {
      const data = await adminAPI.getAllArtistes();
      if (Array.isArray(data)) {
        setArtistes(data || []);
      } else {
        setArtistes([]);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des artistes:', error);
      setArtistes([]);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.categorie_id === categoryFilter);
    }

    if (statusFilter === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date_event) > new Date());
    } else if (statusFilter === 'past') {
      filtered = filtered.filter(event => new Date(event.date_event) <= new Date());
    }

    setFilteredEvents(filtered);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await adminAPI.deleteEvent(selectedEvent.id);
      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      showToast('Événement supprimé avec succès', 'success');
    } catch (error: any) {
      const message = error.message || 'Impossible de supprimer l\'événement';
      showToast(message, 'error');
      console.error('Erreur suppression événement:', error);
    } finally {
      setShowDeleteDialog(false);
      setSelectedEvent(null);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    
    if (!formData.titre || !formData.description || !formData.date_event || !formData.lieu || !formData.categorie_id) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await adminAPI.updateEvent(selectedEvent.id, {
        titre: formData.titre,
        description: formData.description,
        date_event: formData.date_event,
        lieu: formData.lieu,
        categorie_id: formData.categorie_id,
        capacite_max: formData.capacite_max,
        artiste_ids: formData.artiste_ids || []
      });
      
      await fetchEvents();
      showToast('Événement mis à jour avec succès!', 'success');
      setShowEditDialog(false);
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Erreur lors de la mise à jour';
      showToast(message, 'error');
      console.error('Erreur mise à jour événement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.titre || !formData.description || !formData.date_event || !formData.lieu || !formData.categorie_id) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createEvent({
        titre: formData.titre,
        description: formData.description,
        date_event: formData.date_event,
        lieu: formData.lieu,
        categorie_id: formData.categorie_id,
        capacite_max: formData.capacite_max,
        artiste_ids: formData.artiste_ids || [],
        statut: 'publie'
      });
      
      await fetchEvents();
      showToast('Événement créé avec succès!', 'success');
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Erreur lors de la création';
      showToast(message, 'error');
      console.error('Erreur création événement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    showToast('Export des événements démarré', 'success');
  };

  const handleRefresh = () => {
    fetchEvents();
    showToast('Liste rafraîchie', 'success');
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      date_event: '',
      lieu: '',
      categorie_id: '',
      capacite_max: 100,
      artiste_ids: []
    });
    setSelectedEvent(null);
  };

  const getEventStatus = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now ? 'À venir' : 'Terminé';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'À venir':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Terminé':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategories = () => {
    const categories = new Map<string, any>();
    events.forEach((event) => {
      if (event.categorie_id && event.categorie_nom) {
        categories.set(event.categorie_id, { id: event.categorie_id, nom: event.categorie_nom });
      }
    });
    return Array.from(categories.values());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tableColumns: AdminTableColumn[] = [
    {
      header: 'Événement',
      accessor: 'titre',
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {value}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">{row.lieu}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'date_event',
      render: (value: string) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{formatDate(value)}</span>
          </div>
          <Badge variant="outline" className={getStatusColor(getEventStatus(value))}>
            {getEventStatus(value)}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Catégorie',
      accessor: 'categorie_nom',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">{value || 'Non catégorisé'}</span>
        </div>
      ),
    },
    {
      header: 'Artistes',
      accessor: 'artistes',
      render: (value: any[], row: any) => (
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-indigo-500" />
          <div className="flex flex-col gap-1">
            {row.artistes && row.artistes.length > 0 ? (
              <div className="space-y-1">
                {row.artistes.slice(0, 2).map((artist: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <span className="text-gray-900 font-medium truncate">
                      {artist.kickName || artist.nom || 'N/A'}
                    </span>
                  </div>
                ))}
                {row.artistes.length > 2 && (
                  <span className="text-xs text-blue-600 font-medium">
                    +{row.artistes.length - 2} autres
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-500 italic text-sm">Aucun artiste</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Réservations',
      accessor: 'reservations_count',
      render: (value: number, row: any) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-gray-700 font-medium">{value || 0}</span>
            <span className="text-xs text-gray-500">
              sur {row.capacite_max || 0}
            </span>
          </div>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-700">Chargement des événements...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen  bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
              <p className="text-gray-600 mt-2">
                Gérez {events.length} événement{events.length !== 1 ? 's' : ''} sur votre plateforme
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-600 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-600 hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>

              <Button 
                onClick={() => setShowCreateDialog(true)} 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Événement
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6 border-gray-200 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par titre, description ou lieu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-300 bg-white">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="upcoming">À venir</SelectItem>
                    <SelectItem value="past">Terminés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Filtres :</span>
                </div>

                <div className="w-48">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 border-gray-300 text-sm">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {getCategories().map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-gray-600 font-medium">
                {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''} trouvé{filteredEvents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total événements</p>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">À venir</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => new Date(e.date_event) > new Date()).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-100 bg-gradient-to-br from-white to-violet-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total réservations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.reduce((acc, e) => acc + (e.reservations_count || 0), 0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-violet-100">
                  <Users className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-gradient-to-br from-white to-amber-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taux d'occupation</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.length > 0 ? 
                      Math.round((events.reduce((acc, e) => acc + (e.reservations_count || 0), 0) / 
                      events.reduce((acc, e) => acc + (e.capacite_max || 0), 0)) * 100) || 0 : 0}%
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-100">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau */}
        <Card className="border-gray-200 shadow-lg bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-xl font-bold text-gray-900">Liste des Événements</CardTitle>
            <CardDescription className="text-gray-600">
              Gérez tous les événements de votre plateforme
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <AdminTable
              columns={tableColumns}
              data={filteredEvents}
              onView={(event) => {
                console.log('Voir détails:', event);
              }}
              onEdit={(event) => {
                setSelectedEvent(event);
                setFormData({
                  titre: event.titre,
                  description: event.description,
                  date_event: event.date_event?.replace('Z', '') || '',
                  lieu: event.lieu,
                  categorie_id: event.categorie_id,
                  capacite_max: event.capacite_max || 100,
                  artiste_ids: event.artistes?.map((a: any) => a.id) || []
                });
                setShowEditDialog(true);
              }}
              onDelete={(event) => {
                setSelectedEvent(event);
                setShowDeleteDialog(true);
              }}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white border border-red-100 shadow-xl">
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-center text-xl font-bold text-gray-900">
                Supprimer l'événement ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600">
                Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-gray-900">"{selectedEvent?.titre}"</span> ?
                Cette action est irréversible et supprimera également toutes les réservations associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-center">
              <AlertDialogCancel
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedEvent(null);
                }}
              >
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer définitivement
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Modifier l'événement
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <div className="text-gray-700 font-medium mb-1">Titre *</div>
                  <Input
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="mt-1 border-gray-300"
                    placeholder="Titre de l'événement"
                  />
                </div>

                <div>
                  <div className="text-gray-700 font-medium mb-1">Description *</div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 border-gray-300 min-h-[100px]"
                    placeholder="Décrivez votre événement..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-700 font-medium mb-1">Date et heure *</div>
                    <Input
                      type="datetime-local"
                      value={formData.date_event}
                      onChange={(e) => setFormData({ ...formData, date_event: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>

                  <div>
                    <div className="text-gray-700 font-medium mb-1">Lieu *</div>
                    <Input
                      value={formData.lieu}
                      onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                      className="mt-1 border-gray-300"
                      placeholder="Paris, France..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-700 font-medium mb-1">Catégorie *</div>
                    <Select 
                      value={formData.categorie_id} 
                      onValueChange={(value) => setFormData({ ...formData, categorie_id: value })}
                    >
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategories().map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="text-gray-700 font-medium mb-1">Capacité maximale *</div>
                    <Input
                      type="number"
                      min="1"
                      value={formData.capacite_max}
                      onChange={(e) => setFormData({ ...formData, capacite_max: parseInt(e.target.value) || 100 })}
                      className="mt-1 border-gray-300"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-gray-700 font-medium mb-2">Artistes (optionnel)</div>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {artistes.length > 0 ? (
                      <div className="space-y-2">
                        {artistes.map((artist: any) => (
                          <label key={artist.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.artiste_ids?.includes(artist.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    artiste_ids: [...(formData.artiste_ids || []), artist.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    artiste_ids: (formData.artiste_ids || []).filter(id => id !== artist.id)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{artist.kickName}</span>
                              {artist.nom && artist.prenom && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {artist.prenom} {artist.nom}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {artist.genre}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucun artiste disponible</p>
                    )}
                  </div>
                  {formData.artiste_ids.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.artiste_ids.length} artiste{formData.artiste_ids.length > 1 ? 's' : ''} sélectionné{formData.artiste_ids.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  resetForm();
                }}
                className="border-gray-300 text-gray-700"
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdateEvent}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Créer un nouvel événement
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div>
                  <div className="text-gray-700 font-medium mb-1">Titre *</div>
                  <Input
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="mt-1 border-gray-300 bg-gray-100 text-gray-900"
                    placeholder="Titre de l'événement"
                  />
                </div>

                <div>
                  <div className="text-gray-700 font-medium mb-1">Description *</div>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 border-gray-300 bg-gray-100 text-gray-900 min-h-[100px]"
                    placeholder="Décrivez votre événement..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-700 font-medium mb-1">Date et heure *</div>
                    <Input
                      type="datetime-local"
                      value={formData.date_event}
                      onChange={(e) => setFormData({ ...formData, date_event: e.target.value })}
                      className="mt-1 border-gray-300 bg-gray-100 text-gray-900"
                    />
                  </div>

                  <div>
                    <div className="text-gray-700 font-medium mb-1">Lieu *</div>
                    <Input
                      value={formData.lieu}
                      onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                      className="mt-1 border-gray-300 bg-gray-100 text-gray-900 "
                      placeholder="Paris, France..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-700 font-medium mb-1">Catégorie *</div>
                    <Select 
                      value={formData.categorie_id} 
                      onValueChange={(value) => setFormData({ ...formData, categorie_id: value })}
                    >
                      <SelectTrigger className="mt-1 border-gray-300 bg-gray-100 text-gray-900">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategories().map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="text-gray-700 font-medium mb-1">Capacité maximale *</div>
                    <Input
                      type="number"
                      min="1"
                      value={formData.capacite_max}
                      onChange={(e) => setFormData({ ...formData, capacite_max: parseInt(e.target.value) || 100 })}
                      className="mt-1 border-gray-300 bg-gray-100 text-gray-900"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-gray-700 font-medium mb-2">Artistes (optionnel)</div>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {artistes.length > 0 ? (
                      <div className="space-y-2">
                        {artistes.map((artist: any) => (
                          <label key={artist.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-md transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.artiste_ids?.includes(artist.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    artiste_ids: [...(formData.artiste_ids || []), artist.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    artiste_ids: (formData.artiste_ids || []).filter(id => id !== artist.id)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{artist.kickName}</span>
                              {artist.nom && artist.prenom && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {artist.prenom} {artist.nom}
                                </span>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {artist.genre}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucun artiste disponible</p>
                    )}
                  </div>
                  {formData.artiste_ids.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.artiste_ids.length} artiste{formData.artiste_ids.length > 1 ? 's' : ''} sélectionné{formData.artiste_ids.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 bg-gray-100 text-gray-900 hover:bg-gray-600 hover:text-white"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 bg-gray-100 text-gray-900 hover:bg-gray-600 hover:text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer l'événement
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};