import { Download, Filter, Music, Plus, RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { AdminTable, AdminTableColumn } from '../components/Admin/AdminTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { showToast } from '../components/ui/toast';
import { adminAPI } from '../services/apiAdmin';

export const AdminArtistesList = () => {
  const [artistes, setArtistes] = useState<any[]>([]);
  const [filteredArtistes, setFilteredArtistes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedArtiste, setSelectedArtiste] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [formData, setFormData] = useState({
    kickName: '',
    nom: '',
    prenom: '',
    genre: '',
    description: '',
    date_naissance: '',
  });

  useEffect(() => {
    fetchArtistes();
  }, []);

  useEffect(() => {
    filterArtistes();
  }, [artistes, searchTerm, genreFilter]);

  const filterArtistes = () => {
    let filtered = [...artistes];

    if (searchTerm) {
      filtered = filtered.filter(artiste =>
        artiste.kickName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artiste.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artiste.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genreFilter !== 'all') {
      filtered = filtered.filter(artiste => artiste.genre === genreFilter);
    }

    setFilteredArtistes(filtered);
  };

  const getGenres = () => {
    const genres = new Set(artistes.map(a => a.genre).filter(Boolean));
    return Array.from(genres);
  };

  const fetchArtistes = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllArtistes();
      if (Array.isArray(data)) {
        setArtistes(data);
      } else {
        console.error('Unexpected data format:', data);
        showToast('Format de données invalide', 'error');
      }
    } catch (error: any) {
      const message = error.message || 'Impossible de charger les artistes';
      showToast(message, 'error');
      console.error('Erreur chargement artistes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArtiste = async () => {
    try {
      if (!formData.kickName || !formData.nom || !formData.prenom || !formData.genre) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      const response = await adminAPI.createArtiste(formData);
      
      // Récupérer les artistes avec les mises à jour complètes
      const updatedArtistes = await adminAPI.getAllArtistes();
      setArtistes(updatedArtistes);
      
      showToast('Artiste créé avec succès', 'success');
      setShowAddDialog(false);
      setFormData({
        kickName: '',
        nom: '',
        prenom: '',
        genre: '',
        description: '',
        date_naissance: '',
      });
    } catch (error: any) {
      const message = error.message || 'Impossible de créer l\'artiste';
      showToast(message, 'error');
      console.error('Erreur création artiste:', error);
    }
  };

  const handleDelete = async (artisteId?: string) => {
    if (!selectedArtiste && !artisteId) return;
    try {
      const id = artisteId || selectedArtiste?.id;
      if (!id) return;

      await adminAPI.deleteArtiste(id);
      setArtistes(artistes.filter((a) => a.id !== id));
      showToast('Artiste supprimé avec succès', 'success');
    } catch (error: any) {
      const message = error.message || 'Impossible de supprimer l\'artiste';
      showToast(message, 'error');
      console.error('Erreur suppression artiste:', error);
    } finally {
      setShowDeleteDialog(false);
      setSelectedArtiste(null);
    }
  };

  const handleExport = () => {
    showToast('Export des artistes démarré', 'success');
  };

  const handleRefresh = () => {
    fetchArtistes();
    showToast('Liste rafraîchie', 'success');
  };

  const columns: AdminTableColumn[] = [
    {
      header: 'Kick Name',
      accessor: 'kickName',
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">ID: {row.id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      header: 'Prénom Nom',
      accessor: 'prenom',
      render: (value: string, row: any) => (
        <span className="text-gray-900">{value} {row.nom}</span>
      ),
    },
    {
      header: 'Genre',
      accessor: 'genre',
      render: (value: string) => (
        <Badge className="bg-indigo-100 text-indigo-700 capitalize">
          {value || 'Non spécifié'}
        </Badge>
      ),
    },
    {
      header: 'Popularité',
      accessor: 'popularite',
      render: (value: number) => (
        <span className="text-gray-900 font-medium">{value || '0'}</span>
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
            <p className="mt-4 text-lg font-medium text-gray-700">Chargement des artistes...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Artistes</h1>
              <p className="text-gray-600 mt-2">
                Gérez {artistes.length} artiste{artistes.length !== 1 ? 's' : ''} sur la plateforme
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

              <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Artiste
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
                    placeholder="Rechercher par kick name, nom ou prénom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Filtre par genre */}
              {getGenres().length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Genre</label>
                  <select
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-gray-900"
                  >
                    <option value="all">Tous les genres</option>
                    {getGenres().map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Infos de filtrage */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Résultats de la recherche</span>
              </div>

              <div className="text-sm text-gray-600">
                {filteredArtistes.length} artiste{filteredArtistes.length !== 1 ? 's' : ''} trouvé{filteredArtistes.length !== 1 ? 's' : ''}
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
                  <p className="text-sm text-gray-600">Total d'artistes</p>
                  <p className="text-2xl font-bold text-gray-900">{artistes.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Music className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Genres</p>
                  <p className="text-2xl font-bold text-gray-900">{getGenres().length}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-100">
                  <Badge className="bg-purple-100 text-purple-700">Multi</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Popularité moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {artistes.length > 0 ? (artistes.reduce((sum, a) => sum + (a.popularite || 0), 0) / artistes.length).toFixed(1) : '0'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-100">
                  <Music className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau */}
        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900">Liste des Artistes</CardTitle>
            <CardDescription className="text-gray-600">
              Gérez et suivez tous les artistes de votre plateforme
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <AdminTable
              columns={columns}
              data={filteredArtistes}
              onEdit={(artiste) => {
                setSelectedArtiste(artiste);
                setShowAddDialog(true);
              }}
              onDelete={(artiste) => {
                setSelectedArtiste(artiste);
                setShowDeleteDialog(true);
              }}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Dialog Ajouter/Éditer un Artiste */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="border-gray-200 rounded-lg max-w-md bg-white max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {selectedArtiste ? 'Modifier un Artiste' : 'Ajouter un Artiste'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4 text-gray-900">
              <div>
                <label className="text-sm font-medium text-gray-900">Kick Name *</label>
                <Input
                  placeholder="Kick name..."
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 mt-1"
                  value={selectedArtiste?.kickName || formData.kickName}
                  onChange={(e) => setFormData({ ...formData, kickName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Nom *</label>
                <Input
                  placeholder="Nom..."
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 mt-1"
                  value={selectedArtiste?.nom || formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Prénom *</label>
                <Input
                  placeholder="Prénom..."
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 mt-1"
                  value={selectedArtiste?.prenom || formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Genre *</label>
                <Input
                  placeholder="Genre..."
                  className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 mt-1"
                  value={selectedArtiste?.genre || formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Description</label>
                <textarea
                  placeholder="Description de l'artiste..."
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-1"
                  rows={3}
                  value={selectedArtiste?.description || formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900">Date de naissance</label>
                <Input
                  type="date"
                  className="border-gray-300 bg-white text-gray-900 mt-1"
                  value={selectedArtiste?.date_naissance ? selectedArtiste.date_naissance.split('T')[0] : formData.date_naissance}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                setSelectedArtiste(null);
                setFormData({
                  kickName: '',
                  nom: '',
                  prenom: '',
                  genre: '',
                  description: '',
                  date_naissance: '',
                });
              }} className="border-gray-300 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-white">
                Annuler
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddArtiste}>
                {selectedArtiste ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de suppression */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="border-gray-200 rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900">
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer l'artiste <strong>{selectedArtiste?.kickName}</strong> ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-600 hover:text-white">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(selectedArtiste?.id)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};
