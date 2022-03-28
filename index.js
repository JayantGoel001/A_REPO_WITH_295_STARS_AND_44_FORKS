const core = require("@actions/core"),
    github = require("@actions/github");
function toOrd(e) {
    const t = ["th", "st", "nd", "rd"],
        n = e % 100;
    return e + (t[(n - 20) % 10] || t[n] || t[0]);
}
async function run() {
    try {
        const e = core.getInput("githubToken"),
            t = core.getInput("actor") || "",
            n = github.getOctokit(e),
            o = "JayantGoel001";
        let r = [],
            a = 1;
        for (;;) {
            const e = await n.request("GET /users/{username}/repos", { username: o, type: "public", page: a, per_page: 100, mediaType: { previews: ["mercy"] } });
            if (((a += 1), 0 === e.data.length)) break;
            const t = e.data.map((e) => ({ name: e.name, full_name: e.full_name, stargazers_count: e.stargazers_count, forks_count: e.forks_count }));
            r = r.concat(t.filter((e) => e.name.includes("A_REPO_WITH_")));
        }
        r.forEach(async ({ full_name: e, stargazers_count: o, forks_count: r }) => {
            const [a, s] = e.split("/"),
                c = `A_REPO_WITH_${o}_STARS_AND_${r}_FORKS`,
                u = `A REPO WITH ${o} STARS ⭐️ AND ${r} FORKS`,
                i = `[${t}](https://github.com/${t}) helped me reach ${toOrd(o)} stars and ${toOrd(r)} forks.`;
            await n.request("PATCH /repos/{owner}/{repo}", { owner: a, repo: s, name: c });
            const p = await n.request("GET /repos/{owner}/{repo}/contents/{path}", { owner: a, repo: s, path: "README.md" });
            const m = `# ${u}` + "\n" + new Buffer(p.data.content, "base64").toString().split("\n");
            console.log("X",m);
            console.log("X",m.length);
            console.log("X",m[m.length - 1]);
            m = m.slice(1).join("\n") + "\n- " + i + "\n";
            await n.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: a,
                repo: s,
                path: "README.md",
                message: `⭐️ ${o}`,
                content: Buffer.from(m).toString("base64"),
                sha: p.data.sha,
                author: { name: t, email: `${t}@users.noreply.github.com` },
                committer: { name: "Jayant goel", email: "jgoel92@gmail.com" },
            });
        });
    } catch (e) {
        core.setFailed(e.message);
    }
}
run();
