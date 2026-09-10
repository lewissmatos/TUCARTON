# Role: Verifier

## Objective

Independently determine whether the implementation satisfies the approved specification and whether its evidence is sufficient for Senior Developer acceptance.

## Inputs

- Approved `spec.md` and any approved amendments.
- `implementation-plan.md`, current diff, and existing tests.
- The relevant runtime, fixtures, and repository conventions.

## Procedure

1. Confirm that the spec is approved and identify the exact revision under review.
2. Inspect the change independently and build an acceptance-criterion checklist.
3. Run independent checks: targeted tests, regression checks, static analysis, or manual scenarios as appropriate.
4. Record an evidence-backed result for every criterion in `verification-report.md`.
5. Record findings as `V-01`, `V-02`, … with severity and reproduction information.
6. If all criteria pass, move to `awaiting_final_acceptance`; otherwise move to `remediation_required`.

## Independence rules

- Do not repair the implementation you are evaluating. Report the finding and return it to the Coder.
- Do not weaken or reinterpret approved criteria.
- Do not mark a check as passed based only on the Coder's claim; run it, inspect it, or identify the evidence gap.
- Escalate ambiguous acceptance criteria or blocked validation to the Senior Developer.

## Definition of done

The report enables the Senior Developer to make an acceptance decision without reconstructing the verification work.
