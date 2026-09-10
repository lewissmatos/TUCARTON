# Decision Log: TuCarton Phase 0 Foundation Repository Structure

| Date | ID | Decision / question | Context | Decider | Impact |
| --- | --- | --- | --- | --- | --- |
| `2026-09-09` | D-01 | Use npm workspaces for the Phase 0 monorepo. | npm `11.17.0` is already available; official npm workspaces provide local-package linking and workspace-targeted scripts without another orchestration layer. | Senior Developer-approved scope; implemented by Coder | Root `package.json` owns workspace discovery and the generated `package-lock.json` is the sole lockfile. |
| `2026-09-09` | D-02 | Retain source-spec TBDs for authentication, ORM, hosting, push, and offline signatures. | These choices materially affect security, persistence, deployment, and QR assurances. | Senior Developer | No provider/toolkit is installed for these concerns in the foundation scaffold. |
