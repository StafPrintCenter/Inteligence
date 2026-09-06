import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Invite à se connecter lorsqu'une action dépasse les limites du mode visiteur. */
export function SignInGateDialog({
  open,
  reason,
  onOpenChange,
}: {
  open: boolean;
  reason: string;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connexion requise</DialogTitle>
          <DialogDescription>{reason}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Connectez-vous à votre espace pour plus de message, l'analyse de fichiers et la génération de documents et visuels.
        </p>
        <Button onClick={() => void navigate({ to: "/login" })}>Aller à la connexion</Button>
      </DialogContent>
    </Dialog>
  );
}
