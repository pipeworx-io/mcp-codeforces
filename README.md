# @pipeworx/codeforces

[Codeforces](https://codeforces.com) public read API MCP — competitive programming users, contests, problems, submissions. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Tools

- `user(handles[])` — profile(s) by handle (up to 10k)
- `user_rating(handle)` — full rating history for a user
- `user_status(handle, count?)` — recent submissions for a user
- `contest_list(gym?)` — all contests (regular or gym)
- `contest_standings(contest_id, handles?, from?, count?)` — final scoreboard + problem list for one contest
- `problemset(tags?, problemset_name?)` — problemset + recent submissions stats
- `recent_actions(max_count?)` — recent global actions feed
- `blog_entry_view(blog_id)` — full blog entry by id

## Standings paging is done here, not upstream

Codeforces rejects `from`, `count` and `handles` on public standings — it answers
HTTP 400 with *"Non-gym contest standings for non-admin users are available only
via anonymous GET requests with no extra parameters"*. The only request it accepts
is the bare `?contestId=<id>`, which returns the entire scoreboard (2.7 MB for
contest 1000, 14 MB for contest 2000).

So `contest_standings` streams that response and slices it here: `from`/`count`
page the rows and `handles` filters them, with the same meaning they had before.
Nothing is held in memory beyond the window you asked for. Two consequences worth
knowing:

- Without a `handles` filter the read stops as soon as your window is full, so the
  response carries `has_more: true` instead of `total_rows` — the participant count
  is genuinely unknown at that point. Ask for a window past the end of the
  scoreboard, or pass `handles`, and you get `total_rows`.
- Gym contests are not available at all. Codeforces serves gym standings only to an
  authenticated Codeforces account and this pack is keyless, so it returns
  `{found: false, reason: "gym_contest_requires_codeforces_account"}` rather than an
  error.

## Data source

`https://codeforces.com/api/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "codeforces": {
      "url": "https://gateway.pipeworx.io/codeforces/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/codeforces/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/codeforces_user \
  -H 'Content-Type: application/json' \
  -d '{"handles":["tourist"]}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/codeforces_user`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "codeforces": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-codeforces"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-codeforces
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Codeforces data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
