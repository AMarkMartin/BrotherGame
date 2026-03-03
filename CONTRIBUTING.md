# Contributing to BrotherGame

## Branch Ownership & Access

Each team member owns a domain branch and is solely responsible for merging into it.

| Branch | Owner | Scope |
|---|---|---|
| `arch/core` | Architecture | Core systems, data, entity framework |
| `levels/design` | Levels | World map, missions, scene layout |
| `art/assets` | Art | All visual assets, style guide |
| `audio/music` | Audio | Music, SFX, ambience |

**Rule:** Never commit directly to `develop` or `main`. Always work via your domain branch or a sub-branch.

---

## Workflow Step by Step

### Day-to-Day Work
```bash
# Start from your domain branch, up to date with develop
git checkout arch/core
git pull origin develop
git merge develop

# For a new chunk of work, make a sub-branch
git checkout -b arch/core-turn-system

# ... do your work ...

git add <specific files>
git commit -m "feat(core): implement turn queue system"

# Push sub-branch and open PR → your domain branch
git push origin arch/core-turn-system
```

### Merging to Develop
When your domain branch is stable and tested:
1. Open a PR: **your domain branch → `develop`**
2. Fill out the PR template fully
3. Request review from at least one other team member
4. Address review comments
5. Merge (squash or merge commit — team decides)

### Releases
The architecture owner opens a PR: **`develop` → `main`** at agreed milestones. All owners sign off before merge.

---

## Commit Message Convention

Format: `type(scope): short description`

| Type | When |
|---|---|
| `feat` | New feature or content |
| `fix` | Bug fix |
| `refactor` | Code restructure, no behavior change |
| `asset` | New or updated art/audio asset |
| `level` | New or updated level/map content |
| `docs` | Documentation only |
| `chore` | Tooling, build, config |
| `wip` | Work in progress (use sparingly, clean up before PR) |

**Scopes:** `core`, `turn-system`, `real-time`, `levels`, `world-map`, `missions`, `assets`, `audio`, `ui`, `tools`

Examples:
```
feat(core): add entity component system base
fix(turn-system): resolve end-of-turn event ordering bug
asset(sprites): add player character idle animation
level(world-map): add starting region tile data
```

---

## AI-Assisted Work Guidelines

When an AI agent is generating code or assets in your domain:

1. **Always review AI output before committing.** You are responsible for everything merged under your branch.
2. **Tag AI-generated commits** with `[ai]` at the end of the commit body:
   ```
   feat(core): generate entity registry scaffold

   [ai] Generated with Claude, reviewed and modified by <your-name>
   ```
3. **Do not let AI agents push to `develop` or `main`** — AI work goes to sub-branches under your domain branch, and you merge after review.
4. **Context files:** AI agents may create `.agent_context/` folders for their working notes. These are gitignored and should never be committed.

---

## Cross-Domain Dependencies

When your work requires something from another domain (e.g., Art needs a sprite size spec from Architecture):

1. Open a GitHub Issue tagged `cross-domain`
2. Tag the relevant domain owner
3. Agree on the interface/contract **before** building on it
4. Document the agreed interface in `docs/ARCHITECTURE.md` or the relevant design doc

---

## Pull Request Checklist

See `.github/pull_request_template.md` — fill it out completely. PRs without a filled template will not be reviewed.

---

## File Ownership Quick Reference

| Directory | Owner | Notes |
|---|---|---|
| `game/core/` | Architecture | Changes here affect everyone — communicate |
| `game/levels/` | Levels | Reference core entities but don't modify them |
| `game/assets/` | Art | Exported-ready formats only in repo |
| `game/audio/` | Audio | Compressed formats in repo; raw project files optional |
| `docs/` | All | Anyone can update, PR preferred for major changes |
| `tools/` | Architecture | With input from all domains |
