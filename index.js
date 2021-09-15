import { getInput, setFailed } from "@actions/core";
import { getOctokit } from "@actions/github";

function toOrd(n) {
  const s = ["th", "st", "nd", "rd"],
        v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

async function run() {
  try {
    const githubToken = getInput("githubToken")
    const actor = getInput("actor") || ""
    const octokit = getOctokit(githubToken)
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
        forks_count : repo.forks_count
      }))

      filteredRepos = filteredRepos.concat(
        data.filter((repo) => repo.name.includes("A-REPO-WITH-"))
      )
    }

    filteredRepos.forEach(async ({ full_name, stargazers_count }) => {
      const [owner, repo] = full_name.split("/")
      const name = `A-REPO-WITH-${stargazers_count}-STARS-And-${forks_count}-Forks`
      const title = `A-REPO-WITH-${stargazers_count} STARS ⭐️ And ${forks_count} Forks`
      const msg = `[${actor}](https://github.com/${actor}) helped me reach the count of ${toOrd(stargazers_count)} Star and ${toOrd(forks_count)} Fork.`
      
      // Break if repo name is not updated
      if (repo == name) { return }
      
      await octokit.request("PATCH /repos/{owner}/{repo}", {
        owner,
        repo,
        name,
      })

      console.log(`Repo name updated to ${name}`)

      const readmeFile = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          owner,
          repo,
          path: "README.md",
        }
      )
      
      const readmeContents = [
        `# ${title}`,
        msg,
        "## The star count is wrong?",
        "Then help me fix it. CLICK THE STAR!",
        "## Want to contribute?",
        "Clicking the star will trigger the commit which includes the clicker's name to the contributors list. So CLICK THE STAR!",
        "## [Q&A](https://github.com/narze/THIS_REPO_HAS_X_STARS/wiki/Q&A)",
      ]

      await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner,
        repo,
        path: "README.md",
        message: `⭐️ ${stargazers_count} And ${forks_count} Forks`,
        content: Buffer.from(readmeContents.join("\n\n")).toString("base64"),
        sha: readmeFile.data.sha,
        author: {
          name: actor,
          email: `${actor}@users.noreply.github.com`,
        },
        committer: {
          name: "Jayant Goel",
          email: "jgoel92@gmail.com",
        },
      })
    })
  } catch (error) {
    setFailed(error.message)
  }
}

run()
