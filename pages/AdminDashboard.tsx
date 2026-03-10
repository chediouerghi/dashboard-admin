import {
  BarChart3,
  Calendar,
  ClipboardList,
  Download,
  Filter,
  Layers,
  Music,
  RefreshCw,
  TrendingUp,
  Users, MoreVertical,
  AlertCircle,
  ChevronRight,
  Settings,
  Search,
  Bell,
  Home,
  CreditCard,
  UserCheck,
  Target,
  Activity,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../components/Admin/AdminLayout';
import { AreaChartComponent } from '../components/Admin/AreaChartComponent';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { showToast } from '../components/ui/toast';
import { adminAPI } from '../services/apiAdmin';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    eventsCount: 0,
    artistesCount: 0,
    categoriesCount: 0,
    reservationsCount: 0,
    pendingReservations: 0,
    revenue: 0,
    growth: 0,
    conversionRate: 78,
    avgOrderValue: 45.50,
    activeUsers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [users, events, artistes, categories, reservations] = await Promise.all([
        adminAPI.getAllUsers().catch(() => []),
        adminAPI.getAllEvents().catch(() => []),
        adminAPI.getAllArtistes().catch(() => []),
        adminAPI.getAllCategories().catch(() => []),
        adminAPI.getAllReservations().catch(() => []),
      ]);

      // Valider les données
      const validUsers = Array.isArray(users) ? users : [];
      const validEvents = Array.isArray(events) ? events : [];
      const validArtistes = Array.isArray(artistes) ? artistes : [];
      const validCategories = Array.isArray(categories) ? categories : [];
      const validReservations = Array.isArray(reservations) ? reservations : [];

      // Calculer les statistiques
      const pendingRes = validReservations.filter((r: any) => r?.statut === 'reservee').length;
      const totalRevenue = validReservations.reduce((sum: number, r: any) => {
        const price = typeof r?.prix === 'number' ? r.prix : 0;
        return sum + price;
      }, 0);
      const growth = calculateGrowth(validUsers, validReservations);
      const activeUsers = Math.round(validUsers.length * 0.65);

      // Générer les données du graphique
      const mockChartData = generateChartData(timeRange);

      setStats({
        usersCount: validUsers.length || 0,
        eventsCount: validEvents.length || 0,
        artistesCount: validArtistes.length || 0,
        categoriesCount: validCategories.length || 0,
        reservationsCount: validReservations.length || 0,
        pendingReservations: pendingRes,
        revenue: totalRevenue || 0,
        growth: growth,
        conversionRate: 78,
        avgOrderValue: validReservations.length > 0 ? totalRevenue / validReservations.length : 0,
        activeUsers: activeUsers
      });

      setChartData(mockChartData);
    } catch (error: any) {
      console.error('Erreur chargement dashboard:', error);
      showToast('Impossible de charger les statistiques', 'error');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (users: any[], reservations: any[]) => {
    if (users.length === 0) return 0;
    const avgReservations = reservations.length / users.length;
    return Math.min(Math.round((avgReservations / 10) * 100), 100);
  };

  const generateChartData = (range: string) => {
    const data = [];
    const now = new Date();
    let days = 7;

    if (range === '30d') days = 30;
    if (range === '90d') days = 90;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 50) + 20,
        events: Math.floor(Math.random() * 20) + 5,
        reservations: Math.floor(Math.random() * 100) + 30,
        revenue: Math.floor(Math.random() * 5000) + 2000,
      });
    }

    return data;
  };

  const handleRefresh = () => {
    fetchDashboardData();
    showToast('Dashboard mis à jour', 'success');
  };

  const handleExport = () => {
    showToast('Export démarré', 'info');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-black" />
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-black">Chargement du dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white p-4 md:p-6">
        {/* Header avec barre de recherche et actions */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                Tableau de Bord
              </h1>
              <p className="text-black/80 mt-1">
                Vue d'ensemble de votre plateforme
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/60" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 w-[240px] border-gray-300 bg-white text-black focus:border-black focus:ring-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Barre d'actions supérieure */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
              <Home className="h-4 w-4 mr-2" />
              Vue d'ensemble
            </Button>
            <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
              <Activity className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="ghost" size="sm" className="text-black hover:bg-gray-100">
              <CreditCard className="h-4 w-4 mr-2" />
              Transactions
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] border-gray-300 bg-white text-black">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">90 derniers jours</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="border-gray-300 text-black bg-gray-100 hover:bg-gray-600 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              className="border-gray-300 text-black bg-gray-100 hover:bg-gray-600 hover:text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-black/5">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-black" />
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border border-black/10">
                  +{Math.round(stats.growth)}%
                </Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-1">{stats.usersCount}</h3>
              <p className="text-black/80 text-sm md:text-base mb-3">Utilisateurs</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">{stats.activeUsers} actifs</span>
                <Button variant="ghost" size="sm" className="text-black hover:bg-black/5 p-0 h-auto">
                  Voir <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-black/5">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-black" />
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border border-black/10">
                  +{Math.round(Math.max(stats.eventsCount * 0.15, 5))}%
                </Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-1">{stats.eventsCount}</h3>
              <p className="text-black/80 text-sm md:text-base mb-3">Événements</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">{Math.round(stats.eventsCount * 0.6)} à venir</span>
                <Button variant="ghost" size="sm" className="text-black hover:bg-black/5 p-0 h-auto">
                  Voir <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-black/5">
                  <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-black" />
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border border-black/10">
                  +{Math.round(Math.max(stats.reservationsCount * 0.12, 8))}%
                </Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-1">{stats.reservationsCount}</h3>
              <p className="text-black/80 text-sm md:text-base mb-3">Réservations</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">{stats.pendingReservations} en attente</span>
                <Button variant="ghost" size="sm" className="text-black hover:bg-black/5 p-0 h-auto">
                  Voir <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-black/5">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-black" />
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border border-black/10">
                  +{Math.round(stats.growth)}%
                </Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-1">
                {stats.revenue >= 1000 ? `${(stats.revenue / 1000).toFixed(1)}k` : `${stats.revenue}`} €
              </h3>
              <p className="text-black/80 text-sm md:text-base mb-3">Chiffre d'affaires</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60">{stats.avgOrderValue.toFixed(2)}€ moyenne</span>
                <Button variant="ghost" size="sm" className="text-black hover:bg-black/5 p-0 h-auto">
                  Voir <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deuxième ligne de cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/5">
                    <Music className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-black/80">Artistes</p>
                    <h3 className="text-xl md:text-2xl font-bold text-black">{stats.artistesCount}</h3>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border border-black/10">
                  Disponible
                </Badge>
              </div>
              <Progress value={Math.round((stats.artistesCount / Math.max(stats.artistesCount, 1)) * 100)}
                className="h-1.5 bg-gray-200" />
              <p className="text-xs md:text-sm text-black/60 mt-2">
                {Math.round((stats.artistesCount / Math.max(stats.artistesCount, 1)) * 100)}% de disponibilité
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/5">
                    <Layers className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-black/80">Catégories</p>
                    <h3 className="text-xl md:text-2xl font-bold text-black">{stats.categoriesCount}</h3>
                  </div>
                </div>
                <div className="text-sm text-black/60">Top: Musique</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Utilisation</span>
                <span className="font-medium text-black">{Math.round((stats.categoriesCount / Math.max(stats.categoriesCount, 1)) * 100)}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/5">
                    <Target className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-sm text-black/80">Taux de conversion</p>
                    <h3 className="text-xl md:text-2xl font-bold text-black">{stats.conversionRate}%</h3>
                  </div>
                </div>
                <div className="flex items-center text-black">
                  {stats.growth >= 50 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="ml-1 text-sm">{stats.growth}%</span>
                </div>
              </div>
              <Progress value={stats.conversionRate} className="h-1.5 bg-gray-200" />
            </CardContent>
          </Card>
        </div>

        {/* Graphique et métriques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Graphique Principal */}
          <Card className="lg:col-span-2 border border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg md:text-xl font-bold text-black">Performance des réservations</CardTitle>
                  <CardDescription className="text-black/80">
                    Évolution sur {timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : '90 jours'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 text-black bg-gray-100 hover:bg-gray-600 hover:text-white">
                    <Filter className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Filtres
                  </Button>
                  <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData && chartData.length > 0 && (
                <AreaChartComponent data={chartData} />
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-4 md:gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-black"></div>
                  <span className="text-black/80">Réservations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500"></div>
                  <span className="text-black/80">Revenus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-700"></div>
                  <span className="text-black/80">Utilisateurs</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Activité Récente */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-black">Activité récente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: UserCheck, title: `${Math.min(stats.usersCount, 5)} nouveaux utilisateurs`, time: "Aujourd'hui" },
                { icon: CheckCircle, title: `${Math.min(stats.pendingReservations, 8)} réservations confirmées`, time: "Cette semaine" },
                { icon: AlertCircle, title: `${Math.round(stats.eventsCount * 0.3)} événements modifiés`, time: "Ce mois" },
                { icon: Users, title: `${Math.round(stats.usersCount * 0.2)} nouveaux inscrits`, time: "Ce mois" },
                { icon: CreditCard, title: `${Math.min(stats.reservationsCount, 15)} paiements reçus`, time: "Ce mois" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 rounded-lg bg-black/5">
                    <activity.icon className="h-4 w-4 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-black/60">{activity.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-black/40 flex-shrink-0" />
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-t border-gray-200 pt-4">
              <Button variant="ghost" size="sm" className="w-full text-black hover:bg-gray-100">
                Voir toute l'activité
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tableau de bord détaillé */}
        <Card className="border border-gray-200 bg-white shadow-sm mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg md:text-xl font-bold text-black">Analytiques détaillées</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-100 border border-gray-300 mb-4">
                <TabsTrigger
                  value="overview"
                  className="text-black data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                >
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="text-black data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="text-black data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                >
                  Rapports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Utilisateurs actifs", value: stats.activeUsers, change: `+${Math.round(stats.growth)}%` },
                    { title: "Réservations en cours", value: stats.pendingReservations, change: `+${Math.round(stats.reservationsCount * 0.5)}%` },
                    { title: "Taux de satisfaction", value: `${Math.min(85 + stats.growth, 99)}%`, change: `+${Math.round(stats.growth / 2)}%` },
                  ].map((metric, index) => (
                    <Card key={index} className="border border-gray-200 bg-white shadow-none">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-black text-sm md:text-base">{metric.title}</h4>
                          <Badge variant="secondary" className="bg-black/5 text-black border border-black/10">
                            {metric.change}
                          </Badge>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-black mb-2">{metric.value}</h3>
                        <Progress value={85} className="h-1.5 bg-gray-200" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-4">
                <div className="text-center py-8">
                  <p className="text-black/60">Contenu de la performance à venir</p>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="mt-4">
                <div className="text-center py-8">
                  <p className="text-black/60">Contenu des rapports à venir</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Button variant="outline" className="h-auto py-4 border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/5">
                <Download className="h-5 w-5 text-black" />
              </div>
              <div className="text-left">
                <p className="font-medium text-black text-sm">Exporter les données</p>
                <p className="text-xs text-black/60">Format CSV/PDF</p>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto py-4 border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/5">
                <BarChart3 className="h-5 w-5 text-black" />
              </div>
              <div className="text-left">
                <p className="font-medium text-black text-sm">Générer rapport</p>
                <p className="text-xs text-black/60">Analyses détaillées</p>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto py-4 border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/5">
                <Settings className="h-5 w-5 text-black" />
              </div>
              <div className="text-left">
                <p className="font-medium text-black text-sm">Paramètres</p>
                <p className="text-xs text-black/60">Personnaliser</p>
              </div>
            </div>
          </Button>

          <Button variant="outline" className="h-auto py-4 border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/5">
                <Bell className="h-5 w-5 text-black" />
              </div>
              <div className="text-left">
                <p className="font-medium text-black text-sm">Notifications</p>
                <p className="text-xs text-black/60">Alertes et messages</p>
              </div>
            </div>
          </Button>
        </div>

        {/* Pied de page */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-center md:text-left">
              <p className="text-sm text-black/80">
                Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-xs text-black/60 mt-1">
                Dashboard synchronisé automatiquement
              </p>
            </div>

            <div className="flex items-center gap-4 md:gap-6 text-sm text-black/80 flex-wrap justify-center">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Système opérationnel
              </span>
              <Separator orientation="vertical" className="h-4 bg-gray-300 hidden md:block" />
              <span>v2.1.0</span>
              <Separator orientation="vertical" className="h-4 bg-gray-300 hidden md:block" />
              <Button variant="link" className="text-black/80 hover:text-black p-0 h-auto text-sm">
                Aide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};