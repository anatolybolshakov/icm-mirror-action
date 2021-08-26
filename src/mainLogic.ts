import * as AzureKustoData from "azure-kusto-data";
import * as github from "@actions/github";
import * as Models from "./models";

class MainLogic {
    /**
     * Returns Icm tickets
     * 
     * @param icmClusterUrl cluster url
     * @param kustoQuery query
     * @param kustoCluster cluster database
     * @param aadAppId app id
     * @param appKey app key
     * @param tenantId tenant id of organization
     * @returns 
     */
    static async getWorkItems(icmClusterUrl: string, kustoQuery: string, kustoCluster: string, aadAppId: string, appKey: string, tenantId: string) {
        console.log('Getting existing ICM tickets...');

        const kustoConnectionStringBuilder = AzureKustoData.KustoConnectionStringBuilder;
        const kcsb = kustoConnectionStringBuilder.withAadApplicationKeyAuthentication(icmClusterUrl, aadAppId, appKey, tenantId);
        const kustoClient = new AzureKustoData.Client(kcsb);
        const results = await kustoClient.execute(kustoCluster, kustoQuery);
        const resultsIterator = results?.primaryResults[0]?.rows();
        let currentRow = resultsIterator.next();
        const resultArray: any = [];

        while (!currentRow.done) {
            resultArray.push(currentRow);            
            console.log(currentRow);

            currentRow = resultsIterator.next();
        }
        console.log(`Found ${resultArray.length} ICM tickets`);

        return resultArray;
    }

    /**
     * Returns array of already exising GitHub issues - titles
     * @param octokit oktokit object
     * @param labelFilter list of labels - comma separated like "label1,label2"
     * @param issuePrefix prefix of issue title
     * @returns array of titles
     */
    static async getExistingIssues(octokit: Models.OktokitType, labelFilter, issuePrefix): Promise<string[]> {
        console.log('Getting existing GitHub issues...');
        const options = octokit.rest.issues.listForRepo.endpoint.merge({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            state: 'open',
            labels: labelFilter
        });

        const issuesAndPulls = await octokit.paginate(options);

        return issuesAndPulls.filter((value) => {
            const issueValue = value as Models.Issue;
            return !issueValue.pull_request && issueValue?.title?.toLowerCase().startsWith(issuePrefix.toLowerCase());
        }).map(function (issue) { return (issue as Models.Issue).title; });
    }

    /**
     * Creates issues on planning board
     * 
     * @param octokit oktokit object
     * @param existingIssues existing issues 
     * @param workItems items to add
     * @param labelForIssues labels for new issues
     * @param issuePrefix title prefix
     */
    static async createIssues(octokit: Models.OktokitType, existingIssues: string[], workItems: any[][], labelForIssues, issuePrefix) {
        console.log(`GitHub issues that match: ${existingIssues.length}\n`);

        workItems.forEach(item => {
            let title: string;
            let itemId: string;
            let severity: string;
            let status: string;
            let link: string;

            [title, itemId, severity, status, link] = item;

            if (existingIssues.some(v => v.includes(`${itemId}`))) {
                console.log(`Work item ${itemId} already has an issue created for it`);
            } else {
                console.log(`Creating issue for work item ${itemId}`);

                // Create bug info
                const resTitle = `[Icm ${itemId}](Sev ${severity}): ${title}`;
                const description = `Please look at Icm ${itemId} that has been opened here:\n${link}`

                // creating label array
                let labelArray: string[] = [];
                if (labelForIssues) {
                    labelForIssues.split(',').forEach(function (label: string) {
                        labelArray.push(label);
                    });
                }

                octokit.rest.issues.create({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    title: resTitle,
                    body: description,
                    labels: labelArray
                });
            }
        });
    }
}

export default MainLogic;