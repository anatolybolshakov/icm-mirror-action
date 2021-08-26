"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AzureKustoData = __importStar(require("azure-kusto-data"));
const github = __importStar(require("@actions/github"));
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
    static getWorkItems(icmClusterUrl, kustoQuery, kustoCluster, aadAppId, appKey, tenantId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Getting existing ICM tickets...');
            const kustoConnectionStringBuilder = AzureKustoData.KustoConnectionStringBuilder;
            const kcsb = kustoConnectionStringBuilder.withAadApplicationKeyAuthentication(icmClusterUrl, aadAppId, appKey, tenantId);
            const kustoClient = new AzureKustoData.Client(kcsb);
            const results = yield kustoClient.execute(kustoCluster, kustoQuery);
            const resultsIterator = (_a = results === null || results === void 0 ? void 0 : results.primaryResults[0]) === null || _a === void 0 ? void 0 : _a.rows();
            let currentRow = resultsIterator.next();
            const resultArray = [];
            while (!currentRow.done) {
                resultArray.push(currentRow);
                console.log(currentRow);
                currentRow = resultsIterator.next();
            }
            console.log(`Found ${resultArray.length} ICM tickets`);
            return resultArray.map((item) => { var _a; return (_a = item === null || item === void 0 ? void 0 : item.value) === null || _a === void 0 ? void 0 : _a.raw; });
        });
    }
    /**
     * Returns array of already exising GitHub issues - titles
     * @param octokit oktokit object
     * @param labelFilter list of labels - comma separated like "label1,label2"
     * @param issuePrefix prefix of issue title
     * @returns array of titles
     */
    static getExistingIssues(octokit, labelFilter, issuePrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Getting existing GitHub issues...');
            const options = octokit.rest.issues.listForRepo.endpoint.merge({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                state: 'open',
                labels: labelFilter
            });
            const issuesAndPulls = yield octokit.paginate(options);
            return issuesAndPulls.filter((value) => {
                var _a;
                const issueValue = value;
                return !issueValue.pull_request && ((_a = issueValue === null || issueValue === void 0 ? void 0 : issueValue.title) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith(issuePrefix.toLowerCase()));
            }).map(function (issue) { return issue.title; });
        });
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
    static createIssues(octokit, existingIssues, workItems, labelForIssues, issuePrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`GitHub issues that match: ${existingIssues.length}\n`);
            workItems.forEach(item => {
                let title;
                let itemId;
                let severity;
                let status;
                let link;
                [title, itemId, severity, status, link] = item;
                if (existingIssues.some(v => v.includes(`${itemId}`))) {
                    console.log(`Work item ${itemId} already has an issue created for it`);
                }
                else {
                    console.log(`Creating issue for work item ${itemId}`);
                    // Create bug info
                    const resTitle = `[Icm ${itemId}](Sev ${severity}): ${title}`;
                    const description = `Please look at Icm ${itemId} that has been opened here:\n${link}`;
                    // creating label array
                    let labelArray = [];
                    if (labelForIssues) {
                        labelForIssues.split(',').forEach(function (label) {
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
        });
    }
}
exports.default = MainLogic;
