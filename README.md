# PartnerSync

PartnerSync is a private platform designed for couples to chat, plan dates and share memories across macOS and the web.

Sprint 2 adds basic email authentication and a simple partner pairing flow using Firebase.
Sprint 3 introduces a minimal chat experience with realtime messaging via Firestore.


## Project structur

- `macos-app` – SwiftUI project for macOS
- `web-app` – Next.js application for the web/PWA
- `firebase` – backend configuration

## Getting started

1. Install dependencies in `web-app` and run the dev server:

```bash
cd web-app
npm install

npm install firebase

npm run dev
```

2. Open `macos-app/PartnerSync.xcodeproj` with Xcode to run the macOS application.

Backend configuration is handled via Firebase (see the `firebase` directory and `.env.example`).

After starting the web server you can visit `/login` to register or sign in with email and password. Use `/pair` to create an invite code or join your partner's code.

## Continuous Integration

GitHub Actions run linting on every push. See `.github/workflows/ci.yml`.

For questions or support send an email to [support@louvibe.com](mailto:support@louvibe.com).
