import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Clock, Mail, Phone, ShieldCheck } from "lucide-react";
import { CguLayout } from "@/components/site/cguLayout";
import { SITE, SITE_LINK } from "@/data/site";
import { stripProtocol } from "@/lib/domain";

const PAGE_TITLE = `Conditions Générales d'Utilisation - ${SITE.tool} | ${SITE.name}`;
const PAGE_DESC = `Consultez les conditions générales d'utilisation de ${SITE.tool}, l'assistant IA officiel de ${SITE.name}.`;

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CguPage,
});

function CguPage() {
  const lastUpdated = "4 octobre 2026";

  return (
    <CguLayout>
      {/* Titre & Chapeau */}
      <div className="mb-10 space-y-3 border-b border-border/60 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="size-3.5" />
          <span>Document contractuel officiel</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Conditions Générales d'Utilisation (CGU)
        </h1>
        <p className="text-sm text-muted-foreground">
          Dernière mise à jour : {lastUpdated}
        </p>
      </div>

      {/* Corps des CGU */}
      <div className="space-y-8 text-sm leading-relaxed sm:text-base">
        {/* Article 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            1. Présentation de la plateforme et mentions légales
          </h2>
          <p className="text-muted-foreground">
            La plateforme <strong>{SITE.tool}</strong> (accessible à l'adresse{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{stripProtocol(SITE_LINK.aiUrl)}</code>) est l'assistant conversationnel officiel développé pour le compte de <strong>{SITE.name}</strong>, studio de création, d'impression et centre de formation professionnelle basé à Porto-Novo, République du Bénin.
          </p>
          <p className="text-muted-foreground">
            Ce service a pour objectif d'orienter les utilisateurs dans le choix de supports d'impression, d'estimer des besoins techniques (bâches, enseignes, papeterie, roll-up), de renseigner sur les catalogues de formation et d'analyser des documents graphiques préparatoires.
          </p>
        </section>

        {/* Article 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            2. Périmètre d'intervention strict de l'intelligence artificielle
          </h2>
          <p className="text-muted-foreground">
            L'assistant {SITE.tool} est configuré avec un périmètre d'action strictly délimité aux activités de {SITE.name} :
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Travaux d'impression, signalétique, finitions et spécifications PAO.</li>
            <li>Formations professionnelles (React, Canva, After Effects, PAO) et espaces d'apprentissage.</li>
            <li>Accompagnement digital, maquettage web et documentation technique ({stripProtocol(SITE_LINK.docsUrl)}).</li>
          </ul>
          <p className="text-muted-foreground">
            Toute sollicitation sans rapport avec les activités de {SITE.name} (politique, actualités générales, aide aux devoirs non liés au design, santé, divertissement non autorisé) sera automatiquement déclinée par l'IA.
          </p>
        </section>

        {/* Article 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            3. Accès au service et quotas d'utilisation
          </h2>
          <p className="text-muted-foreground">
            Afin de garantir une qualité de service optimale pour tous les clients et partenaires, l'accès à {SITE.tool} est soumis à des règles de quotas :
          </p>
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-card p-4">
              <div className="flex items-center gap-2 font-semibold">
                <Clock className="size-4 text-primary" />
                <span>Visiteurs anonymes</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Attribution de <strong>3 messages par jour</strong>, renouvelés quotidiennement à minuit.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-4">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4 text-primary" />
                <span>Membres connectés</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                Fenêtre glissante de <strong>6 messages par session de 3 heures</strong>. Le compteur se réinitialise 3 heures après l'envoi du premier message.
              </p>
            </div>
          </div>
        </section>

        {/* Article 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            4. Valeur non contractuelle des réponses et estimations
          </h2>
          <p className="text-muted-foreground">
            Les prix en Francs CFA (XOF), délais de fabrication (ex. 48–72h) ou conseils techniques fournis par {SITE.tool} sont communiqués à <strong>titre purement indicatif et estimatif</strong>.
          </p>
          <p className="text-muted-foreground">
            Seuls les devis formels émis par le service commercial de {SITE.name} (par email officiel à{" "}
            <a href={`mailto:${SITE.email}`} className="text-primary underline underline-offset-4">
              {SITE.email}
            </a>{" "}
            ou validés par WhatsApp officiel au{" "}
            <a href={SITE.whatsappLink} className="text-primary underline underline-offset-4">
              +229 01 60 30 06 07
            </a>
            ) engagent juridiquement l'entreprise.
          </p>
        </section>

        {/* Article 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            5. Fichiers téléversés et propriété intellectuelle
          </h2>
          <p className="text-muted-foreground">
            L'utilisateur peut téléverser des maquettes, images ou documents PDF afin d'en demander l'analyse technique.
            En envoyant un fichier, l'utilisateur certifie qu'il détient les droits de propriété intellectuelle ou les
            autorisations nécessaires sur ce document.
          </p>
          <p className="text-muted-foreground">
            {SITE.name} ne revendique aucun droit de propriété sur vos fichiers, vos logos ou les textes transmis.
            Les fichiers téléversés sont traités dans le cadre unique de votre session d'assistance.
          </p>
        </section>

        {/* Article 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            6. Protection des données et confidentialité
          </h2>
          <p className="text-muted-foreground">
            Le traitement de vos prompts respecte la confidentialité de vos projets créatifs :
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Vos conversations et historiques sont stockés localement sur votre terminal (navigateur).</li>
            <li>Les liens partagés (fonction « Partager ») contiennent une charge compressée en lecture seule accessible uniquement aux personnes disposant de l'URL complète.</li>
            <li>Aucune donnée confidentielle ou financière n'est cédée ou revendue à des tiers.</li>
          </ul>
        </section>

        {/* Article 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            7. Droit applicable et juridiction compétente
          </h2>
          <p className="text-muted-foreground">
            Les présentes Conditions Générales d'Utilisation sont régies par le droit en vigueur en{" "}
            <strong>République du Bénin</strong>. En cas de litige relatif à l'interprétation ou à l'exécution des présentes,
            une solution amiable sera recherchée en priorité avant toute action devant les juridictions compétentes de Porto-Novo ou de Cotonou.
          </p>
        </section>

        {/* Contact */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-bold text-foreground">Une question concernant nos conditions ?</h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            L'équipe STAF PRINT CENTER est à votre écoute pour toute demande d'assistance ou d'information complémentaire.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm">
            <a
              href="https://wa.me/2290160300607"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Phone className="size-4" />
              <span>WhatsApp : +229 01 60 30 06 07</span>
            </a>
            <a
              href="mailto:contact@stafprint.com"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Mail className="size-4" />
              <span>contact@stafprint.com</span>
            </a>
            <a
              href="https://docs.stafprint.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <BookOpen className="size-4" />
              <span>Documentation officielle</span>
            </a>
          </div>
        </section>
      </div>
    </CguLayout >
  );
}
