import { CheckCircle, Download, Filter, Layers, Plus, RefreshCw, Search } from 'lucide-react';
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
import { Category } from '../types';

export const AdminCategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm]);

  const filterCategories = () => {
    let filtered = [...categories];

    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error('Unexpected data format:', data);
        showToast('Format de données invalide', 'error');
      }
    } catch (error: any) {
      const message = error.message || 'Impossible de charger les catégories';
      showToast(message, 'error');
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        showToast('Veuillez entrer un nom de catégorie', 'error');
        return;
      }

      await adminAPI.createCategory(newCategoryName.trim());
      
      // Récupérer les catégories avec les mises à jour complètes
      const updatedCategories = await adminAPI.getAllCategories();
      setCategories(updatedCategories);
      
      showToast('Catégorie créée avec succès', 'success');
      setShowAddDialog(false);
      setNewCategoryName('');
    } catch (error: any) {
      const message = error.message || 'Impossible de créer la catégorie';
      showToast(message, 'error');
      console.error('Erreur création catégorie:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await adminAPI.deleteCategory(selectedCategory.id);
      setCategories(
        categories.filter((c) => c.id !== selectedCategory.id)
      );
      showToast('Catégorie supprimée avec succès', 'success');
    } catch (error: any) {
      const message = error.message || 'Impossible de supprimer la catégorie';
      showToast(message, 'error');
      console.error('Erreur suppression catégorie:', error);
    } finally {
      setShowDeleteDialog(false);
      setSelectedCategory(null);
    }
  };

  const handleExport = () => {
    showToast('Export des catégories démarré', 'success');
  };

  const handleRefresh = () => {
    fetchCategories();
    showToast('Liste rafraîchie', 'success');
  };

  const columns: AdminTableColumn[] = [
    {
      header: 'Nom',
      accessor: 'nom',
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">ID: {row.id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'Aucune description'}</span>
      ),
    },
    {
      header: 'Événements',
      accessor: 'eventCount',
      render: (value: number) => (
        <Badge className="bg-gray-100 text-gray-700">
          {value || 0} événements
        </Badge>
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
            <p className="mt-4 text-lg font-medium text-gray-700">Chargement des catégories...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
              <p className="text-gray-600 mt-2">
                Gérez {categories.length} catégorie{categories.length !== 1 ? 's' : ''} d'événements
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
                Nouvelle Catégorie
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6 border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                {filteredCategories.length} catégorie{filteredCategories.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de catégories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-100">
                  <Layers className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Catégories actives</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau */}
        <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-900">Liste des Catégories</CardTitle>
            <CardDescription className="text-gray-600">
              Gérez toutes les catégories d'événements de votre plateforme
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <AdminTable
              columns={columns}
              data={filteredCategories}
              onEdit={(category) => {
                setSelectedCategory(category);
                setShowAddDialog(true);
              }}
              onDelete={(category) => {
                setSelectedCategory(category);
                setShowDeleteDialog(true);
              }}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Add Category Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-white rounded-lg border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-2xl font-bold">
                {selectedCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nom de la catégorie"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="text-gray-900 bg-white border-gray-300 rounded-lg placeholder:text-gray-500"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddDialog(false);
                setSelectedCategory(null);
                setNewCategoryName('');
              }} className="border-gray-300 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-white rounded-lg">
                Annuler
              </Button>
              <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                {selectedCategory ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white rounded-lg border border-gray-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 text-2xl font-bold">Supprimer la catégorie ?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer "<span className="font-semibold">{selectedCategory?.nom}</span>" ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="border-gray-300 text-gray-900 bg-gray-100 hover:bg-gray-600 hover:text-white rounded-lg" onClick={() => {
                setShowDeleteDialog(false);
                setSelectedCategory(null);
              }}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-lg">
                Supprimer
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};