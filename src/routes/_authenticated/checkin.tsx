import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/PageHeader";
import { checkinService } from "@/services";
import { extractError } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/checkin")({
  component: CheckinPage,
});

function CheckinPage() {
  const [escalaTrabalhadorId, setId] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dispositivo] = useState(
    typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 60) : "web",
  );

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => toast.error("Não foi possível obter a localização"),
    );
  };

  const checkinMut = useMutation({
    mutationFn: () =>
      checkinService.checkin(escalaTrabalhadorId, {
        latitude: coords!.latitude,
        longitude: coords!.longitude,
        dispositivo,
      }),
    onSuccess: () => toast.success("Check-in realizado"),
    onError: (err) => toast.error(extractError(err)),
  });

  const checkoutMut = useMutation({
    mutationFn: () => checkinService.checkout(escalaTrabalhadorId),
    onSuccess: () => toast.success("Check-out realizado"),
    onError: (err) => toast.error(extractError(err)),
  });

  return (
    <div>
      <PageHeader
        title="Check-in operacional"
        description="Registro por geolocalização com dispositivo."
      />
      <div className="max-w-xl rounded-lg bg-card p-6 shadow-sm card-top-primary">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Escala-Trabalhador ID</Label>
            <Input value={escalaTrabalhadorId} onChange={(e) => setId(e.target.value)} />
          </div>
          <div>
            <Button variant="outline" onClick={capturarLocalizacao}>
              <MapPin className="mr-1 h-4 w-4" /> Capturar localização
            </Button>
            {coords && (
              <div className="mt-2 text-sm text-muted-foreground">
                Lat {coords.latitude.toFixed(5)} • Lng {coords.longitude.toFixed(5)}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Dispositivo: <span className="font-mono">{dispositivo}</span>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-success text-success-foreground hover:bg-success/90"
              disabled={!escalaTrabalhadorId || !coords || checkinMut.isPending}
              onClick={() => checkinMut.mutate()}
            >
              <LogIn className="mr-1 h-4 w-4" />
              {checkinMut.isPending ? "Enviando..." : "Check-in"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={!escalaTrabalhadorId || checkoutMut.isPending}
              onClick={() => checkoutMut.mutate()}
            >
              <LogOut className="mr-1 h-4 w-4" />
              {checkoutMut.isPending ? "Enviando..." : "Check-out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
