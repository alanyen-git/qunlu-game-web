# 群陸旅誌 Web

此倉庫僅發布《群陸旅誌》正式網頁遊戲執行檔。完整開發專案維持私人。

## 公開遊玩網址

https://alanyen-git.github.io/qunlu-game-web/

手機可直接用瀏覽器開啟；支援 PWA 安裝到主畫面與離線快取。

## 本機模式

- 不需要登入帳號。
- 每位玩家的角色、進度與備份都儲存在自己的手機／瀏覽器，不會共用其他玩家的存檔。
- 主存檔使用 IndexedDB 大容量本機儲存，瀏覽器不支援或寫入失敗時才回退到 localStorage。
- 清除瀏覽器網站資料、使用無痕模式、換瀏覽器或換手機，都可能無法讀到原本的本機存檔；重要進度請使用遊戲內「匯出存檔」備份。
- 第一次成功載入後，Service Worker 會快取正式版資源；已快取資源完整時可離線啟動。

## 正式版發布與自動驗證

GitHub Pages 的 Source 設為 **GitHub Actions**。每次推送到 `main` 時，
`.github/workflows/deploy-pages.yml` 會先執行語法檢查、資料庫完整性稽核、
建角／存檔／交易／戰鬥回歸測試及 PWA 快取測試。只有驗證成功才會
打包正式遊戲資源並執行 GitHub Pages 部署。

部署進度：https://github.com/alanyen-git/qunlu-game-web/actions

遊戲持續採本機存檔。部署時只打包公開網頁資源，不包含測試報告或
工具程式，且不會清除玩家裝置上的 IndexedDB／localStorage 存檔。

## Android app architecture

The repository now includes a Capacitor 8 build path for an offline Android app. It packages the existing text game and game data locally in the APK, while the web/PWA release continues to deploy through the existing Pages workflow.

- Run `npm install`, then `npm run build:mobile` to stage the app runtime in `dist/`.
- Run `npx cap add android`, then `npm run cap:sync:android` to generate and sync the Android project.
- Build a test APK with `cd android && ./gradlew assembleDebug`.
- GitHub Actions builds the debug APK when runtime files change. Download it from the `Build Android app` workflow run's artifact named `qunlu-android-debug`. The Android app checks the GitHub Pages update manifest at launch and downloads newer HTML/CSS/JavaScript bundles; updates apply when the app goes to the background or on its next launch. Native plugin or Android code changes still require installing a new APK.
- The app works from bundled local files after installation. Save data is local to each app/browser installation; move saves between web and Android with the game's export/import feature.
- This milestone changes packaging only. Visual redesign and animation are deferred. The debug APK is for testing and is not signed for store release.

See [mobile/ARCHITECTURE.md](mobile/ARCHITECTURE.md) for the platform and storage boundaries.
