# R2 staging — enter secrets in GitHub (one-time setup)

Open [mapranex-r2-staging environment settings](https://github.com/GitManeesh/mapranex-cloud-video-studio/settings/environments).

1. Click **mapranex-r2-staging**.
2. Under **Deployment branches and tags**, restrict the environment to `main`.
3. Under **Environment secrets**, click **Add environment secret** three times.
4. Use the names below **exactly**, entering the corresponding private value in GitHub's Secret field:

| Name | Example placeholder (NOT a real key) | Source |
|---|---|---|
| `R2_ACCOUNT_ID` | `REPLACE_WITH_YOUR_CLOUDFLARE_ACCOUNT_ID` | Cloudflare R2 account ID; not your account display name |
| `R2_ACCESS_KEY_ID` | `REPLACE_WITH_NEW_BUCKET_SCOPED_R2_ACCESS_KEY_ID` | R2 S3 API token |
| `R2_SECRET_ACCESS_KEY` | `REPLACE_WITH_NEW_BUCKET_SCOPED_R2_SECRET_ACCESS_KEY` | R2 S3 API token |

Create a **new bucket-scoped R2 token** for `mapranex-reels`, with only needed upload/verification permissions. Do not reuse an administrative token. R2's secret key may be displayed only once.

**Security:** This repository is public. Never place real credentials in `.env.example`, GitHub issues, commits, Actions inputs, workflow YAML, screenshots, or chat messages. GitHub environment secret values are encrypted and their contents are not displayed after saving.

**Current state:** The R2 staging workflow has been prepared but remains manual-only. Neither a schedule nor publishing is enabled. Once secrets are entered, start one controlled test at Actions → `Mapranex R2 delivery - staging` → Run workflow. Use a unique numeric request ID and `auto` source URL. Review R2 upload and verify the exact object before connecting n8n.

**Why placeholders only:** Placeholder strings are documentation; they cannot authenticate against Cloudflare. They should never be saved as the actual values of GitHub environment secrets.

To protect access, consider required reviewers and a protected `main` branch before using environment secrets with a public repository.
