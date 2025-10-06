// https://logseq.github.io/plugins/interfaces/IAppProxy.html#execGitCommand
import type { IGitResult } from "@logseq/libs/dist/LSPlugin.user"

let _inProgress: Promise<IGitResult> | undefined = undefined

export const execGitCommand = async (args: string[]) : Promise<IGitResult> => {
  if (_inProgress) await _inProgress

  let res
  try {
    const currentGitFolder = (await logseq.App.getCurrentGraph())?.path
    const runArgs = currentGitFolder ? ['-C', currentGitFolder, ...args] : args
    _inProgress = logseq.Git.execCommand(runArgs)
    res = await _inProgress
  } finally {
    _inProgress = undefined
  }
    return res
}

export const inProgress = () => _inProgress

export const status = async (showRes = true): Promise<IGitResult> => {
  // git status --porcelain | awk '{print $2}'
  // git status --porcelain | wc -l
  const res =  await execGitCommand(['status', '--porcelain'])
  console.log('[faiz:] === git status', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git status success')
    } else {
      logseq.UI.showMsg(`Git status failed\n${res.stderr}`, 'error')
    }
  }
  /**
   * res
   * modify
   * {
   *  exitCode: 0,
   *  stderr: '',
   *  stdout: 'M foo.md\n?? bar.md\n',
   * }
   * ahead & uptodate & behind
   * {
   * exitCode: 0,
   * stderr: '',
   * stdout: '',
   * }
   */
  // changed files    staged files
  return res
}

