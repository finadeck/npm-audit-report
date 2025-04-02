import { AuditReport, Vulnerability } from './types';

/**
 * Detects if the input is from yarn audit or npm audit
 * @param jsonData The raw audit JSON data
 * @returns "yarn" | "npm"
 */
export function detectAuditFormat(jsonData: any): 'yarn' | 'npm' {
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
export function convertYarnAuditToNpm(yarnAuditData: any[]): AuditReport {
  // Initialize the npm-compatible report structure
  const npmReport: AuditReport = {
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
  const severityMap: Record<string, string> = {
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
    if (!item.data || !item.data.advisory) continue;
    
    const advisory = item.data.advisory;
    const resolution = item.data.resolution;
    const severity = severityMap[advisory.severity] || 'low';
    
    // Increment severity count
    npmReport.metadata.vulnerabilities[severity as keyof typeof npmReport.metadata.vulnerabilities] += 1;
    npmReport.metadata.vulnerabilities.total += 1;
    
    // Create or update vulnerability entry
    const packageName = advisory.module_name;
    
    // Skip if we've already processed this package (yarn can report duplicates)
    if (npmReport.vulnerabilities[packageName]) continue;
    
    const vulnerability: Vulnerability = {
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
 * Parses yarn audit JSON output which consists of multiple JSON objects, one per line
 * @param input The raw yarn audit output as string
 * @returns Array of parsed JSON objects
 */
export function parseYarnAuditOutput(input: string): any[] {
  const lines = input.trim().split('\n');
  const results = [];
  
  for (const line of lines) {
    try {
      if (line.trim()) {
        results.push(JSON.parse(line));
      }
    } catch (e) {
      console.error('Error parsing yarn audit line:', e);
      // Continue with other lines even if one fails
    }
  }
  
  return results;
}

/**
 * Normalizes different audit formats into our internal format
 * @param jsonDataOrString The raw audit data (can be string, npm object, or yarn array)
 * @returns Normalized AuditReport
 */
export function normalizeAuditData(jsonDataOrString: any): AuditReport {
  // If input is a string, we need to determine if it's yarn or npm format
  if (typeof jsonDataOrString === 'string') {
    // Try parsing as a single JSON object (npm format)
    try {
      const parsed = JSON.parse(jsonDataOrString);
      return normalizeAuditData(parsed);
    } catch (e) {
      // If that fails, try parsing as multiple JSON objects (yarn format)
      try {
        const parsedLines = parseYarnAuditOutput(jsonDataOrString);
        if (parsedLines.length > 0) {
          return convertYarnAuditToNpm(parsedLines);
        }
      } catch (e2) {
        throw new Error('Failed to parse audit data in any known format');
      }
    }
  }
  
  // If input is already parsed
  if (Array.isArray(jsonDataOrString)) {
    // Assume it's yarn format if it's an array
    return convertYarnAuditToNpm(jsonDataOrString);
  } else {
    // Assume it's npm format
    return jsonDataOrString as AuditReport;
  }
  
  // Default empty report if all else fails
  return {
    vulnerabilities: {},
    metadata: {
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
      dependencies: { prod: 0, dev: 0, optional: 0, peer: 0, peerOptional: 0, total: 0 }
    }
  };
}