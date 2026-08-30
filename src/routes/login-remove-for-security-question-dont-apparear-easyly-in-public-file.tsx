import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "@/lib/spc/store";
import { SPACE_LABELS, type SpaceId } from "@/lib/spc/types";

export const Route = createFileRoute("/login-remove-for-security-question-dont-apparear-easyly-in-public-file")({
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

  const submit = (e: React.FormEvent) => {
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
          <h1 className="text-4xl leading-tight font-black">
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
            <h2 className="text-2xl font-bold">Connexion</h2>
            <p className="text-sm text-muted-foreground">
              Choisissez votre espace puis renseignez vos identifiants.
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

          <form
            onSubmit={submit}
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
                placeholder="vous@stafprint.com"
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
              Se connecter à {SPACE_LABELS[space]}
            </Button>
            {!adminUnlocked && (
              <p className="text-center text-xs text-muted-foreground">
                Espace Administrateur : raccourci <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
