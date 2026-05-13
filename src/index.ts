interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Codeforces MCP — public read API.
 *
 * Auth: none for public endpoints. Docs: https://codeforces.com/apiHelp
 */


const BASE = 'https://codeforces.com/api';
const UA = 'pipeworx-mcp-codeforces/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'user',
    description: 'User profile(s) by handle (up to 10000 semicolon-separated).',
    inputSchema: {
      type: 'object',
      properties: {
        handles: { type: 'array', items: { type: 'string' }, description: '1-10000 handles' },
      },
      required: ['handles'],
    },
  },
  {
    name: 'user_rating',
    description: 'Full rating history for a user.',
    inputSchema: {
      type: 'object',
      properties: { handle: { type: 'string' } },
      required: ['handle'],
    },
  },
  {
    name: 'user_status',
    description: 'Recent submissions for a user.',
    inputSchema: {
      type: 'object',
      properties: {
        handle: { type: 'string' },
        from: { type: 'number', description: '1-based start (default 1)' },
        count: { type: 'number', description: '1-10000 (default 50)' },
      },
      required: ['handle'],
    },
  },
  {
    name: 'contest_list',
    description: 'All contests. Pass gym=true for gym contests.',
    inputSchema: {
      type: 'object',
      properties: { gym: { type: 'boolean' } },
    },
  },
  {
    name: 'contest_standings',
    description: 'Standings (and problem list) for a contest. Optionally filter by handles.',
    inputSchema: {
      type: 'object',
      properties: {
        contest_id: { type: 'number' },
        handles: { type: 'array', items: { type: 'string' } },
        from: { type: 'number' },
        count: { type: 'number', description: '1-1000 (default 100)' },
      },
      required: ['contest_id'],
    },
  },
  {
    name: 'problemset',
    description: 'Problemset + per-problem submission counts. Optional tag filter.',
    inputSchema: {
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' }, description: 'e.g. ["dp","graphs"]' },
        problemset_name: { type: 'string', description: 'Custom problemset (rarely used).' },
      },
    },
  },
  {
    name: 'recent_actions',
    description: 'Recent global actions feed.',
    inputSchema: {
      type: 'object',
      properties: { max_count: { type: 'number', description: '1-100 (default 30)' } },
    },
  },
  {
    name: 'blog_entry_view',
    description: 'Full blog entry by id.',
    inputSchema: {
      type: 'object',
      properties: { blog_id: { type: 'number' } },
      required: ['blog_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'user': {
      const handles = reqArr(args, 'handles', '["tourist"]').slice(0, 10000).join(';');
      return cfGet(`/user.info?handles=${encodeURIComponent(handles)}`);
    }
    case 'user_rating':
      return cfGet(`/user.rating?handle=${encodeURIComponent(reqStr(args, 'handle', '"tourist"'))}`);
    case 'user_status': {
      const params = new URLSearchParams({
        handle: reqStr(args, 'handle', '"tourist"'),
        from: String(Math.max(1, (args.from as number) ?? 1)),
        count: String(Math.min(10000, Math.max(1, (args.count as number) ?? 50))),
      });
      return cfGet(`/user.status?${params}`);
    }
    case 'contest_list': {
      const gym = args.gym === true;
      return cfGet(`/contest.list?gym=${gym ? 'true' : 'false'}`);
    }
    case 'contest_standings': {
      const params = new URLSearchParams({
        contestId: String((args.contest_id as number) | 0),
        from: String(Math.max(1, (args.from as number) ?? 1)),
        count: String(Math.min(1000, Math.max(1, (args.count as number) ?? 100))),
      });
      if (Array.isArray(args.handles) && args.handles.length > 0) {
        params.set('handles', (args.handles as string[]).filter((s) => typeof s === 'string').join(';'));
      }
      return cfGet(`/contest.standings?${params}`);
    }
    case 'problemset': {
      const params = new URLSearchParams();
      if (Array.isArray(args.tags) && args.tags.length > 0) {
        params.set('tags', (args.tags as string[]).filter((s) => typeof s === 'string').join(';'));
      }
      if (args.problemset_name) params.set('problemsetName', String(args.problemset_name));
      const qs = params.toString();
      return cfGet(`/problemset.problems${qs ? `?${qs}` : ''}`);
    }
    case 'recent_actions':
      return cfGet(`/recentActions?maxCount=${Math.min(100, Math.max(1, (args.max_count as number) ?? 30))}`);
    case 'blog_entry_view':
      return cfGet(`/blogEntry.view?blogEntryId=${(args.blog_id as number) | 0}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function cfGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Codeforces: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  const json = (await res.json()) as { status?: string; comment?: string; result?: unknown };
  if (json.status === 'FAILED') throw new Error(`Codeforces: ${json.comment ?? 'request failed'}`);
  return json;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

function reqArr(args: Record<string, unknown>, key: string, example: string): string[] {
  const v = args[key];
  if (!Array.isArray(v) || v.length === 0) {
    throw new Error(`Required argument "${key}" must be a non-empty array, e.g. ${example}.`);
  }
  return v.filter((s): s is string => typeof s === 'string');
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
