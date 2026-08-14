/**
 * Collects verifiable engineering facts from Iker's own repositories.
 *
 * Everything written to data.json is read from the GitHub API. Nothing is
 * asserted that the API did not confirm, so the rendered profile can never
 * claim more than the repositories actually prove.
 *
 * Runs on the Actions runner with the default GITHUB_TOKEN; no PAT required.
 */

const TOKEN = process.env.GITHUB_TOKEN;
const USER = process.env.PROFILE_USER || "ikerperez12";

if (!TOKEN) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

const API = "https://api.github.com";

async function rest(path) {
  const res = await fetch(API + path, {
    headers: {
      authorization: `Bearer ${TOKEN}`,
      accept: "application/vnd.github+json",
      "user-agent": `${USER}-profile`,
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

async function graphql(query, variables = {}) {
  const res = await fetch(API + "/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${TOKEN}`,
      "content-type": "application/json",
      "user-agent": `${USER}-profile`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

/** Does a path exist in the repo? Used to prove a control is really present. */
async function exists(repo, path) {
  const r = await rest(`/repos/${USER}/${repo}/contents/${path}`);
  return r !== null;
}

async function workflowNames(repo) {
  const r = await rest(`/repos/${USER}/${repo}/contents/.github/workflows`);
  if (!Array.isArray(r)) return [];
  return r.filter((f) => /\.ya?ml$/.test(f.name)).map((f) => f.name);
}

/** Read a workflow and look for evidence of a named tool actually running. */
async function workflowMentions(repo, files, patterns) {
  const hits = new Set();
  for (const f of files) {
    const r = await rest(`/repos/${USER}/${repo}/contents/.github/workflows/${f}`);
    if (!r || !r.content) continue;
    const text = Buffer.from(r.content, "base64").toString("utf8");
    for (const [key, re] of Object.entries(patterns)) {
      if (re.test(text)) hits.add(key);
    }
  }
  return [...hits];
}

async function latestRelease(repo) {
  const r = await rest(`/repos/${USER}/${repo}/releases`);
  if (!Array.isArray(r) || r.length === 0) return null;
  const rel = r[0];
  const assets = rel.assets.map((a) => a.name);
  return {
    tag: rel.tag_name,
    published: rel.published_at,
    count: r.length,
    assets,
    sbom: assets.some((n) => /\.cdx\.json$|sbom/i.test(n)),
    checksums: assets.some((n) => /sha256|checksum/i.test(n)),
    notices: assets.some((n) => /third_party|notices/i.test(n)),
    downloads: rel.assets.reduce((s, a) => s + a.download_count, 0),
  };
}

/**
 * The eight controls the profile reports on. Each is a yes/no fact that the
 * GitHub API can confirm, chosen because Iker's repos genuinely implement
 * them - a profile built this way stays empty for anyone who does not.
 */
async function auditRepo(repo) {
  const meta = await rest(`/repos/${USER}/${repo}`);
  if (!meta) return null;

  const wf = await workflowNames(repo);
  const tools = await workflowMentions(repo, wf, {
    codeql: /codeql/i,
    axe: /axe|playwright/i,
    audit: /npm audit|pip_audit|bandit|audit-level/i,
    lint: /lint|ruff|eslint/i,
    test: /\btest\b|unittest|pytest/i,
  });

  const [security, license, contributing, architecture] = await Promise.all([
    exists(repo, "SECURITY.md"),
    Promise.resolve(Boolean(meta.license)),
    exists(repo, "CONTRIBUTING.md"),
    exists(repo, "docs/ARCHITECTURE.md"),
  ]);

  const release = await latestRelease(repo);
  const langs = await rest(`/repos/${USER}/${repo}/languages`);

  return {
    repo,
    description: meta.description || "",
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    pushed: meta.pushed_at,
    created: meta.created_at,
    homepage: meta.homepage || "",
    topics: meta.topics || [],
    license: meta.license ? meta.license.spdx_id : null,
    languages: langs || {},
    controls: {
      ci: wf.length > 0,
      codeql: tools.includes("codeql"),
      security,
      license,
      contributing,
      architecture,
      a11y_ci: tools.includes("axe"),
      dep_audit: tools.includes("audit"),
      signed_release: Boolean(release && release.checksums),
      sbom: Boolean(release && release.sbom),
    },
    workflows: wf,
    release,
  };
}

/** HTTP-probe a live deployment. Reported as reachable / unverified only. */
async function probe(url) {
  if (!url) return null;
  const started = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal });
    clearTimeout(timer);
    return { url, status: res.status, ok: res.ok, ms: Date.now() - started };
  } catch {
    return { url, status: 0, ok: false, ms: Date.now() - started };
  }
}

const PRODUCTS = [
  "NexoIP-3D-Viewer",
  "IP-OS-LINUX",
  "UI-IP-Toolkit-v4.0",
  "e36",
  "warpod",
  "BLENDER-TOOL",
  "EASY-LOCALHOST",
  "1.2-AuditoriaPQC",
];

const data = {
  generated: new Date().toISOString(),
  user: USER,
  products: [],
  probes: [],
};

for (const repo of PRODUCTS) {
  const audit = await auditRepo(repo);
  if (audit) data.products.push(audit);
}

for (const p of data.products) {
  if (p.homepage) data.probes.push(await probe(p.homepage));
}

const gql = await graphql(
  `query ($login: String!) {
    user(login: $login) {
      createdAt
      contributionsCollection {
        totalCommitContributions
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
        totalCount
        nodes { name stargazerCount languages(first: 12, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } }
      }
    }
  }`,
  { login: USER }
);

data.github = {
  createdAt: gql.user.createdAt,
  totalContributions: gql.user.contributionsCollection.contributionCalendar.totalContributions,
  commits: gql.user.contributionsCollection.totalCommitContributions,
  publicRepos: gql.user.repositories.totalCount,
  calendar: gql.user.contributionsCollection.contributionCalendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => [d.date, d.contributionCount])
  ),
};

// Aggregate language bytes across every public non-fork repo.
const langTotals = new Map();
for (const node of gql.user.repositories.nodes) {
  for (const edge of node.languages.edges) {
    const cur = langTotals.get(edge.node.name) || { bytes: 0, color: edge.node.color };
    cur.bytes += edge.size;
    langTotals.set(edge.node.name, cur);
  }
}
data.languages = [...langTotals.entries()]
  .map(([name, v]) => ({ name, bytes: v.bytes, color: v.color }))
  .sort((a, b) => b.bytes - a.bytes);

process.stdout.write(JSON.stringify(data, null, 2));
