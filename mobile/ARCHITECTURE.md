# Mobile app architecture

## Scope of this release

The mobile build packages the existing text game as an Android app. The web/PWA release remains available and shares the same game runtime and game content. This release changes packaging and build infrastructure only; visual redesign, animations, and gameplay changes are deferred.

## Runtime layers

1. **Platform shell — Capacitor 8**  
   Android WebView hosts the app. The package opens local files bundled in the APK; it does not load the live GitHub Pages site as its game runtime.
2. **Shared text game — existing web runtime**  
   The same HTML, JavaScript modules, game data, and text-first interface are used by Android and the web/PWA build.
3. **Local save — existing storage layer**  
   Saves stay on the player's device in IndexedDB, with the current localStorage fallback. Android and the browser have separate storage origins. Use the in-game save export/import flow to move a save between them.
4. **Build and delivery**  
   `scripts/build-mobile.mjs` stages only runtime files into `dist/`. Capacitor packages `dist/` into an Android app. GitHub Actions builds and stores an installable debug APK artifact. The existing Pages workflow continues to deploy the web/PWA version.

## Build locally

Requirements: Node.js 22, Java 21, Android SDK, and Android platform tools.

```sh
npm install
npm run build:mobile
npx cap add android
npm run cap:sync:android
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Debug APKs are for device testing; store distribution and release signing are not part of this architecture milestone.

## Release boundary

A later release can add native back-button/lifecycle behavior, save migration helpers, a signed release pipeline, and platform-specific polish. No animation or art changes are included in this release.
