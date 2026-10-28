# Mapranex: end-to-end integration plan (staging)

**Operating policy:** Three Reels per week; WhatsApp Approve/Reject required; no automatic publishing before approval. The original 40-node n8n social publishing workflow must remain unchanged until all steps pass. No video rendering and no local MP4 files on Oracle.

## Existing and newly prepared components
- Website: https://myaiteam-company.vercel.app
- Public GitHub repository: `GitManeesh/mapranex-cloud-video-studio`
- Staging video workflow: `.github/workflows/r2-staging.yml` (manual only; NOT scheduled)
- Existing Cloudflare R2 bucket: `mapranex-reels`
- Existing public R2 base: `https://pub-8bc11ed3bb1543a99f0fbbc64ecad7a6.r2.dev`
- Existing Oracle n8n, WhatsApp Approve/Reject, Instagram/Facebook connections: preserve current production behavior

## Step 1: Secure GitHub staging environment
In repository Settings > Environments, create `mapranex-r2-staging`. Add environment secrets:
- `R2_ACCOUNT_ID`: Cloudflare R2 account ID (not a token)
- `R2_ACCESS_KEY_ID`: restricted R2 API token's access key ID
- `R2_SECRET_ACCESS_KEY`: restricted R2 API token's secret
Use a dedicated, bucket-scoped R2 token with only the required object permissions. **Never commit credentials or share them in chat.** Configure required reviewers for this environment if desired, and restrict deployment branches to `main`. In a public repository, keep workflow changes protected by branch rules and reviewer processes.

## Step 2: Verify a GitHub-to-R2 upload (one manual staging job)
Open Actions > Mapranex R2 delivery - staging > Run workflow, input `request_id` (unique numeric e.g. n8n execution ID) and `source_url=auto`.
The job validates input, captures an eligible website page, renders a 1080x1920 MP4, checks the video format and uploads directly from GitHub to `reels/github-mapranex-<request_id>.mp4`.
The GitHub runner makes the R2 upload; Oracle never receives the MP4.
GitHub Actions completion is **not** equivalent to publication approval.
The object can be checked at `https://pub-8bc11ed3bb1543a99f0fbbc64ecad7a6.r2.dev/reels/github-mapranex-<request_id>.mp4`.
Avoid recording R2 credentials or signed URLs in public logs.

## Step 3: Integrate orchestration in a separate n8n staging workflow
- Trigger: initially manual, then schedule at 09:00 Europe/Berlin Mon/Wed/Fri only after validation.
- Gate: skip on duplicate in-flight job, previous pending approval, or monthly budget reached.
- GitHub REST POST `/repos/GitManeesh/mapranex-cloud-video-studio/actions/workflows/r2-staging.yml/dispatches` with `ref=main`, `inputs.request_id=String($execution.id)`, `inputs.source_url=auto`. Use GitHub credential/token with minimum Actions write permission; don't put it into public GitHub repository. Do not assume GitHub's dispatch returns run ID (typically 204 with no body).
- Poll the list of workflow runs and uniquely associate the run with the request. **Do not choose "latest" blindly**. Prefer correlation via immutable request ID + run metadata. If the run cannot be uniquely matched, fail safely. Configure bounded polling and a timeout.
- Check workflow success plus R2 object HEAD (200, Content-Type video/mp4) and optionally a byte-range GET before WhatsApp.
- Store job status and unique request ID in a persistent data table.

## Step 4: WhatsApp Approve/Reject
- Send WhatsApp preview including the exact verified R2 URL, title/source page, request ID and Approve/Reject buttons.
- On Approve: require valid signature/callback, record approval, and publish only once to Instagram and Facebook with their respective video publishing APIs.
- On Reject: mark status rejected; never publish. Retain a bounded record and apply a deliberate R2 cleanup policy.
- Idempotency: store unique request ID and platform publish IDs; repeated webhooks must not publish twice.
- Do **not** automatically retry public publishing without checking existing platform media IDs.

## Step 5: Go-live gates
1. Three consecutive staging runs choose non-identical content and visually different layouts.
2. Videos play fully at 1080x1920 and contain accurate, readable content; narration/caption quality is an additional pending requirement.
3. Job status and R2 object keys correlate precisely to the same request ID.
4. Approve publishes once, Reject publishes zero times.
5. A failed render/storage/approval produces no social publication.
6. Confirm repository stays within GitHub Actions usage allowance; no spending-policy change by automation.
7. Only then turn on Mon/Wed/Fri schedule.

**Security caveat:** Public GitHub Actions is intended for public-safe site content and rendering code, not confidential inputs. Actions workflows running on `main` can access environment secrets; protect changes to `main` and review dependencies carefully.

**Current status:** Staging GitHub file prepared, but R2 secrets have not been configured and the new flow has not been run or verified. n8n, WhatsApp, and social publishing remain untouched.