// log with git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
export const log = async (showRes = true): Promise<IGitResult> => {
  // git log --pretty=format:"%h %s" -n 1
  // git log --pretty=format:"%h %ad | %s%d [%an]" --date=short
  // return await logseq.App.execGitCommand(['log', '--pretty=format:"%h %s"'])
  const res = await execGitCommand(['log', '--pretty=format:"%h %ad | %s [%an]"', '--date=format:"%Y-%m-%d %H:%M:%S"', '--name-status'])
  console.log('[faiz:] === git log', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git log success')
    } else {
      logseq.UI.showMsg(`Git log failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git pull
export const pull = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(['pull'])
  console.log('[faiz:] === git pull', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git pull success')
    } else {
      logseq.UI.showMsg(`Git pull failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git pull --rebase
export const pullRebase = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(['pull', '--rebase'])
  console.log('[faiz:] === git pull --rebase', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git pull --rebase success')
    } else {
      logseq.UI.showMsg(`Git pull --rebase failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git checkout .
export const checkout = async (showRes = true): Promise<IGitResult> => {
  const res = await execGitCommand(['checkout', '.'])
  console.log('[faiz:] === git checkout .', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git checkout success')
    } else {
      logseq.UI.showMsg(`Git checkout failed\n${res.stderr}`, 'error')
    }
  }
  return res
}

// git commit
export const commit = async (showRes = true, message: string): Promise<IGitResult> => {
  await execGitCommand(['add', '.'])
  // git commit -m "message"
  const res = await execGitCommand(['commit', '-m', message])
  console.log('[faiz:] === git commit', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git commit success')
    } else {
      logseq.UI.showMsg(`Git commit failed\n${res.stdout || res.stderr}`, 'error')
    }
  }
  return res
}

// push
export const push = async (showRes = true): Promise<IGitResult> => {
  // git push
  const res = await execGitCommand(['push'])
  console.log('[faiz:] === git push', res)
  if (showRes) {
    if (res.exitCode === 0) {
      logseq.UI.showMsg('Git push success')
    } else {
      logseq.UI.showMsg(`Git push failed\n${res.stderr}`, 'error')
    }
  }
  return res
}


/**
 * Returns the commit message based on the selected commit message type in the logseq settings.
 * @returns The commit message.
 */
export const commitMessage = () : string => {

  let defaultMessage = "[logseq-plugin-git:commit]";

  switch (logseq.settings?.typeCommitMessage as string) {
    case "Default Message":
      return defaultMessage;
    case "Default Message With Date":
      return defaultMessage + " " + new Date().toISOString();
    case "Custom Message":
      let customMessage = logseq.settings?.customCommitMessage as string;
      if (customMessage.trim() === "") {
        return defaultMessage;
      } else {
        return customMessage;
      }
    case "Custom Message With Date":
      let customMessageWithDate = logseq.settings?.customCommitMessage as string;
      if (customMessageWithDate.trim() === "") {
        return defaultMessage + " " + new Date().toISOString();
      } else {
        return customMessageWithDate + " " + new Date().toISOString();
      }
    default:
      return defaultMessage;
  }
}

/**
 * Test git credentials by attempting to ls-remote
 * @returns Promise<IGitResult>
 */
export const testCredentials = async (showRes = true): Promise<IGitResult> => {
  const domain = logseq.settings?.gitHostDomain as string;
  const username = logseq.settings?.gitUsername as string;
  const password = logseq.settings?.gitPassword as string;
  const repoOwner = logseq.settings?.gitRepoOwner as string;
  const repoName = logseq.settings?.gitRepoName as string;

  // Validate required fields
  if (!domain || !username || !password || !repoOwner || !repoName) {
    const errorMsg = "Missing required fields. Please fill in Git Host Domain, Username, Password/Token, Repository Owner, and Repository Name.";
    if (showRes) logseq.UI.showMsg(errorMsg, 'error');
    return { exitCode: 1, stdout: '', stderr: errorMsg };
  }

  try {
    // URL encode username and password to handle special characters like @, :, etc.
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    const remoteUrl = `https://${encodedUsername}:${encodedPassword}@${domain}/${repoOwner}/${repoName}.git`;

    // Test credentials with ls-remote
    const res = await execGitCommand(['ls-remote', remoteUrl, 'HEAD']);

    if (res.exitCode === 0) {
      if (showRes) logseq.UI.showMsg('✓ Credentials valid! Successfully connected to remote repository.', 'success');
      console.log('[logseq-plugin-git] === Credentials test successful');
      return { exitCode: 0, stdout: 'Credentials valid', stderr: '' };
    } else {
      if (showRes) logseq.UI.showMsg(`✗ Credential test failed: ${res.stderr || 'Repository not found or invalid credentials'}`, 'error');
      return res;
    }
  } catch (error) {
    const errorMsg = `Credential test failed: ${error}`;
    if (showRes) logseq.UI.showMsg(errorMsg, 'error');
    return { exitCode: 1, stdout: '', stderr: errorMsg };
  }
}

/**
 * Check if remote repository has new changes (is ahead of local)
 * @returns Promise<boolean> - true if remote has changes
 */
export const checkRemoteChanges = async (): Promise<boolean> => {
  try {
    // Fetch from remote without merging
    await execGitCommand(['fetch']);

    // Check if remote is ahead
    const res = await execGitCommand(['rev-list', 'HEAD..@{u}', '--count']);

    if (res.exitCode === 0) {
      const count = parseInt(res.stdout.trim());
      return count > 0;
    }
    return false;
  } catch (error) {
    console.log('[logseq-plugin-git] === Error checking remote changes', error);
    return false;
  }
}

/**
 * Initialize a git repository with HTTPS remote
 * @returns Promise<IGitResult>
 */
export const initRepo = async (showRes = true): Promise<IGitResult> => {
  const domain = logseq.settings?.gitHostDomain as string;
  const username = logseq.settings?.gitUsername as string;
  const password = logseq.settings?.gitPassword as string;
  const repoOwner = logseq.settings?.gitRepoOwner as string;
  const repoName = logseq.settings?.gitRepoName as string;
  const branch = (logseq.settings?.gitBranch as string) || "main";
  const userEmail = logseq.settings?.gitUserEmail as string;
  const userName = logseq.settings?.gitUserName as string;

  // Validate required fields
  if (!domain || !username || !password || !repoOwner || !repoName) {
    const errorMsg = "Missing required fields. Please fill in Git Host Domain, Username, Password/Token, Repository Owner, and Repository Name in settings.";
    if (showRes) logseq.UI.showMsg(errorMsg, 'error');
    return { exitCode: 1, stdout: '', stderr: errorMsg };
  }

  if (!userEmail || !userName) {
    const errorMsg = "Missing git user configuration. Please fill in Git User Email and Git User Name in settings.";
    if (showRes) logseq.UI.showMsg(errorMsg, 'error');
    return { exitCode: 1, stdout: '', stderr: errorMsg };
  }

  try {
    // Check if already initialized
    const statusCheck = await execGitCommand(['status']);
    if (statusCheck.exitCode === 0) {
      const msg = "Repository already initialized.";
      if (showRes) logseq.UI.showMsg(msg, 'warning');
      return { exitCode: 1, stdout: '', stderr: msg };
    }

    // Initialize git repository
    let res = await execGitCommand(['init']);
    if (res.exitCode !== 0) {
      if (showRes) logseq.UI.showMsg(`Git init failed: ${res.stderr}`, 'error');
      return res;
    }

    // Configure user
    await execGitCommand(['config', 'user.email', userEmail]);
    await execGitCommand(['config', 'user.name', userName]);

    // Create HTTPS remote URL with encoded credentials
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    const remoteUrl = `https://${encodedUsername}:${encodedPassword}@${domain}/${repoOwner}/${repoName}.git`;

    // Add remote origin
    res = await execGitCommand(['remote', 'add', 'origin', remoteUrl]);
    if (res.exitCode !== 0) {
      if (showRes) logseq.UI.showMsg(`Failed to add remote: ${res.stderr}`, 'error');
      return res;
    }

    // Set default branch
    res = await execGitCommand(['branch', '-M', branch]);
    if (res.exitCode !== 0) {
      if (showRes) logseq.UI.showMsg(`Failed to set branch: ${res.stderr}`, 'error');
      return res;
    }

    // Create initial commit
    await execGitCommand(['add', '.']);
    res = await execGitCommand(['commit', '-m', 'Initial commit from Logseq']);
    if (res.exitCode !== 0) {
      if (showRes) logseq.UI.showMsg(`Failed to create initial commit: ${res.stderr}`, 'error');
      return res;
    }

    // Set upstream and push
    res = await execGitCommand(['push', '-u', 'origin', branch]);
    if (res.exitCode !== 0) {
      if (showRes) logseq.UI.showMsg(`Repository initialized locally, but push failed: ${res.stderr}. You may need to create the repository on ${domain} first.`, 'warning');
      return res;
    }

    if (showRes) logseq.UI.showMsg('Repository initialized successfully!', 'success');
    console.log('[logseq-plugin-git] === Repository initialized');
    return { exitCode: 0, stdout: 'Repository initialized successfully', stderr: '' };
  } catch (error) {
    const errorMsg = `Initialization failed: ${error}`;
    if (showRes) logseq.UI.showMsg(errorMsg, 'error');
    return { exitCode: 1, stdout: '', stderr: errorMsg };
  }
}
