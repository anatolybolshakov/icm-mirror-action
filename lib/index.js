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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const mainLogic_1 = __importDefault(require("./mainLogic"));
const Constants = __importStar(require("./constants"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const githubPAT = core.getInput('repo-token', { required: true });
        const labelFilter = core.getInput('label-filter', { required: false }) || Constants.labelFilterDefault;
        const labelForIssues = core.getInput('labels-for-issues', { required: false }) || Constants.labelForIssuesDefault;
        const tenantId = core.getInput('tenant-id', { required: false });
        const aadAppId = core.getInput('aad-app-id', { required: true });
        const appKey = core.getInput('aad-app-key', { required: true });
        const oktokit = github.getOctokit(githubPAT);
        const existingIssues = yield mainLogic_1.default.getExistingIssues(oktokit, "IcM", "[Icm");
        const currentWorkItems = yield mainLogic_1.default.getWorkItems(Constants.icmClusterUrl, Constants.kustoQuery, Constants.icmClusterDatabase, aadAppId, appKey, tenantId);
        mainLogic_1.default.createIssues(oktokit, existingIssues, currentWorkItems, labelForIssues, labelFilter);
    });
}
main();
