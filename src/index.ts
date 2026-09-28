import { GitHubService } from './github.js';
import { GeminiReviewService } from './gemini.js';

async function run() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const repository = process.env.GITHUB_REPOSITORY;
    const prNumberStr = process.env.PR_NUMBER;

    if (!githubToken || !repository || !prNumberStr) {
      throw new Error('Missing required environment variables: GITHUB_TOKEN, GITHUB_REPOSITORY, or PR_NUMBER.');
    }

    const [owner, repo] = repository.split('/');
    const pullNumber = parseInt(prNumberStr, 10);

    console.log(`Fetching pull request #${pullNumber} for ${owner}/${repo}...`);
    const githubService = new GitHubService(githubToken);
    const prDetails = await githubService.getPullRequestDiff(owner, repo, pullNumber);

    if (!prDetails.diff || prDetails.diff.trim() === '') {
      console.log('No code diff found in this pull request to review.');
      return;
    }

    console.log('Sending test script diff to Gemini API for QA code review...');
    const geminiService = new GeminiReviewService(geminiApiKey);
    const reviewReport = await geminiService.reviewTestDiff(
      prDetails.prTitle,
      prDetails.prBody,
      prDetails.diff
    );

    console.log('Posting review report back to GitHub Pull Request...');
    await githubService.postReviewComment(owner, repo, pullNumber, reviewReport);

    console.log('AI Test Review Agent completed successfully!');
  } catch (error: any) {
    console.error('Action failed with error:', error.message || error);
    process.exit(1);
  }
}

run();