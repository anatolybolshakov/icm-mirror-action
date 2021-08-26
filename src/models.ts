import { Octokit } from "@octokit/core";
import { Api } from "@octokit/plugin-rest-endpoint-methods/dist-types/types";
import { PaginateInterface } from "@octokit/plugin-paginate-rest";

export declare type OktokitType = Octokit & Api & { paginate: PaginateInterface };

export interface Issue {
    pull_request: boolean;
    title: string;
}
