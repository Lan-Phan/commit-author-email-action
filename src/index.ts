import { INPUT, OUTPUT } from 'constants/io';
import { getInput, info, setFailed, setOutput, warning } from '@actions/core';

import { FALSE } from 'constants/boolean';
import { GITHUB_EVENT } from 'constants/env';
import filterInvalidEmails from 'helpers/filterInvalidEmails';
import getCommitEmails from 'helpers/getCommitEmails';

async function checkEmail(): Promise<void> {
  const authorEmailDomainInput = getInput(INPUT.AUTHOR_EMAIL_DOMAIN, { required: true });
  const committerEmailDomainInput = getInput(INPUT.COMMITTER_EMAIL_DOMAIN, { required: true });
  info(`Author's email domain: ${authorEmailDomainInput}`);
  info(`Committer's email domain: ${committerEmailDomainInput}`);

  const commitEmails = await getCommitEmails(GITHUB_EVENT);

  if (!commitEmails) {
    return warning('Could not find any emails');
  }
  info(`Emails to check, author emails: ${commitEmails[0]}`);
  info(`Emails to check, committer emails: ${commitEmails[1]}`);

  const invalidAuthorEmails = filterInvalidEmails(authorEmailDomainInput, commitEmails[0]);
  const invalidCommitterEmails = filterInvalidEmails(committerEmailDomainInput, commitEmails[1]);

  handleSetOutput({ invalidAuthorEmails, invalidCommitterEmails }, [
    authorEmailDomainInput,
    committerEmailDomainInput,
  ]);
}

type InvalidEmails = {
  invalidAuthorEmails: string[];
  invalidCommitterEmails: string[];
};

function handleSetOutput(
  { invalidAuthorEmails, invalidCommitterEmails }: InvalidEmails,
  emailDomainInput: string[]
): void {
  const isValid = invalidAuthorEmails.length === 0 && invalidCommitterEmails.length === 0;

  setOutput(OUTPUT.IS_VALID, isValid);

  if (isValid) {
    return info('Emails are valid');
  }

  const errorOnFail = getInput(INPUT.ERROR_ON_FAIL);
  const errorMessage = `
      E-mail addresses with invalid domains found.

      Invalid author email: ${invalidAuthorEmails} 
      Invalid committer email: ${invalidCommitterEmails}

      Valid domains are: ${emailDomainInput[0]}.
      Tip: to set a new email, try running \`git config --add user.email Jane.Doe@your-domain.com\``;

  if (errorOnFail === FALSE) {
    warning(errorMessage);
  } else {
    throw Error(errorMessage);
  }
}

checkEmail().catch((error) => {
  setFailed(error.message);
});

export default checkEmail;
