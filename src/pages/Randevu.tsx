import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Phone, Scissors, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { tr } from "date-fns/locale";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Service {
  id: string;
  label: string;
  price: number;
  duration: string;
  durationMinutes: number;
  note?: string;
}

const Randevu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ad: user?.user_metadata?.ad || "",
    soyad: user?.user_metadata?.soyad || "",
    telefon: user?.user_metadata?.telefon || "",
    hizmet: "",
    tarih: undefined as Date | undefined,
    saat: "",
  });

  // Dynamic data from settings API
  const [serviceTypes, setServiceTypes] = useState<Service[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<Record<string, string[]>>({});
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServiceTypes(data.services);
        if (data.timeSlots) setAllTimeSlots(data.timeSlots);
        if (data.blockedSlots) setBlockedSlots(data.blockedSlots);
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setSettingsLoading(false));
  }, []);

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        ad: user.user_metadata?.ad || prev.ad,
        soyad: user.user_metadata?.soyad || prev.soyad,
        telefon: user.user_metadata?.telefon || prev.telefon,
      }));
    }
  }, [user]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (formData.tarih) {
      fetchBookedSlots(formData.tarih);
    }
  }, [formData.tarih]);

  const fetchBookedSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/appointments?date=${formattedDate}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setBookedSlots(data?.map((item: { saat: string }) => item.saat) || []);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Get blocked slots for the selected date
  const getBlockedSlotsForDate = (date: Date | undefined): string[] => {
    if (!date) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedSlots[dateStr] || [];
  };

  const dateBlockedSlots = getBlockedSlotsForDate(formData.tarih);
  const selectedService = serviceTypes.find(s => s.id === formData.hizmet);
  const unavailableSlots = [...bookedSlots, ...dateBlockedSlots];
  const availableTimeSlots = allTimeSlots.filter(
    slot => !unavailableSlots.includes(slot)
  );

  // Calculate how many consecutive slots the selected service needs
  const selectedServiceDuration = selectedService?.durationMinutes || 60;
  const requiredSlotCount = Math.ceil(selectedServiceDuration / 60);

  // Helper: check if a slot can be selected (enough consecutive free slots from this position)
  const canSelectSlot = (time: string): boolean => {
    const startIndex = allTimeSlots.indexOf(time);
    if (startIndex === -1) return false;
    if (startIndex + requiredSlotCount > allTimeSlots.length) return false;
    for (let i = 0; i < requiredSlotCount; i++) {
      const slot = allTimeSlots[startIndex + i];
      if (unavailableSlots.includes(slot)) return false;
    }
    return true;
  };

  // Helper: get all slots that would be covered if a given slot is selected
  const getCoveredSlots = (time: string): string[] => {
    const startIndex = allTimeSlots.indexOf(time);
    if (startIndex === -1) return [];
    return allTimeSlots.slice(startIndex, startIndex + requiredSlotCount);
  };

  // The slots covered by the currently selected time
  const selectedCoveredSlots = formData.saat ? getCoveredSlots(formData.saat) : [];

  const handleSubmit = async () => {
    // Validate all fields
    if (!formData.ad || !formData.soyad || !formData.telefon || !formData.hizmet || !formData.tarih || !formData.saat) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || null,
          ad: formData.ad,
          soyad: formData.soyad,
          telefon: formData.telefon,
          hizmet: formData.hizmet,
          tarih: format(formData.tarih, 'yyyy-MM-dd'),
          saat: formData.saat,
          durationMinutes: selectedServiceDuration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast({
            title: "Hata",
            description: "Bu saat dilimi dolu. Lütfen başka bir saat seçin.",
            variant: "destructive",
          });
          // Refresh slots
          fetchBookedSlots(formData.tarih);
          setFormData({ ...formData, saat: "" });
          setIsSubmitting(false);
          return;
        }
        throw new Error(errorData.error || 'Something went wrong');
      }

      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Hata",
        description: "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-success-foreground" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">RANDEVU TALEBİ OLUŞTURULDU</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Randevu talebiniz başarıyla alındı. En kısa sürede onay durumu hakkında bilgilendirileceksiniz.
            </p>
            <div className="bg-secondary rounded-lg p-6 max-w-sm mx-auto mb-8">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İsim:</span>
                  <span className="font-medium">{formData.ad} {formData.soyad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hizmet:</span>
                  <span className="font-medium">
                    {selectedService?.label}
                  </span>
                </div>
                {selectedService && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ücret:</span>
                    <span className="font-medium">{selectedService.price.toLocaleString('tr-TR')}₺</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarih:</span>
                  <span className="font-medium">
                    {formData.tarih && format(formData.tarih, "d MMMM yyyy", { locale: tr })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saat:</span>
                  <span className="font-medium">
                    {requiredSlotCount > 1 && selectedCoveredSlots.length > 0
                      ? `${formData.saat} - ${(parseInt(selectedCoveredSlots[selectedCoveredSlots.length - 1]) + 1).toString().padStart(2, '0') + ':00'}`
                      : formData.saat
                    }
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate("/")} variant="outline">
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (settingsLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-4xl md:text-5xl mb-4">RANDEVU AL</h1>
            <p className="text-muted-foreground">
              Birkaç adımda randevunuzu oluşturun.
            </p>
          </div>


          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-display text-lg transition-all",
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={cn(
                      "w-12 md:w-20 h-0.5 mx-2",
                      step > s ? "bg-primary" : "bg-secondary"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-lg mx-auto">
            {/* Steps Content */}
            <>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="animate-slide-up space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                    <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                      <User className="w-6 h-6" />
                      KİŞİSEL BİLGİLER
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ad">Ad</Label>
                          <Input
                            id="ad"
                            placeholder="Adınız"
                            value={formData.ad}
                            onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="soyad">Soyad</Label>
                          <Input
                            id="soyad"
                            placeholder="Soyadınız"
                            value={formData.soyad}
                            onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="telefon">Telefon Numarası</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="telefon"
                            type="tel"
                            placeholder="05XX XXX XX XX"
                            className="pl-10"
                            value={formData.telefon}
                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!formData.ad || !formData.soyad || !formData.telefon}
                    onClick={() => setStep(2)}
                  >
                    Devam Et
                  </Button>
                </div>
              )}

              {/* Step 2: Service Selection */}
              {step === 2 && (
                <div className="animate-slide-up space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                    <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                      <Scissors className="w-6 h-6" />
                      HİZMET SEÇİN
                    </h2>

                    <div className="space-y-3">
                      {serviceTypes.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => setFormData({ ...formData, hizmet: service.id, saat: "" })}
                          className={cn(
                            "w-full p-4 rounded-lg border-2 text-left transition-all",
                            formData.hizmet === service.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{service.label}</span>
                              {service.note && (
                                <p className="text-xs text-muted-foreground mt-1 italic">{service.note}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-display text-lg text-primary">{service.price.toLocaleString('tr-TR')}₺</span>
                              <span className="text-xs text-muted-foreground block">{service.duration}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      Geri
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={!formData.hizmet}
                      onClick={() => setStep(3)}
                    >
                      Devam Et
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {step === 3 && (
                <div className="animate-slide-up space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
                    <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
                      <Calendar className="w-6 h-6" />
                      TARİH VE SAAT
                    </h2>

                    <div className="space-y-6">
                      {/* Date Picker */}
                      <div>
                        <Label className="mb-2 block">Tarih Seçin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.tarih && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.tarih
                                ? format(formData.tarih, "d MMMM yyyy", { locale: tr })
                                : "Tarih seçin"
                              }
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.tarih}
                              onSelect={(date) => {
                                setFormData({ ...formData, tarih: date, saat: "" });
                              }}
                              disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 40), date)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Time Selection */}
                      {formData.tarih && (
                        <div>
                          <Label className="mb-3 block">Saat Seçin</Label>
                          {loadingSlots ? (
                            <div className="text-center py-4 text-muted-foreground">
                              Müsait saatler yükleniyor...
                            </div>
                          ) : availableTimeSlots.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">
                              Bu tarihte müsait saat bulunmamaktadır. Lütfen başka bir tarih seçin.
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {allTimeSlots.map((time) => {
                                const isBooked = bookedSlots.includes(time);
                                const isBlocked = dateBlockedSlots.includes(time);
                                const isSlotUnavailable = isBooked || isBlocked;
                                const canSelect = !isSlotUnavailable && canSelectSlot(time);
                                const isSelected = formData.saat === time;
                                const isCovered = selectedCoveredSlots.includes(time) && !isSelected;
                                const isDisabled = isSlotUnavailable || !canSelect;
                                return (
                                  <button
                                    key={time}
                                    onClick={() => canSelect && setFormData({ ...formData, saat: time })}
                                    disabled={isDisabled}
                                    className={cn(
                                      "p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1",
                                      isSlotUnavailable
                                        ? "border-border bg-muted text-muted-foreground cursor-not-allowed line-through"
                                        : !canSelect
                                          ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                                          : isSelected
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : isCovered
                                              ? "border-primary/70 bg-primary/20 text-primary"
                                              : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    <Clock className="w-3 h-3" />
                                    {time}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {formData.tarih && formData.saat && (
                    <div className="bg-secondary rounded-lg p-4">
                      <h3 className="font-display text-lg mb-3">RANDEVU ÖZETİ</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">İsim:</span>
                          <span>{formData.ad} {formData.soyad}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hizmet:</span>
                          <span>{selectedService?.label}</span>
                        </div>
                        {selectedService && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ücret:</span>
                            <span className="font-medium text-primary">{selectedService.price.toLocaleString('tr-TR')}₺</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tarih:</span>
                          <span>{format(formData.tarih, "d MMMM yyyy", { locale: tr })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Saat:</span>
                          <span>
                            {requiredSlotCount > 1
                              ? `${formData.saat} - ${selectedCoveredSlots[selectedCoveredSlots.length - 1] ? (parseInt(selectedCoveredSlots[selectedCoveredSlots.length - 1]) + 1).toString().padStart(2, '0') + ':00' : formData.saat}`
                              : formData.saat
                            }
                          </span>
                        </div>
                        {requiredSlotCount > 1 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Süre:</span>
                            <span>{selectedService?.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                      Geri
                    </Button>
                    <Button
                      className="flex-1"
                      disabled={!formData.tarih || !formData.saat || isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? "Gönderiliyor..." : "Randevu Oluştur"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Randevu;
