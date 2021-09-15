const core = require("@actions/core")
const github = require("@actions/github")

function toOrd(n) {
  const s = ["th", "st", "nd", "rd"],
        v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

async function run() {
  try {
    const githubToken = core.getInput("githubToken")
    const actor = core.getInput("actor") || ""
    const octokit = github.getOctokit(githubToken)
    const username = "JayantGoel001"

    let filteredRepos = []

    let page = 1
    while (true) {
      const repos = await octokit.request("GET /users/{username}/repos", {
        username,
        type: "public",
        page,
        per_page: 100,
        mediaType: {
          previews: ["mercy"],
        },
      })

      page += 1

      if (repos.data.length === 0) {
        break
      }

      const data = repos.data.map((repo) => ({
        name: repo.name,
        full_name: repo.full_name,
        stargazers_count: repo.stargazers_count,
        forks_count : repo.forks_count,
      }))

      filteredRepos = filteredRepos.concat(
        data.filter((repo) => repo.name.includes("A_REPO_WITH_"))
      )
    }

    filteredRepos.forEach(async ({ full_name, stargazers_count,forks_count }) => {
      const [owner, repo] = full_name.split("/")
      const name = `A_REPO_WITH_${stargazers_count}_STARS_AND_${forks_count}_FORKS.`
      const title = `A REPO WITH ${stargazers_count} STARS ⭐️ AND ${forks_count} FORKS.`
      const msg = `[${actor}](https://github.com/${actor}) helped me reach ${toOrd(stargazers_count)} stars and ${toOrd(forks_count)} forks.`
      
      await octokit.request("PATCH /repos/{owner}/{repo}", {
        owner,
        repo,
        name,
      })

      const readmeFile = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          owner,
          repo,
          path: "README.md",
        }
      )
      var b = new Buffer(readmeFile.data.content, 'base64')

      var readmeContent = b.toString();
      console.log(readmeContent.split("\n").slice(1));
      const readmeContents = [
        `# ${title}`,
        ...readmeContent.split("\n").slice(1),
        " - " + msg
      ]

      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner,
        repo,
        path: "README.md",
        message: `⭐️ ${stargazers_count}`,
        content: Buffer.from(readmeContents.join("\n\n")).toString("base64"),
        sha: readmeFile.data.sha,
        author: {
          name: actor,
          email: `${actor}@users.noreply.github.com`,
        },
        committer: {
          name: "Jayant goel",
          email: "jgoel92@gmail.com",
        },
      })
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
