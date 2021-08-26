import * as github from "@actions/github";
import * as core from "@actions/core";
import MainLogic from "./mainLogic";
import * as Constants from "./constants";

async function main() {
    const githubPAT = core.getInput('repo-token', { required: true });
    const labelFilter = core.getInput('label-filter', { required: false }) || Constants.labelFilterDefault;
    const labelForIssues = core.getInput('labels-for-issues', { required: false }) || Constants.labelForIssuesDefault;
    const tenantId = core.getInput('tenant-id', { required: false });
    const aadAppId = core.getInput('aad-app-id', { required: true });
    const appKey = core.getInput('aad-app-key', { required: true });

    const oktokit = github.getOctokit(githubPAT);

    const existingIssues = await MainLogic.getExistingIssues(oktokit, ["IcM"], "Icm");

    const currentWorkItems = await MainLogic.getWorkItems(Constants.icmClusterUrl, Constants.kustoQuery, 
        Constants.icmClusterDatabase, aadAppId, appKey, tenantId);

    MainLogic.createIssues(oktokit, existingIssues, currentWorkItems, labelForIssues, labelFilter);
}

main();