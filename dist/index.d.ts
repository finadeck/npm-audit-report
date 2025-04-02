import { AuditReport } from './types';
/**
 * Generates an HTML report from npm audit data
 * @param auditData The parsed npm audit JSON data
 * @returns HTML string containing the formatted report
 */
export declare function generateHtmlReport(auditData: AuditReport): string;
