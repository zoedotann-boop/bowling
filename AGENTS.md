<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Committing & pushing

Only when explicitly asked:

1. Stage, commit with a Conventional Commits message, and push the feature branch (gh/git).
2. If this change added, changed, or removed user-facing or scope behavior AND a PR exists for the branch (`gh pr view --json number`), UPDATE the PR description in the same turn so it matches the working tree: refresh the "User-facing changes" and "How to verify" sections and delete anything no longer true. Treat the PR description as a living document. If no PR exists, skip this step.
3. When editing, preserve auto-generated blocks (e.g. CodeRabbit `<!-- … -->`): read the current body with `gh pr view <n> --json body -q .body`, replace only the human-authored part, then `gh pr edit <n> --body-file <file>`.

# Creating a pull request

Use `gh pr create --base main --body-file <file>`. The body MUST follow this structure, with USER-FACING CHANGES FIRST:

```markdown
## What this PR does
<1–3 sentences; note that user-facing changes are listed first>

## User-facing changes
### 1. <change> — <what the end user notices (behavior, not files)>
### 2. …

## Developer-facing
- <tooling / refactor / deps with no user-visible effect — keep short>

## Tests & checks
- <added/updated tests; which checks pass>

## How to verify (manual QA)
<optional one-line general rule>

| Where | Do | Expect |
| --- | --- | --- |
| <route / screen> | <action> | <observable result> |

## Notes
- <follow-ups / intentional removals / caveats>
```

Rules:

- Lead with user impact, not implementation.
- EVERY user-facing change in section 2 has a matching row in the "How to verify" table; call out regression-checks explicitly.
- QA steps are specific: real routes/URLs, the exact control, and the observable result — never "test that it works".
- Keep the description accurate to the current implementation.

# General

When complete, always update the pull request description so it accurately reflects the current implementation. It should include all actual changes and remove any outdated information from previous iterations.

Also verify that the following are updated when applicable:

- `claude.md`
- `README`
- Landing page content and related documentation

In addition, research relevant best practices for the implemented changes (including external sources when beneficial) and look for opportunities to simplify the implementation. The primary objective is to keep the codebase clean, maintainable, scalable, and easy to understand.

Where appropriate, evaluate whether the database schema can be simplified or improved to better align with best practices. Proactively suggest schema enhancements that would make the system clearer, more scalable, or easier to maintain.

Finally, ensure comprehensive test coverage for all newly introduced functionality, including both happy paths and relevant edge cases.

Before requesting review or merging, ensure that all checks and validations pass successfully.
