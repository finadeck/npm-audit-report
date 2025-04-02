import { AuditReport } from './types';
/**
 * Detects if the input is from yarn audit or npm audit
 * @param jsonData The raw audit JSON data
 * @returns "yarn" | "npm"
 */
export declare function detectAuditFormat(jsonData: any): 'yarn' | 'npm';
/**
 * Converts yarn audit format to the npm audit format we use internally
 * @param yarnAuditData The raw yarn audit JSON data
 * @returns Converted npm-compatible AuditReport
 */
export declare function convertYarnAuditToNpm(yarnAuditData: any[]): AuditReport;
/**
 * Normalizes different audit formats into our internal format
 * @param jsonData The raw audit JSON data (can be npm or yarn format)
 * @returns Normalized AuditReport
 */
export declare function normalizeAuditData(jsonData: any): AuditReport;
