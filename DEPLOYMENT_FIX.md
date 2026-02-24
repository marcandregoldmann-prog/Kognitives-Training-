# 🚨 WICHTIG: Manuelle Einstellung erforderlich!

Die Code-Änderungen wurden erfolgreich durchgeführt, aber damit die Website funktioniert, **muss** eine Einstellung in deinem GitHub-Repository geändert werden.

Der Fehler `Failed to load resource: .../src/main.tsx` erscheint, weil GitHub versucht, den Quellcode zu laden, anstatt die fertige Anwendung (Artifact) zu verwenden.

## Bitte folge diesen Schritten genau:

1. Gehe zu deinem Repository auf GitHub.
2. Klicke oben auf den Reiter **Settings** (Einstellungen).
3. Wähle im linken Menü den Punkt **Pages** aus.
4. Suche den Abschnitt **"Build and deployment"**.
5. Ändere die Einstellung unter **Source** von `Deploy from a branch` auf **`GitHub Actions`**.

   > **Hinweis:** Wenn du diese Einstellung änderst, übernimmt die `deploy.yml`-Datei, die ich bereits hinzugefügt habe, automatisch das Bauen und Veröffentlichen der Seite.

6. Warte ein paar Minuten (ca. 2-3 Minuten), bis die GitHub Action durchgelaufen ist.
7. Lade deine Website neu. (Ggf. Cache leeren, falls nötig).

Das war's! Sobald diese Einstellung geändert ist, sollte die Seite korrekt laden.
