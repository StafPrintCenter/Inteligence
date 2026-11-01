import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseWidgetProfile } from "./widget-profile";

describe("profil explicite du widget", () => {
  it("réutilise la clé de compte du chat principal et l'espace choisi", () => {
    const profile = parseWidgetProfile({ email: "Alice@Example.com", role: "apprenant", name: "Alice" });
    assert.equal(profile?.id, "apprenant:alice@example.com");
    assert.equal(profile?.email, "alice@example.com");
    assert.equal(profile?.space, "Espace Apprenant");
    assert.equal(profile?.name, "Alice");
  });
  it("ne copie pas les secrets du profil hôte", () => {
    const profile = parseWidgetProfile({ email: "alice@example.com", role: "client", access_token: "not-a-real-token", password: "not-a-real-password" });
    assert.ok(profile);
    assert.equal("access_token" in profile, false);
    assert.equal("password" in profile, false);
  });
  it("refuse un profil incomplet et ne crée pas un compte à la déconnexion", () => {
    assert.equal(parseWidgetProfile({ name: "Alice" }), null);
    assert.equal(parseWidgetProfile(null), null);
  });
});