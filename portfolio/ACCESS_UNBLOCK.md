# Portfolio Access Unblock Runbook

**Owner:** Ryan Gomez  
**Authoritative task:** issue #22  
**Purpose:** remove the shared access boundary blocking the highest-priority product and research workstreams without exposing credentials.

## Verified connection snapshot — 2 August 2026

### GitHub

The connected GitHub App is installed on exactly one account:

- `vertex-studyAI`

It is **not installed** on:

- `build-the-future-11`
- `ryangomez010`
- `THE-BU1LD`

This explains why Percy can inspect public repositories under those owners but branch creation returns `403 Resource not accessible by integration`.

### Supabase

The connected Supabase app currently exposes one project: the VertexED project. FinanceMeta and The Bu1LD production projects are not visible.

### Cloud infrastructure

No Cloudflare or Google Cloud plugin is available in the current session. Project 2424 restoration therefore uses the versioned local `gcloud` runner rather than an in-chat cloud connector.

## Step 1 — extend GitHub App installation

Open ChatGPT:

1. Go to **Settings → Apps**.
2. Open **GitHub**.
3. Choose **Configure repositories** or **Choose repositories**.
4. GitHub will open the ChatGPT GitHub App installation page.
5. Install or configure the app separately for each required owner.
6. Select only the repositories below.

Required repository access:

| Owner | Repository | Required work |
|---|---|---|
| `build-the-future-11` | `finance4all-global-reach` | Branches, security migration, CI, tests, PRs |
| `ryangomez010` | `bu1ld-landing` | Production certification, CI, Cloudflare evidence |
| `THE-BU1LD` | `the-bu1ld-nexus-main` | Private operating platform audit |
| `THE-BU1LD` | `labos` | Private research operating system audit |

Keep access narrow. Do not grant unrelated repositories merely for convenience.

Where the app or workspace exposes action controls, allow the minimum write capabilities required for:

- repository contents;
- pull requests;
- issues;
- GitHub Actions inspection and reruns.

Never paste a GitHub token, private key, or installation credential into ChatGPT, an issue, a commit, or a build log.

OpenAI's current GitHub connection guide confirms that repository access is configured through **Settings → Apps → GitHub**, followed by GitHub installation/authorization and repository selection. Repository visibility may take several minutes after authorization.

## Step 2 — extend Supabase authorization

Open ChatGPT:

1. Go to **Settings → Apps**.
2. Open **Supabase**.
3. Reconnect or extend authorization to the organizations containing the production projects.
4. Select the production projects for VertexED, FinanceMeta, and The Bu1LD.

Expected result after reconnection:

- the existing VertexED project remains visible;
- the FinanceMeta production project appears;
- the Bu1LD production project appears.

Do not paste database passwords, service-role keys, JWT secrets, anon keys, or connection strings into chat. The connector should expose authorized project actions directly.

Percy's first database actions after connection will be read-only:

- list projects;
- inspect project metadata;
- run security advisors;
- run performance advisors;
- inspect schema/RLS state without reading user content.

Schema changes occur only after the current migration is reviewed and the target project is unambiguous.

## Step 3 — prepare disposable production identities

Create non-personal test accounts and store credentials in a password manager, not in GitHub or ChatGPT.

### VertexED

- allowlisted administrator;
- approved beta user.

### FinanceMeta

- normal member;
- administrator.

### The Bu1LD

- member;
- project lead;
- reviewer or mentor;
- administrator;
- removed or revoked member.

Use unique accounts so authorization boundaries can be tested honestly. Do not reuse an administrator session for member testing.

## Step 4 — execute the Project 2424 cloud recovery

No GCP connector is available. Run from the Mac with the PRO-BLADE mounted and authenticated `gcloud` access:

```bash
cd /path/to/vertexED.ai

git pull --ff-only

bash portfolio/scripts/restore_project2424_to_inkling.sh \
  --verify \
  --keep-local-package
```

Required successful terminal marker:

```text
PROJECT_2424_INKLING_RESTORE_PASSED
```

The runner must remain unchanged in these safety properties:

- no reset or clean of the PRO-BLADE source;
- complete Git bundle plus staged, unstaged, and untracked overlays;
- transfer hashes;
- isolated cloud staging;
- quality gate before promotion;
- existing cloud directory untouched on failure;
- previous cloud directory backed up before promotion;
- raw recovery and test evidence retained.

## Step 5 — verify access without destructive writes

After the connections propagate, ask Percy to **recheck portfolio access**.

Percy will verify:

1. Installed GitHub accounts include `vertex-studyAI`, `build-the-future-11`, `ryangomez010`, and `THE-BU1LD`.
2. FinanceMeta and The Bu1LD allow isolated branch creation.
3. Private Nexus and LabOS repositories are readable.
4. Supabase lists all three production projects.
5. No credential appears in logs, issues, commits, or browser bundles.

The first write in each newly connected repository will be an isolated branch—not a direct `main` change.

## Workstreams unlocked

| Issue | Workstream | Unlocked by |
|---:|---|---|
| #13 | VertexED authenticated production certification | Supabase/Vercel access and disposable accounts |
| #16 | The Bu1LD production and seven-role certification | GitHub, Supabase, Cloudflare evidence, role accounts |
| #19 | FinanceMeta security and golden-journey hardening | GitHub, Supabase, member/admin accounts |
| #20 | Project 2424 lossless Inkling restore | Mac, PRO-BLADE, authenticated `gcloud` |
| #22 | Shared access boundary | Completion of this runbook |

## Completion condition

This runbook is complete only when:

- all required GitHub owners appear in connected installation data;
- isolated branch creation succeeds in FinanceMeta and The Bu1LD;
- private Nexus and LabOS sources are readable;
- all three production Supabase projects are visible;
- disposable role-specific identities exist through a secure flow;
- Project 2424 is a verified Git repository on Inkling;
- issues #13, #16, #19, and #20 can proceed without credential disclosure.
