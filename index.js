const core = require("@actions/core"),
    github = require("@actions/github");
function toOrd(e) {
    const t = ["th", "st", "nd", "rd"],
        o = e % 100;
    return e + (t[(o - 20) % 10] || t[o] || t[0]);
}
async function run() {
    try {
        const e = core.getInput("githubToken"),
            t = core.getInput("actor") || "",
            o = github.getOctokit(e),
            a = "JayantGoel001";
        let n = [],
            r = 1;
        for (;;) {
            const e = await o.request("GET /users/{username}/repos", { username: a, type: "public", page: r, per_page: 100, mediaType: { previews: ["mercy"] } });
            if (((r += 1), 0 === e.data.length)) break;
            const t = e.data.map((e) => ({ name: e.name, full_name: e.full_name, stargazers_count: e.stargazers_count, forks_count: e.forks_count }));
            n = n.concat(t.filter((e) => e.name.includes("A_REPO_WITH_")));
        }
        n.forEach(async ({ full_name: e, stargazers_count: a, forks_count: n }) => {
            const [r, s] = e.split("/"),
                c = `A_REPO_WITH_${a}_STARS_AND_${n}_FORKS`,
                i = `A REPO WITH ${a} STARS ⭐️ AND ${n} FORKS`,
                u = `- [${t}](https://github.com/${t}) helped me reach ${toOrd(a)} stars and ${toOrd(n)} forks.`;
            
            let m = await o.request("GET /repos/{owner}/{repo}/contents/{path}", { owner: r, repo: s, path: "README.md" }),
                p = new Buffer(m.data.content, "base64").toString().split("\n");
            if (p[p.length - 1] == u || p[p.length - 2] == u) {
                const e = `# ${i}` + "\n" + (p = p.slice(0, -2)).slice(1).join("\n");
                await o.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                    owner: r,
                    repo: s,
                    path: "README.md",
                    message: `⭐️ ${a}`,
                    content: Buffer.from(e).toString("base64"),
                    sha: m.data.sha,
                    author: { name: t, email: `${t}@users.noreply.github.com` },
                    committer: { name: "Jayant goel", email: "jgoel92@gmail.com" },
                }),
                    (m = await o.request("GET /repos/{owner}/{repo}/contents/{path}", { owner: r, repo: s, path: "README.md" }));
            }else{
                console.log("Helloo World");
                await o.request("PATCH /repos/{owner}/{repo}", { owner: r, repo: s, name: c });
            }
            const l = `# ${i}` + "\n" + p.slice(1).join("\n") + "\n" + u + "\n";
            await o.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: r,
                repo: s,
                path: "README.md",
                message: `⭐️ ${a}`,
                content: Buffer.from(l).toString("base64"),
                sha: m.data.sha,
                author: { name: t, email: `${t}@users.noreply.github.com` },
                committer: { name: "Jayant goel", email: "jgoel92@gmail.com" },
            });
        });
    } catch (e) {
        core.setFailed(e.message);
    }
}
run();
