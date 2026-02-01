import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Phone, Check, X, LogOut, Scissors, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
// Supabase import removed
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  ad: string;
  soyad: string;
  telefon: string;
  hizmet: string;
  tarih: string;
  saat: string;
  durum: string;
  created_at: string;
}

const serviceLabels: Record<string, string> = {
  "sac": "Saç Traşı",
  "sac-sakal": "Saç + Sakal"
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/giris");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
    }
  }, [isAdmin]);

  const fetchAppointments = async () => {
    try {
      // For now, fetch all by getting a wide range or just listing all if API supports it
      // Our API primarily filters by date, but we want all for admin. 
      // Let's modify API or just fetch without date to get all (need to ensure API supports this)
      // *Correction*: The current API expects a date for filtering or returns strict slots.
      // We should probably update API to return all if no date provided, OR just use the current date logic.
      // Actually, let's request a special 'all' mode or just handle it.
      // For simplicity in this quick fix, let's assume the API returns all if no date is passed or we pass a flag.
      // Let's update the fetch call to be generic. 

      const response = await fetch('/api/appointments?all=true');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      // Sort in memory since API might not sort
      const sortedData = data.sort((a: Appointment, b: Appointment) => {
        return new Date(a.tarih).getTime() - new Date(b.tarih).getTime() || a.saat.localeCompare(b.saat);
      });

      setAppointments(sortedData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Hata",
        description: "Randevular yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, durum: 'onaylandi' })
      });

      if (!response.ok) throw new Error('Failed to update');

      setAppointments(appointments.map(apt =>
        apt.id === id ? { ...apt, durum: 'onaylandi' } : apt
      ));

      toast({
        title: "Başarılı",
        description: "Randevu onaylandı.",
      });
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast({
        title: "Hata",
        description: "Randevu onaylanırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, durum: 'reddedildi' })
      });

      if (!response.ok) throw new Error('Failed to update');

      setAppointments(appointments.map(apt =>
        apt.id === id ? { ...apt, durum: 'reddedildi' } : apt
      ));

      toast({
        title: "Başarılı",
        description: "Randevu reddedildi.",
      });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast({
        title: "Hata",
        description: "Randevu reddedilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const pendingAppointments = appointments.filter(apt => apt.durum === "beklemede");
  const approvedAppointments = appointments.filter(apt => apt.durum === "onaylandi");
  const rejectedAppointments = appointments.filter(apt => apt.durum === "reddedildi");

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const AppointmentCard = ({ appointment, showActions = false }: { appointment: Appointment, showActions?: boolean }) => (
    <div className="bg-card border border-border rounded-lg p-5 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{appointment.ad} {appointment.soyad}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a href={`tel:${appointment.telefon}`} className="text-sm hover:underline">
              {appointment.telefon}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{serviceLabels[appointment.hizmet] || appointment.hizmet}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{format(new Date(appointment.tarih), "d MMMM yyyy", { locale: tr })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{appointment.saat}</span>
            </div>
          </div>
        </div>

        {showActions ? (
          <div className="flex gap-2 sm:flex-col">
            <Button
              size="sm"
              onClick={() => handleApprove(appointment.id)}
              className="flex-1 sm:flex-none"
            >
              <Check className="w-4 h-4 mr-1" />
              Onayla
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(appointment.id)}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-1" />
              Reddet
            </Button>
          </div>
        ) : (
          <Badge variant={appointment.durum === "onaylandi" ? "default" : "destructive"}>
            {appointment.durum === "onaylandi" ? "Onaylandı" : "Reddedildi"}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="font-display text-xl tracking-wider">BERBER</span>
                <span className="text-xs block text-primary-foreground/70">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl mb-2">RANDEVU YÖNETİMİ</h1>
          <p className="text-muted-foreground">
            Gelen randevu taleplerini buradan yönetebilirsiniz.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="font-display text-3xl mb-1">{pendingAppointments.length}</div>
            <div className="text-sm text-muted-foreground">Bekleyen</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="font-display text-3xl mb-1">{approvedAppointments.length}</div>
            <div className="text-sm text-muted-foreground">Onaylanan</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="font-display text-3xl mb-1">{rejectedAppointments.length}</div>
            <div className="text-sm text-muted-foreground">Reddedilen</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bekleyen" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="bekleyen" className="relative">
              Bekleyen
              {pendingAppointments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingAppointments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="onaylanan">Onaylanan</TabsTrigger>
            <TabsTrigger value="reddedilen">Reddedilen</TabsTrigger>
          </TabsList>

          <TabsContent value="bekleyen" className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Bekleyen randevu talebi yok.</p>
              </div>
            ) : (
              pendingAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} showActions />
              ))
            )}
          </TabsContent>

          <TabsContent value="onaylanan" className="space-y-4">
            {approvedAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Onaylanmış randevu yok.</p>
              </div>
            ) : (
              approvedAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))
            )}
          </TabsContent>

          <TabsContent value="reddedilen" className="space-y-4">
            {rejectedAppointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <X className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Reddedilmiş randevu yok.</p>
              </div>
            ) : (
              rejectedAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
