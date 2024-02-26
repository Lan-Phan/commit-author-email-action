import { context, getOctokit } from '@actions/github';

import { INPUT } from 'constants/io';
import { TListCommitsResponse } from 'types/octokit';
import { getInput } from '@actions/core';

const token = getInput(INPUT.GITHUB_TOKEN, { required: true });
const octokit = getOctokit(token);

export async function fetchCommitsInPullRequest(
  pullRequestNumber: number
): Promise<TListCommitsResponse> {
  const response = await octokit.rest.pulls.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pullRequestNumber,
  });
  return response.data;
}
