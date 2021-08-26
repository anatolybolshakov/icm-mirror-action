
export const icmClusterUrl = "https://icmcluster.kusto.windows.net";
export const icmClusterDatabase = "IcmDataWarehouse";
export const teamId = 79125; // Expert-Pipelines-Anatolii
export const tenantIdIcm = 38; // AzureDevops tenant id in ICM
export const labelForIssuesDefault = "IcM,P1";
export const labelFilterDefault = "IcM";

export const kustoQuery = `
let startTime = startofday(ago(90d)); // data collection start
let endTime = startofday(now());
let owningTeamIds = dynamic([
    ${teamId}
    ]);
let owningTeamContactAliases = dynamic([]);
//
getincidents(${tenantIdIcm}, startTime, endTime) 
| where isnull(ParentIncidentId) // ingore dups
| where Status == "ACTIVE"
| where array_length(owningTeamIds) == 0 or OwningTeamId in (owningTeamIds)
| where array_length(owningTeamContactAliases) == 0 or OwningContactAlias in (owningTeamContactAliases)
| project Title, IncidentId, Severity, Status, URL = strcat("https://portal.microsofticm.com/imp/v3/incidents/details/", IncidentId)
`;