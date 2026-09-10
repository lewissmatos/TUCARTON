# @tucarton/mobile

Expo / React Native app for Android and iOS. The onboarding screen uses Auth0 Universal Login; credentials stay in the Auth0 native credential manager. QR scans, offline sync, and local SQLite repositories remain deferred to approved feature work items.

Run `npm run mobile:start` from the repository root.

Auth0 requires a development build (`npx expo run:ios --device`), not Expo Go. Copy `.env.example` to an untracked `.env` and replace the example API URL with your Mac's LAN URL to enable the authenticated API bootstrap from a physical device.
