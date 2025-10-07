import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MikrotikConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MikrotikConfigDialog = ({ open, onOpenChange }: MikrotikConfigDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    server_ip: '',
    server_port: '1812',
    shared_secret: '',
    service: 'hotspot',
  });

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('radius_config')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfig(data);
        setFormData({
          server_ip: data.server_ip,
          server_port: data.server_port.toString(),
          shared_secret: data.shared_secret,
          service: data.service,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const configData = {
        server_ip: formData.server_ip,
        server_port: parseInt(formData.server_port),
        shared_secret: formData.shared_secret,
        service: formData.service,
      };

      if (config) {
        const { error } = await supabase
          .from('radius_config')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('radius_config')
          .insert(configData);

        if (error) throw error;
      }

      toast({
        title: '¡Configuración guardada!',
        description: 'La configuración RADIUS ha sido guardada correctamente',
      });

      await loadConfig();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copiado',
      description: 'Texto copiado al portapapeles',
    });
  };

  const mikrotikCommands = config ? `
/radius
add address=${config.server_ip} secret=${config.shared_secret} service=${config.service}

/user-manager
set enabled=yes

/ip ${config.service}
set use-radius=yes
` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración Mikrotik RADIUS</DialogTitle>
          <DialogDescription>
            Configura el servidor RADIUS y obtén los comandos para Mikrotik
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="mikrotik" disabled={!config}>Comandos Mikrotik</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server_ip">IP del Servidor RADIUS</Label>
                <Input
                  id="server_ip"
                  placeholder="192.168.1.100"
                  value={formData.server_ip}
                  onChange={(e) => setFormData({ ...formData, server_ip: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="server_port">Puerto</Label>
                <Input
                  id="server_port"
                  type="number"
                  placeholder="1812"
                  value={formData.server_port}
                  onChange={(e) => setFormData({ ...formData, server_port: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shared_secret">Secreto Compartido (Shared Secret)</Label>
                <Input
                  id="shared_secret"
                  type="password"
                  placeholder="••••••••"
                  value={formData.shared_secret}
                  onChange={(e) => setFormData({ ...formData, shared_secret: e.target.value })}
                  required
                  minLength={8}
                />
                <p className="text-sm text-muted-foreground">
                  Mínimo 8 caracteres. Este secreto debe ser el mismo en Mikrotik.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Servicio</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => setFormData({ ...formData, service: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotspot">Hotspot</SelectItem>
                    <SelectItem value="ppp">PPP (VPN)</SelectItem>
                    <SelectItem value="dhcp">DHCP</SelectItem>
                    <SelectItem value="wireless">Wireless</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar configuración
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="mikrotik" className="space-y-4">
            <Alert>
              <AlertDescription>
                Copia estos comandos y ejecútalos en la terminal de tu router Mikrotik
              </AlertDescription>
            </Alert>

            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{mikrotikCommands}</code>
              </pre>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(mikrotikCommands)}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Pasos adicionales en Mikrotik:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Conecta a tu router Mikrotik vía Winbox o SSH</li>
                <li>Ve a Terminal y pega los comandos copiados</li>
                <li>Verifica la configuración en System → Users → RADIUS</li>
                <li>Prueba la autenticación con un usuario RADIUS creado</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
