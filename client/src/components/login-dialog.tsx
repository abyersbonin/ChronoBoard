import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut } from "lucide-react";

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { isLoggedIn, login, logout, isLoggingIn, isLoggingOut, loginError } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { username, password },
      {
        onSuccess: () => {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue administrateur",
          });
          setOpen(false);
          setUsername("");
          setPassword("");
        },
        onError: () => {
          toast({
            title: "Erreur de connexion",
            description: "Nom d'utilisateur ou mot de passe incorrect",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt!",
        });
      },
    });
  };

  if (isLoggedIn) {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="outline"
        size="sm"
        className="text-white border-white/30 hover:bg-white/20"
        style={{ 
          backgroundColor: 'rgba(120, 140, 107, 0.3)',
          borderColor: 'rgba(214, 204, 194, 0.4)'
        }}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Déconnexion
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-white border-white/30 hover:bg-white/20"
          style={{ 
            backgroundColor: 'rgba(120, 140, 107, 0.3)',
            borderColor: 'rgba(214, 204, 194, 0.4)'
          }}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Connexion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connexion Administrateur</DialogTitle>
          <DialogDescription>
            Entrez vos identifiants pour accéder aux paramètres administrateur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-600">
              Erreur de connexion. Vérifiez vos identifiants.
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}