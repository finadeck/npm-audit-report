"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectAuditFormat = detectAuditFormat;
exports.convertYarnAuditToNpm = convertYarnAuditToNpm;
exports.normalizeAuditData = normalizeAuditData;
/**
 * Detects if the input is from yarn audit or npm audit
 * @param jsonData The raw audit JSON data
 * @returns "yarn" | "npm"
 */
function detectAuditFormat(jsonData) {
    // Yarn audit typically has an "type" property with "auditAdvisory" values
    if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].type === 'auditAdvisory') {
        return 'yarn';
    }
    // npm audit has a "vulnerabilities" object at the top level
    if (jsonData.vulnerabilities && typeof jsonData.vulnerabilities === 'object') {
        return 'npm';
    }
    // Default to npm if we can't be sure
    return 'npm';
}
/**
 * Converts yarn audit format to the npm audit format we use internally
 * @param yarnAuditData The raw yarn audit JSON data
 * @returns Converted npm-compatible AuditReport
 */
function convertYarnAuditToNpm(yarnAuditData) {
    // Initialize the npm-compatible report structure
    const npmReport = {
        vulnerabilities: {},
        metadata: {
            vulnerabilities: {
                info: 0,
                low: 0,
                moderate: 0,
                high: 0,
                critical: 0,
                total: 0
            },
            dependencies: {
                prod: 0,
                dev: 0,
                optional: 0,
                peer: 0,
                peerOptional: 0,
                total: 0
            }
        }
    };
    // Map yarn severity levels to npm severity levels
    const severityMap = {
        'info': 'info',
        'low': 'low',
        'moderate': 'moderate',
        'high': 'high',
        'critical': 'critical'
    };
    // Count total dependencies from yarn data
    // This is approximate since yarn doesn't provide the same metadata
    const metadataSummary = yarnAuditData.find(item => item.type === 'auditSummary');
    if (metadataSummary && metadataSummary.data) {
        npmReport.metadata.dependencies.total = metadataSummary.data.totalDependencies || 0;
    }
    // Process each advisory from yarn
    const advisories = yarnAuditData.filter(item => item.type === 'auditAdvisory');
    for (const item of advisories) {
        if (!item.data || !item.data.advisory)
            continue;
        const advisory = item.data.advisory;
        const resolution = item.data.resolution;
        const severity = severityMap[advisory.severity] || 'low';
        // Increment severity count
        npmReport.metadata.vulnerabilities[severity] += 1;
        npmReport.metadata.vulnerabilities.total += 1;
        // Create or update vulnerability entry
        const packageName = advisory.module_name;
        // Skip if we've already processed this package (yarn can report duplicates)
        if (npmReport.vulnerabilities[packageName])
            continue;
        const vulnerability = {
            name: packageName,
            severity: severity,
            via: [advisory.title || 'Unknown'],
            effects: resolution.path ? resolution.path.split('>').slice(1) : [],
            range: advisory.vulnerable_versions || '',
            nodes: resolution.path ? [resolution.path] : [],
            fixAvailable: resolution.dev ? false : {
                name: packageName,
                version: advisory.patched_versions?.replace(/^>=/, '') || '',
                isSemVerMajor: false // We can't easily determine this from yarn data
            }
        };
        npmReport.vulnerabilities[packageName] = vulnerability;
    }
    return npmReport;
}
/**
 * Normalizes different audit formats into our internal format
 * @param jsonData The raw audit JSON data (can be npm or yarn format)
 * @returns Normalized AuditReport
 */
function normalizeAuditData(jsonData) {
    const format = detectAuditFormat(jsonData);
    if (format === 'yarn') {
        return convertYarnAuditToNpm(jsonData);
    }
    else {
        // Already in npm format
        return jsonData;
    }
}
//# sourceMappingURL=adapter.js.map