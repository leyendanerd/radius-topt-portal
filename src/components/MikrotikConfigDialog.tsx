import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MikrotikConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MikrotikConfigDialog = ({ open, onOpenChange }: MikrotikConfigDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          server_ip: data.server_ip,
          server_port: data.server_port.toString(),
          shared_secret: data.shared_secret,
          service: data.service,
        });
      }
    } catch (error: any) {
      console.error('Error loading config:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existing } = await supabase
        .from('radius_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('radius_config')
          .update({
            server_ip: formData.server_ip,
            server_port: parseInt(formData.server_port),
            shared_secret: formData.shared_secret,
            service: formData.service,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('radius_config')
          .insert({
            server_ip: formData.server_ip,
            server_port: parseInt(formData.server_port),
            shared_secret: formData.shared_secret,
            service: formData.service,
          });

        if (error) throw error;
      }

      toast({
        title: '¡Configuración guardada!',
        description: 'La configuración RADIUS ha sido actualizada',
      });

      onOpenChange(false);
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

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración RADIUS - Mikrotik</DialogTitle>
          <DialogDescription>
            Configura la conexión RADIUS y obtén los comandos para Mikrotik
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server_ip">IP del servidor RADIUS</Label>
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
              value={formData.server_port}
              onChange={(e) => setFormData({ ...formData, server_port: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shared_secret">Secret compartido</Label>
            <Input
              id="shared_secret"
              type="password"
              value={formData.shared_secret}
              onChange={(e) => setFormData({ ...formData, shared_secret: e.target.value })}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Servicio</Label>
            <Select value={formData.service} onValueChange={(value) => setFormData({ ...formData, service: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotspot">Hotspot</SelectItem>
                <SelectItem value="ppp">PPP/VPN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </form>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comando Mikrotik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted p-2 rounded text-sm overflow-x-auto">
                /radius add address={formData.server_ip || '<IP>'} secret={formData.shared_secret || '<SECRET>'} service={formData.service}
              </code>
              <Button size="sm" variant="ghost" onClick={() => copyCommand(`/radius add address=${formData.server_ip} secret=${formData.shared_secret} service=${formData.service}`)}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
