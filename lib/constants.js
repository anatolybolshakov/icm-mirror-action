"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kustoQuery = exports.labelFilterDefault = exports.labelForIssuesDefault = exports.tenantIdIcm = exports.teamId = exports.icmClusterDatabase = exports.icmClusterUrl = void 0;
exports.icmClusterUrl = "https://icmcluster.kusto.windows.net";
exports.icmClusterDatabase = "IcmDataWarehouse";
exports.teamId = 79125; // Expert-Pipelines-Anatolii
exports.tenantIdIcm = 38; // AzureDevops tenant id in ICM
exports.labelForIssuesDefault = "IcM,P1";
exports.labelFilterDefault = "IcM";
exports.kustoQuery = `
let startTime = startofday(ago(90d)); // data collection start
let endTime = startofday(now());
let owningTeamIds = dynamic([
    ${exports.teamId}
    ]);
let owningTeamContactAliases = dynamic([]);
//
getincidents(${exports.tenantIdIcm}, startTime, endTime) 
| where isnull(ParentIncidentId) // ingore dups
| where Status == "ACTIVE"
| where array_length(owningTeamIds) == 0 or OwningTeamId in (owningTeamIds)
| where array_length(owningTeamContactAliases) == 0 or OwningContactAlias in (owningTeamContactAliases)
| project Title, IncidentId, Severity, Status, URL = strcat("https://portal.microsofticm.com/imp/v3/incidents/details/", IncidentId)
`;
