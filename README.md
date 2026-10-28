# Mapranex Cloud Video Studio — quality-first pilot

Private, manual GitHub Actions rendering pilot for a 30-second 1080×1920, 30fps vertical Mapranex Cloud & DevOps Reel.

## Scope
- Uses Remotion and a real screenshot from https://myaiteam-company.vercel.app/services/cloud-devops/
- Rendering, Playwright screenshot capture, and temporary video files run on GitHub-hosted Actions, **not Oracle**
- **No schedule**, no automatic retries, no n8n modification, no WhatsApp or social publishing
- No R2, n8n, Oracle SSH keys, API keys, or other secrets required
- No AI narration yet; no claim that this is generative AI footage
- GitHub Actions preview artifact retention: 1 day. Quality must be reviewed before integration.

## Running
Go to **Actions → Mapranex quality-first Reel pilot → Run workflow**. After a successful run, download the `mapranex-pilot-preview` artifact and review the MP4. The workflow has a 20-minute timeout and concurrency of one job.

## Before running
Review GitHub Actions billing/usage limits. GitHub-hosted minutes may count toward an allowance and may be billed depending on account settings.
Check Remotion license eligibility for commercial usage before relying on this commercially: https://github.com/remotion-dev/remotion/blob/main/packages/core/LICENSE.md

## Acceptance criteria
1. Actual Mapranex site screenshot is captured and readable.
2. MP4 plays at 1080×1920, 30fps, 30 seconds.
3. Content is not clipped and quality is genuinely better than the existing Editly pilot.
4. Runner minutes and cost are acceptable.
5. Only after approval: narration/captions, R2 delivery, n8n status checks, WhatsApp approval and publishing.
