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
 * Parses yarn audit JSON output which consists of multiple JSON objects, one per line
 * @param input The raw yarn audit output as string
 * @returns Array of parsed JSON objects
 */
export declare function parseYarnAuditOutput(input: string): any[];
/**
 * Normalizes different audit formats into our internal format
 * @param jsonDataOrString The raw audit data (can be string, npm object, or yarn array)
 * @returns Normalized AuditReport
 */
export declare function normalizeAuditData(jsonDataOrString: any): AuditReport;
