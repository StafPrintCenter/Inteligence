# Intégrer SPC Intelligence

Chargez le script une seule fois :

```html
<script src="https://ai.stafprint.com/widget.js" data-app="ecosystem-name" defer></script>
```

Après le chargement du script, transmettez uniquement le profil d'affichage du compte actif :

```js
window.SPCIntelligence.setUser(() => {
  const user = getCurrentUser(); // À adapter au site hôte
  return user ? { email: user.email, name: user.name, role: "client" } : null;
});
window.SPCIntelligence.setContext(() => ({
  title: document.title,
  text: getCurrentProjectSummary(), // À adapter ; pas de données sensibles
}));
// Après connexion, déconnexion, changement de compte ou de projet :
window.SPCIntelligence.refresh();
```

Espaces possibles : `public`, `client`, `apprenant`, `formateur`, `admin`. Ce profil local n'accorde aucun droit et ne constitue pas une authentification. L'adresse mail et l'espace identifient le même historique local que dans le chat actuel. Un retour `null` masque l'historique du compte et revient au mode public.

Les messages restent dans le stockage du domaine SPC, dans le navigateur courant ; ils ne sont jamais renvoyés au site hôte. Le widget et le chat principal partagent les conversations lorsque le navigateur leur donne accès au même stockage. Les navigateurs peuvent isoler ou bloquer le stockage d'une iframe entre plusieurs sites : ce partage n'est alors pas garanti. Transmettre un profil ne transfère pas un historique depuis un autre domaine ou appareil. Une synchronisation garantie nécessitera une vraie connexion et une sauvegarde cloud.

Ne transmettez ni mots de passe, ni jetons, ni cookies, ni copie complète du localStorage. Utilisez `setUser` explicitement plutôt que de rechercher automatiquement des clés sur le site hôte. Le chargement et les tests en ligne nécessitent de publier SPC Intelligence.