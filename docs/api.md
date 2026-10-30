# REST API and API keys

## 📡 REST API

Reading is open. Creating a paste from a script needs an API key, issued by the operator on the
server (see [API keys](#-api-keys)); without one, `POST /api/pastes` only accepts the site's own form.

### `POST /api/pastes`

```bash
curl -X POST https://paste.msk-scripts.de/api/pastes \
  -H 'Authorization: Bearer mskp_…' \
  -H 'Content-Type: application/json' \
  -d '{
    "content":       "console.log(\"hello world\")",
    "title":         "My snippet",
    "language":      "javascript",
    "expiresIn":     "1w",
    "burnAfterRead": false
  }'
```

Response:

```json
{
  "pasteId":       "X7q9bA2k",
  "url":           "https://paste.msk-scripts.de/X7q9bA2k",
  "rawUrl":        "https://paste.msk-scripts.de/raw/X7q9bA2k",
  "deleteToken":   "dk_a7c4f2e1...",
  "expiresAt":     "2026-05-20T16:00:00.000Z",
  "hasPassword":   false,
  "burnAfterRead": false
}
```

| Method   | Path                          | Purpose                              |
|----------|-------------------------------|--------------------------------------|
| `POST`   | `/api/pastes`                 | Create a paste (API key required)    |
| `GET`    | `/api/pastes/:id`             | Fetch paste metadata + content       |
| `POST`   | `/api/pastes/:id/verify`      | Verify password, returns content     |
| `DELETE` | `/api/pastes/:id?token=…`     | Delete a paste with its delete token |
| `GET`    | `/api/stats`                  | Aggregate statistics                 |
| `POST`   | `/api/locale`                 | Set language cookie (`de` / `en`)    |

## 🔑 API keys

Only someone with a shell on the server and read access to the app's `.env` can manage keys. A key is
shown once when it is created; the database keeps only a scrypt hash of it.

```bash
/opt/msk-paste/scripts/api-key.sh help                     # all commands
/opt/msk-paste/scripts/api-key.sh list                     # id, prefix, label, last use, state
/opt/msk-paste/scripts/api-key.sh create "<label>"         # issue a key
/opt/msk-paste/scripts/api-key.sh revoke <key|prefix|id>   # block it, keep the row
/opt/msk-paste/scripts/api-key.sh delete <key|prefix|id>   # remove it
```
