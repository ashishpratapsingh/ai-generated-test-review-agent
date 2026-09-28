import { Octokit } from '@octokit/rest';

export interface PullRequestDetails {
  owner: string;
  repo: string;
  pullNumber: number;
  diff: string;
  prTitle: string;
  prBody: string;
}

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getPullRequestDiff(owner: string, repo: string, pullNumber: number): Promise<PullRequestDetails> {
    const { data: pr } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    const { data: diffData } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: {
        format: 'diff',
      },
    });

    return {
      owner,
      repo,
      pullNumber,
      diff: diffData as unknown as string,
      prTitle: pr.title,
      prBody: pr.body || '',
    };
  }

  async postReviewComment(owner: string, repo: string, pullNumber: number, commentBody: string): Promise<void> {
    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body: `## 🤖 AI Test Review Agent Report\n\n${commentBody}`,
    });
  }
}