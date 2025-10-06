import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export const COMMON_STYLE = `
.ui-items-container[data-type=toolbar] > .list-wrap {
  overflow: visible;
}
#injected-ui-item-git-logseq-git {
  position: relative;
}
.plugin-git-container {
  display: none;
}
.plugin-git-container .plugin-git-mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 99;
}
.plugin-git-container .plugin-git-popup {
  position: fixed;
  z-index: 99;
  background-color: var(--ls-secondary-background-color);
  padding: 10px;
  border-radius: .375rem;
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05);
  box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);
}
.plugin-git-container .plugin-git-popup::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 10px 8px 10px;
  border-color: transparent transparent var(--ls-secondary-background-color) transparent;
}
`;

export const SHOW_POPUP_STYLE = `
.plugin-git-container {
  display: block;
}
`;
export const HIDE_POPUP_STYLE = `
.plugin-git-container {
  display: none;
}
`;

export const INACTIVE_STYLE = `
${COMMON_STYLE}
#injected-ui-item-git-logseq-git::after {
  display: none;
}
`;
export const ACTIVE_STYLE = `
${COMMON_STYLE}
#injected-ui-item-git-logseq-git::after {
  display: block;
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: rgb(237, 66, 69);
  right: 8px;
  top: 6px;
}
`;

export const LOADING_STYLE = `
${COMMON_STYLE}
#injected-ui-item-git-logseq-git::after {
  display: block;
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: rgb(237, 66, 69);
  right: 8px;
  top: 6px;
  animation: blink 1s linear infinite;
}
@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
`;

export const BUTTONS = [
  { key: "status", title: "Check Status", event: "check" },
  { key: "log", title: "Show Log", event: "log" },
  { key: "pull", title: "Pull", event: "pull" },
  { key: "pullRebase", title: "Pull Rebase", event: "pullRebase" },
  { key: "checkout", title: "Checkout", event: "checkout" },
  { key: "commit", title: "Commit", event: "commit" },
  { key: "push", title: "Push", event: "push" },
  { key: "commitAndPush", title: "Commit & Push", event: "commitAndPush" },
  { key: "initRepo", title: "Initialize Repository", event: "initRepo" },
];

export const SETTINGS_SCHEMA: SettingSchemaDesc[] = [
  {
    key: "repoInitHeader",
    title: "Repository Initialization",
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "gitHostDomain",
    title: "Git Host Domain",
    type: "string",
    default: "github.com",
    description: "Git hosting domain (e.g., github.com, gitlab.com, codeberg.org)",
  },
  {
    key: "gitUsername",
    title: "Git Username/Email",
    type: "string",
    default: "",
    description: "Your git username or email for authentication",
  },
  {
    key: "gitPassword",
    title: "Password/Token",
    type: "string",
    default: "",
    description: "Your git password or personal access token (stored locally)",
  },
  {
    key: "gitRepoOwner",
    title: "Repository Owner",
    type: "string",
    default: "",
    description: "Repository owner username (appears in repository URL path)",
  },
  {
    key: "gitRepoName",
    title: "Repository Name",
    type: "string",
    default: "",
    description: "Name of the repository (e.g., logseq-notes, my-vault)",
  },
  {
    key: "gitBranch",
    title: "Default Branch",
    type: "string",
    default: "main",
    description: "Default branch name (typically main or master)",
  },
  {
    key: "gitUserEmail",
    title: "Git Commit Email",
    type: "string",
    default: "",
    description: "Email address to use for git commits",
  },
  {
    key: "gitUserName",
    title: "Git Commit Name",
    type: "string",
    default: "",
    description: "Display name to use for git commits",
  },
  {
    key: "testCredentialsButton",
    title: "Test Credentials",
    type: "boolean",
    default: false,
    description: "Click to test if credentials can connect to the remote repository",
  },
  {
    key: "commitSettingsHeader",
    title: "Commit Settings",
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "typeCommitMessage",
    title: "Commit Message Type",
    type: "enum",
    default: "Default Message With Date",
    description: "Type of commit message to use",
    enumPicker: "select",
    enumChoices: ['Custom Message' , 'Default Message', 'Custom Message With Date', 'Default Message With Date'],
  },
  {
    key: "customCommitMessage",
    title: "Custom Commit Message",
    type: "string",
    default: "",
    description: "Custom commit message (only used if Commit Message Type is set to Custom)",
  },
  {
    key: "automationHeader",
    title: "Automation & Behavior",
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "checkWhenDBChanged",
    title: "Check Status on DB Changes",
    type: "boolean",
    default: true,
    description: "Check git status when database changes (restart logseq to take effect)",
  },
  {
    key: "autoCheckSynced",
    title: "Auto Check If Synced",
    type: "boolean",
    default: false,
    description: "Automatically check if local version matches remote",
  },
  {
    key: "autoPush",
    title: "Auto Push on Hide",
    type: "boolean",
    default: false,
    description: "Automatically push changes when Logseq is hidden/minimized",
  },
  {
    key: "autoPullBeforePush",
    title: "Auto Pull Before Push",
    type: "boolean",
    default: true,
    description: "Automatically pull-rebase before committing and pushing to prevent conflicts",
  },
  {
    key: "checkRemotePeriodically",
    title: "Check Remote for Changes",
    type: "boolean",
    default: false,
    description: "Check remote repository every 5 minutes for new changes",
  },
  {
    key: "autoSyncOnRemoteChanges",
    title: "Auto Pull on Remote Changes",
    type: "boolean",
    default: false,
    description: "Automatically pull when remote changes are detected (requires Check Remote for Changes)",
  },
  {
    key: "uiHeader",
    title: "UI Settings",
    type: "heading",
    default: "",
    description: "",
  },
  {
    key: "buttons",
    title: "Toolbar Buttons",
    type: "enum",
    default: ["Check Status", "Show Log", "Pull Rebase", "Commit & Push"],
    description: "Select which buttons to show in the toolbar dropdown",
    enumPicker: "checkbox",
    enumChoices: BUTTONS.map(({ title }) => title),
  }
];
