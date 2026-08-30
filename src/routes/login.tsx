import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "@/lib/spc/store";
import { SPACE_LABELS, type SpaceId } from "@/lib/spc/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — SPC Intelligence | STAF PRINT CENTER" },
      {
        name: "description",
        content:
          "Connectez-vous à SPC Intelligence selon votre espace : Client, Apprenant, Formateur ou Administrateur.",
      },
      { property: "og:title", content: "Connexion — SPC Intelligence" },
      {
        property: "og:description",
        content: "Accédez à l'assistant IA de l'écosystème STAF PRINT CENTER.",
      },
    ],
  }),
  component: LoginPage,
});

const TABS: { id: SpaceId; label: string }[] = [
  { id: "client", label: "Client" },
  { id: "apprenant", label: "Apprenant" },
  { id: "formateur", label: "Formateur" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [space, setSpace] = useState<SpaceId>("client");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setAdminUnlocked(true);
        setSpace("admin");
        toast.success("Espace Administrateur déverrouillé");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      toast.error("Email valide et mot de passe (4 caractères min.) requis.");
      return;
    }
    const user = signIn(email, space);
    toast.success(`Bienvenue ${user.name} — ${user.space}`);
    void navigate({ to: "/" });
  };

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
            S
          </span>
          <div>
            <p className="text-lg font-bold">SPC Intelligence</p>
            <p className="text-sm text-muted-foreground">ai.stafprint.com</p>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black leading-tight">
            L'assistant IA de l'écosystème <span className="text-primary">STAF PRINT CENTER</span>
          </h1>
          <p className="max-w-md text-muted-foreground">
            Analyse de documents, génération de visuels et de contenus, accompagnement des clients,
            apprenants et formateurs — le tout dans une seule conversation.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          <ShieldCheck className="mr-1 inline size-4 text-primary" />
          Connexion en mode simulation — aucune donnée réelle n'est transmise.
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <Button variant="ghost" size="sm" onClick={() => void navigate({ to: "/" })}>
            <ArrowLeft className="size-4" /> Retour au chat public
          </Button>

          <div>
            <h2 className="text-2xl font-bold">Connexion aux Espaces</h2>
            <p className="text-sm text-muted-foreground">
              Accès réservé aux membres de la communauté SPC.
            </p>
          </div>

          <Tabs value={space} onValueChange={(v) => setSpace(v as SpaceId)}>
            <TabsList className="w-full">
              {TABS.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="flex-1">
                  {t.label}
                </TabsTrigger>
              ))}
              {adminUnlocked && (
                <TabsTrigger value="admin" className="flex-1">
                  <Lock className="size-3" /> Admin
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {space === "admin" && adminUnlocked ? (
            <form
              onSubmit={submitAdmin}
              className="space-y-4 rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-sm font-semibold text-primary">{SPACE_LABELS[space]}</p>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stafprint.com"
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
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Se connecter en Administrateur
              </Button>
            </form>
          ) : (
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Clock className="size-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Accès en Bêta Fermée</h3>
                <p className="text-sm text-muted-foreground">
                  Les connexions pour l'espace{" "}
                  <span className="font-medium text-foreground">{SPACE_LABELS[space]}</span> sont
                  temporairement désactivées. La plateforme est actuellement en phase de test.
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                Le chat public reste 100% accessible avec vos 3 messages gratuits quotidiens.
              </div>

              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => void navigate({ to: "/" })}
              >
                Continuer sur le Chat Public
              </Button>

              {/* {!adminUnlocked && (
                <p className="text-xs text-muted-foreground/60 pt-2">
                  <kbd className="rounded border bg-muted px-1">Ctrl</kbd> +{" "}
                  <kbd className="rounded border bg-muted px-1">Shift</kbd> +{" "}
                  <kbd className="rounded border bg-muted px-1">A</kbd>
                </p>
              )} */}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
