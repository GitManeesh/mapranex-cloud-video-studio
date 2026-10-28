# Mapranex n8n staging handoff — prepared, NOT deployed

The MP4 renderer and direct Cloudflare R2 delivery passed on GitHub Actions Run 40777993547.

The importable n8n staging workflow is delivered separately in the ChatGPT conversation as `Mapranex_GitHub_R2_Staging_n8n.json`. Do not commit n8n credentials or completed workflows with secrets to this public repository.

## Integration stages

**Stage A (prepared):** Manual Trigger → create numeric request ID using n8n execution ID → dispatch the existing `r2-staging.yml` workflow → check GitHub dispatch HTTP 204 → wait for rendering → HEAD the exact R2 public object → require HTTP 200, video/mp4, and nonzero content length. The result is explicitly `publication_allowed=false`. Never use `history/latest` or a hardcoded `success:true` as upload verification.

**GitHub credential needed in n8n (not GitHub repository):** HTTP Header Authentication, name `Authorization`, value `Bearer <fine-grained-GitHub-token>`. The token should be restricted to `GitManeesh/mapranex-cloud-video-studio` with **Actions: Read and write** permissions. Never paste the token into code, screenshots or chat. Import the JSON and select the GitHub header-auth credential on **Dispatch GitHub renderer** before testing.

The five-minute initial wait is a pilot simplification: a production flow needs bounded polling with unique request correlation, job-timeout handling, failure detection, and protection against overlapping requests. The workflow is not production-ready just because the object has been uploaded.

**Stage B (not deployed):** Build a separate video approval handler attached to the current WhatsApp callback infrastructure. Require authenticated button callbacks, persistent state, and an idempotency key before any social publishing. Keep current 40-node image-posting production flow unchanged.

**Stage C (not enabled):** Only after staging approval/reject tests, add n8n schedule `0 9 * * 1,3,5`, timezone `Europe/Berlin`, and prevent overlapping jobs or pending approvals. No auto-posting without approval.

**Security:** The public GitHub repository contains code only. R2 secrets stay in the protected environment `mapranex-r2-staging`. Protect `main` and restrict environment deployment branches to `main`. GitHub Action may run only on manual dispatch or explicitly scoped marker trigger; no cron is configured. Keep Oracle out of the video data path.

## Acceptance gate

- GitHub dispatch accepted, exact request ID appears in the resulting R2 object key
- MP4 public HEAD returns 200, Content-Type video/mp4, nonzero size
- WhatsApp Reject results in **zero** publishing calls
- WhatsApp Approve results in **one** publishing action per platform, with IDs persisted
- Repeated approvals and retries cannot publish twice
- Schedule remains off until all gates pass
