import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Users, Key } from 'lucide-react';

const Index = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-accent">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Portal RADIUS
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Gestión avanzada de usuarios VPN con autenticación 2FA
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 shadow-xl"
            >
              Acceder al portal
            </Button>
            {user && (
              <Button 
                size="lg"
                variant="outline"
                onClick={() => signOut()}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 shadow-xl"
              >
                Cerrar sesión
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Seguridad TOTP</h3>
            <p className="text-white/80">
              Autenticación de dos factores con Google Authenticator
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Gestión fácil</h3>
            <p className="text-white/80">
              Crea y administra usuarios RADIUS desde un panel intuitivo
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Compatible Mikrotik</h3>
            <p className="text-white/80">
              Diseñado para funcionar con routers Mikrotik y VPNs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
