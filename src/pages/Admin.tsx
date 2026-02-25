import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Phone, Check, X, LogOut, Scissors, RefreshCw, Settings, Plus, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
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

interface Service {
  id: string;
  label: string;
  price: number;
  duration: string;
  note: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Settings state
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<Record<string, string[]>>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [blockDate, setBlockDate] = useState<Date | undefined>(undefined);
  const [blockTimeSlot, setBlockTimeSlot] = useState("");

  // Service labels map derived from settings
  const serviceLabels: Record<string, string> = {};
  services.forEach((s) => {
    serviceLabels[s.id] = s.label;
  });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/giris");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?all=true');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
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

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setServices(data.services || []);
      setTimeSlots(data.timeSlots || []);
      setBlockedSlots(data.blockedSlots || {});
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async (updatedData: { services?: Service[]; timeSlots?: string[]; blockedSlots?: Record<string, string[]> }) => {
    setSettingsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Hata",
          description: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.",
          variant: "destructive",
        });
        setSettingsSaving(false);
        return;
      }
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Settings save error:', response.status, errData);
        throw new Error(errData.error || `Sunucu hatası: ${response.status}`);
      }

      const data = await response.json();
      setServices(data.services || []);
      setTimeSlots(data.timeSlots || []);
      setBlockedSlots(data.blockedSlots || {});

      toast({ title: "Başarılı", description: "Ayarlar kaydedildi." });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSettingsSaving(false);
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

      toast({ title: "Başarılı", description: "Randevu onaylandı." });
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

      toast({ title: "Başarılı", description: "Randevu reddedildi." });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast({
        title: "Hata",
        description: "Randevu reddedilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;
    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setAppointments(appointments.filter(apt => apt.id !== id));

      toast({ title: "Başarılı", description: "Randevu silindi." });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Hata",
        description: "Randevu silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // --- Service management ---
  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = [...services];
    (updated[index] as any)[field] = value;
    setServices(updated);
  };

  const addService = () => {
    setServices([...services, {
      id: `hizmet-${Date.now()}`,
      label: "",
      price: 0,
      duration: "",
      note: ""
    }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // --- Time slot management ---
  const addTimeSlot = () => {
    if (newTimeSlot && !timeSlots.includes(newTimeSlot)) {
      const updated = [...timeSlots, newTimeSlot].sort();
      setTimeSlots(updated);
      setNewTimeSlot("");
    }
  };

  const removeTimeSlot = (slot: string) => {
    setTimeSlots(timeSlots.filter(s => s !== slot));
  };

  // --- Blocked slots management ---
  const addBlockedSlot = () => {
    if (blockDate && blockTimeSlot) {
      const dateStr = format(blockDate, 'yyyy-MM-dd');
      const updated = { ...blockedSlots };
      if (!updated[dateStr]) {
        updated[dateStr] = [];
      }
      if (!updated[dateStr].includes(blockTimeSlot)) {
        updated[dateStr] = [...updated[dateStr], blockTimeSlot].sort();
        setBlockedSlots(updated);
      }
      setBlockTimeSlot("");
    }
  };

  const removeBlockedSlot = (dateStr: string, slot: string) => {
    const updated = { ...blockedSlots };
    updated[dateStr] = updated[dateStr].filter(s => s !== slot);
    if (updated[dateStr].length === 0) {
      delete updated[dateStr];
    }
    setBlockedSlots(updated);
  };

  const pendingAppointments = appointments.filter(apt => apt.durum === "beklemede");
  const approvedAppointments = appointments
    .filter(apt => apt.durum === "onaylandi")
    .sort((a, b) => new Date(a.tarih).getTime() - new Date(b.tarih).getTime() || a.saat.localeCompare(b.saat));
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
          <div className="flex items-center gap-2 sm:flex-col">
            <Badge variant={appointment.durum === "onaylandi" ? "default" : "destructive"}>
              {appointment.durum === "onaylandi" ? "Onaylandı" : "Reddedildi"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(appointment.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
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
              <img src="/image.png" alt="Berber Logo" className="w-10 h-10 rounded-full object-cover" />
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
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
            <TabsTrigger value="ayarlar" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Ayarlar
            </TabsTrigger>
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

          {/* Settings Tab */}
          <TabsContent value="ayarlar" className="space-y-8">
            {settingsLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Ayarlar yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* Service Prices */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                  <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                    <Scissors className="w-6 h-6" />
                    HİZMET FİYATLARI
                  </h2>

                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                          <div>
                            <Label className="text-xs">Hizmet Adı</Label>
                            <Input
                              value={service.label}
                              onChange={(e) => updateService(index, 'label', e.target.value)}
                              placeholder="Hizmet adı"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Fiyat (₺)</Label>
                            <Input
                              type="number"
                              value={service.price}
                              onChange={(e) => updateService(index, 'price', Number(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Süre</Label>
                            <Input
                              value={service.duration}
                              onChange={(e) => updateService(index, 'duration', e.target.value)}
                              placeholder="~30 dk"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Not (opsiyonel)</Label>
                            <Input
                              value={service.note}
                              onChange={(e) => updateService(index, 'note', e.target.value)}
                              placeholder="Ek bilgi"
                            />
                          </div>
                          <div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeService(index)}
                              className="w-full sm:w-auto"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Sil
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" onClick={addService} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Hizmet Ekle
                    </Button>
                  </div>

                  <div className="mt-6">
                    <Button
                      onClick={() => saveSettings({ services })}
                      disabled={settingsSaving}
                      className="w-full sm:w-auto"
                    >
                      {settingsSaving ? "Kaydediliyor..." : "Fiyatları Kaydet"}
                    </Button>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                  <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                    <Clock className="w-6 h-6" />
                    RANDEVU SAATLERİ
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block text-sm font-medium">Varsayılan Saat Dilimleri</Label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {timeSlots.map((slot) => (
                          <div key={slot} className="flex items-center gap-1 bg-secondary rounded-lg px-3 py-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{slot}</span>
                            <button
                              onClick={() => removeTimeSlot(slot)}
                              className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={newTimeSlot}
                          onChange={(e) => setNewTimeSlot(e.target.value)}
                          className="w-40"
                        />
                        <Button variant="outline" size="sm" onClick={addTimeSlot}>
                          <Plus className="w-4 h-4 mr-1" />
                          Ekle
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        onClick={() => saveSettings({ timeSlots })}
                        disabled={settingsSaving}
                        className="w-full sm:w-auto"
                      >
                        {settingsSaving ? "Kaydediliyor..." : "Saatleri Kaydet"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Blocked Slots */}
                <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                  <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                    <Ban className="w-6 h-6" />
                    KAPATILAN SAATLER
                  </h2>

                  <p className="text-sm text-muted-foreground mb-4">
                    Belirli bir gün için saatleri kapatabilirsiniz. Örneğin o gün erken çıkmanız gerekiyorsa, sonraki saatleri kapatabilirsiniz.
                  </p>

                  <div className="space-y-4">
                    {/* Add blocked slot */}
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div>
                        <Label className="text-xs mb-1 block">Tarih Seçin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[200px] justify-start text-left", !blockDate && "text-muted-foreground")}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {blockDate ? format(blockDate, "d MMM yyyy", { locale: tr }) : "Tarih seçin"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={blockDate}
                              onSelect={setBlockDate}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label className="text-xs mb-1 block">Saat</Label>
                        <select
                          value={blockTimeSlot}
                          onChange={(e) => setBlockTimeSlot(e.target.value)}
                          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Saat seçin</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                      <Button variant="outline" size="sm" onClick={addBlockedSlot} disabled={!blockDate || !blockTimeSlot}>
                        <Plus className="w-4 h-4 mr-1" />
                        Kapat
                      </Button>
                    </div>

                    {/* Display blocked slots */}
                    {Object.keys(blockedSlots).length > 0 ? (
                      <div className="space-y-3 mt-4">
                        {Object.entries(blockedSlots)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([dateStr, slots]) => (
                            <div key={dateStr} className="border border-border rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-sm">
                                  {format(new Date(dateStr + 'T00:00:00'), "d MMMM yyyy", { locale: tr })}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {slots.map((slot) => (
                                  <div key={slot} className="flex items-center gap-1 bg-destructive/10 text-destructive rounded-lg px-3 py-1.5">
                                    <span className="text-xs font-medium">{slot}</span>
                                    <button
                                      onClick={() => removeBlockedSlot(dateStr, slot)}
                                      className="ml-1 hover:text-destructive/80"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Kapatılmış saat bulunmuyor.</p>
                    )}

                    <div className="mt-4">
                      <Button
                        onClick={() => saveSettings({ blockedSlots })}
                        disabled={settingsSaving}
                        className="w-full sm:w-auto"
                      >
                        {settingsSaving ? "Kaydediliyor..." : "Kapatılan Saatleri Kaydet"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
