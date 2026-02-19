<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/eaea2d25-b454-4431-bb31-c82362a32ca1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## PWA-Installation auf Android (Chrome)

1. App mit HTTPS deployen (oder lokal per `npm run dev` testen).
2. In Chrome öffnen.
3. Über das 3-Punkte-Menü **"Zum Startbildschirm hinzufügen"** wählen.
4. Auf Smartphone und Tablet jeweils installieren.

Die App enthält ein Web App Manifest mit eingebetteten (nicht-binären) Icons und einen Service Worker für Offline-Caching. Es wird kein Gemini API Key benötigt.

## Fehlerbehebung bei weißem Bildschirm auf Android/Chrome

Wenn nach Updates ein weißer Bildschirm erscheint, in Chrome einmal **Website-Daten löschen** oder die App neu installieren, damit ein alter Service Worker-Cache ersetzt wird.
