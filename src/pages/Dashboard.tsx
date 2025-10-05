import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Plus, LogOut, Users } from 'lucide-react';
import { RadiusUserList } from '@/components/RadiusUserList';
import { CreateRadiusUserDialog } from '@/components/CreateRadiusUserDialog';

const Dashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [radiusUsers, setRadiusUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadRadiusUsers();
    }
  }, [isAdmin]);

  const loadRadiusUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('radius_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRadiusUsers(data || []);
    } catch (error) {
      console.error('Error loading RADIUS users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Portal RADIUS</h1>
              <p className="text-sm text-muted-foreground">Administración de usuarios</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardDescription>Total de usuarios</CardDescription>
              <CardTitle className="text-4xl">{radiusUsers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-lg border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardDescription>Usuarios activos</CardDescription>
              <CardTitle className="text-4xl">
                {radiusUsers.filter(u => u.is_active).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-lg border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <CardDescription>2FA habilitado</CardDescription>
              <CardTitle className="text-4xl">
                {radiusUsers.filter(u => u.totp_enabled).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>Usuarios RADIUS</CardTitle>
                  <CardDescription>
                    Gestiona usuarios con autenticación TOTP para VPN
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear usuario
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RadiusUserList 
              users={radiusUsers} 
              loading={loadingUsers}
              onRefresh={loadRadiusUsers}
            />
          </CardContent>
        </Card>
      </main>

      <CreateRadiusUserDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadRadiusUsers}
      />
    </div>
  );
};

export default Dashboard;
