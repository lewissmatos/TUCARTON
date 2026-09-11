# @tucarton/mobile

Expo / React Native app for Android and iOS. The onboarding screen creates or restores a local TuCartón account using name, phone, and a numeric passcode; only signed session credentials are stored securely. QR scans, offline sync, and local SQLite repositories remain deferred to approved feature work items.

Run `npm run mobile:start` from the repository root.

For shared device development, copy `.env.example` to an untracked `.env`, then start Expo Go with `npx expo start --go --tunnel`. Use a stable production HTTPS API URL before release.
