import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SpcDeskLogo } from "@/components/spc/SpcLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn } from "@/lib/spc/store";
import { SPACE_LABELS, type SpaceId } from "@/lib/spc/types";
import { SITE } from "@/data/site";

const PAGE_TITLE = `Conversation · SPC Intelligence`;
const PAGE_DESC = `Conversation avec SPC Intelligence, l'assistant IA de l'écosystème ${SITE.name}.`;

export const Route = createFileRoute("/login-remove-for-security-question-dont-apparear-easyly-in-public-file")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
    ],
  }),
  component: LoginPage,
});

const TABS: { id: SpaceId; label: string }[] = [
  { id: "client", label: "Client" },
  { id: "apprenant", label: "Apprenant" },
  { id: "formateur", label: "Formateur" },
];

/** Phrase de passe administrateur (3 mots, ordre imposé). */
const ADMIN_WORDS = ["securité", "principale", "concerné"];

function LoginPage() {
  const navigate = useNavigate();
  const [space, setSpace] = useState<SpaceId>("client");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const locked = attempts >= 3;

  const unlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    const words = phrase.trim().toLowerCase().split(/\s+/);
    const ok =
      words.length === ADMIN_WORDS.length && words.every((w, i) => w === ADMIN_WORDS[i]);
    if (!ok) {
      const next = attempts + 1;
      setAttempts(next);
      toast.error(
        next >= 3
          ? "Trop de tentatives — accès administrateur bloqué. Rechargez la page."
          : `Phrase de sécurité incorrecte (${3 - next} tentative(s) restante(s)).`,
      );
      return;
    }
    setAdminUnlocked(true);
    setAdminOpen(false);
    setPhrase("");
    setSpace("admin");
    toast.success("Espace Administrateur déverrouillé");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      toast.error("Email valide et mot de passe (4 caractères min.) requis.");
      return;
    }
    if (space === "admin" && !adminUnlocked) {
      toast.error("Espace Administrateur verrouillé.");
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
          <SpcDeskLogo className="h-12 w-auto" />
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
          </form>

          {!adminUnlocked && (
            <div className="rounded-2xl border border-dashed border-border p-4">
              {adminOpen ? (
                <form onSubmit={unlockAdmin} className="space-y-2">
                  <Label htmlFor="phrase" className="text-xs">
                    Phrase de sécurité administrateur (3 mots séparés par des espaces)
                  </Label>
                  <Input
                    id="phrase"
                    autoComplete="off"
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder="mot1 mot2 mot3"
                    disabled={locked}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={locked}>
                      <Lock className="size-3" /> Déverrouiller
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setAdminOpen(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {locked
                      ? "Accès bloqué après 3 tentatives. Rechargez la page."
                      : `Tentatives restantes : ${3 - attempts}`}
                  </p>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdminOpen(true)}
                  className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Lock className="size-3" /> Accès Espace Administrateur
                </button>
              )}
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
