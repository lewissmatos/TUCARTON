# Work Items

Create one directory per change using a stable, lowercase ID such as `2026-09-09-add-auth`.

```text
.agents/work-items/
  2026-09-09-add-auth/
    spec.md
    implementation-plan.md
    verification-report.md
    decisions.md
```

Copy the files from `../templates/`, retain their headings, and update the state field as the work item crosses gates. Keep artifacts with the code change so requirements, evidence, and human decisions remain reviewable in version control.
