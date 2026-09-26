# Mobile app architecture

## Scope of this release

The mobile build packages the existing text game as an Android app. The web/PWA release remains available and shares the same game runtime and game content. The visual design, animation, and gameplay rules remain unchanged.

## Runtime layers

1. **Platform shell — Capacitor 8**  
   Android WebView hosts the app. The package opens local files bundled in the APK; it does not load the live GitHub Pages site as its game runtime.
2. **Shared text game — existing web runtime**  
   The same HTML, JavaScript modules, game data, and text-first interface are used by Android and the web/PWA build.
3. **Local save — existing storage layer**  
   Saves stay on the player's device in IndexedDB, with the current localStorage fallback. Android and browser storage are separate. Use the in-game save export/import flow to move a save between them.
4. **Over-the-air game updates**  
   GitHub Pages publishes a versioned web bundle and `mobile/update-manifest.json`. The Android app checks the manifest at startup, downloads a newer HTML/CSS/JavaScript bundle, and activates it when the app backgrounds or starts again. A failed network check does not prevent play. The normal web/PWA page is not modified by the native updater.
5. **Native app updates**  
   Changes to native plugins, Android permissions, or other Android project code require a new APK. The OTA updater only updates the web game bundle.

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

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. Debug APKs are for device testing; store signing is not included.

## Update pipeline

```sh
npm install
npm run build:mobile
npm run build:mobile:update -- _site/mobile <git-commit-sha>
```

The Pages workflow runs the same steps after the web game passes its existing validation. It publishes the update zip and manifest alongside the site.

## Update behavior and save safety

- On a network connection, a native launch checks for a newer game version. If available, it downloads the bundle in the background.
- The app switches to the downloaded bundle when it enters the background or on its next launch, without interrupting an active session.
- Offline launches continue using the last installed bundle.
- App and browser saves are separate local stores. Export the save before moving between installations.
- The initial APK containing the updater plugin must be installed once. Future text/game-content updates use OTA; changes to native code need an APK update.
