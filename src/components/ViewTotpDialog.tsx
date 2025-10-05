import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ViewTotpDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewTotpDialog = ({ user, open, onOpenChange }: ViewTotpDialogProps) => {
  const { toast } = useToast();
  const totpUri = `otpauth://totp/RADIUS:${user.username}?secret=${user.totp_secret}&issuer=RADIUS-VPN`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: `${label} copiado al portapapeles`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuración TOTP - {user.username}</DialogTitle>
          <DialogDescription>
            Escanea el código QR con Google Authenticator o ingresa el secreto manualmente
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <QRCodeSVG 
                    value={totpUri}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Escanea con Google Authenticator
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <Label>Secreto TOTP</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={user.totp_secret} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(user.totp_secret, 'Secreto')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Usuario</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  value={user.username} 
                  readOnly 
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(user.username, 'Usuario')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2 text-sm">Instrucciones de configuración:</h4>
                <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Descarga Google Authenticator en tu dispositivo</li>
                  <li>Escanea el código QR o ingresa el secreto manualmente</li>
                  <li>El código cambiará cada 30 segundos</li>
                  <li>Usa el código junto con tu contraseña para autenticarte en la VPN</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
