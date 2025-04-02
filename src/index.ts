import { AuditReport, Vulnerability } from './types';

/**
 * Generates an HTML report from npm audit data
 * @param auditData The parsed npm audit JSON data
 * @returns HTML string containing the formatted report
 */
export function generateHtmlReport(auditData: AuditReport): string {
  const vulnerabilities = Object.entries(auditData.vulnerabilities || {});
  const metadata = auditData.metadata || { 
    vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
    dependencies: { prod: 0, dev: 0, optional: 0, peer: 0, peerOptional: 0, total: 0 }
  };
  
  // Generate vulnerability table rows
  const vulnerabilityRows = vulnerabilities.map(([name, vuln]) => {
    const fixInfo = typeof vuln.fixAvailable === 'object' 
      ? `Yes (${vuln.fixAvailable.name}@${vuln.fixAvailable.version})${vuln.fixAvailable.isSemVerMajor ? ' - Major Update Required' : ''}` 
      : vuln.fixAvailable ? 'Yes' : 'No';
    
    const effectsList = vuln.effects.length 
      ? `<ul>${vuln.effects.map(effect => `<li>${effect}</li>`).join('')}</ul>` 
      : 'None';
    
    const viaList = Array.isArray(vuln.via) && vuln.via.length 
      ? `<ul>${vuln.via.map(v => `<li>${typeof v === 'string' ? v : v.name || JSON.stringify(v)}</li>`).join('')}</ul>` 
      : 'Direct';
    
    return `
      <tr class="severity-${vuln.severity.toLowerCase()}">
        <td>${name}</td>
        <td><span class="badge severity-${vuln.severity.toLowerCase()}">${vuln.severity}</span></td>
        <td>${viaList}</td>
        <td>${effectsList}</td>
        <td>${vuln.range || 'N/A'}</td>
        <td>${fixInfo}</td>
      </tr>
    `;
  }).join('');
  
  // Count vulnerabilities by severity
  const severityCounts = {
    critical: metadata.vulnerabilities.critical || 0,
    high: metadata.vulnerabilities.high || 0,
    moderate: metadata.vulnerabilities.moderate || 0,
    low: metadata.vulnerabilities.low || 0,
    info: metadata.vulnerabilities.info || 0
  };
  
  // Generate severity chart data
  const severityChartData = Object.entries(severityCounts)
    .map(([severity, count]) => ({ severity, count }))
    .filter(item => item.count > 0);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NPM Audit Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    .timestamp {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .summary-boxes {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-box {
      flex: 1;
      min-width: 200px;
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .summary-box h3 {
      margin-top: 0;
      font-size: 1.1em;
      color: #34495e;
    }
    .summary-box .number {
      font-size: 2em;
      font-weight: bold;
      color: #2c3e50;
    }
    .summary-box .label {
      font-size: 0.9em;
      color: #7f8c8d;
    }
    .severity-distribution {
      display: flex;
      margin-top: 15px;
    }
    .severity-bar {
      height: 8px;
      border-radius: 4px;
      margin-right: 1px;
    }
    .severity-critical { background-color: #e74c3c; }
    .severity-high { background-color: #e67e22; }
    .severity-moderate { background-color: #f39c12; }
    .severity-low { background-color: #3498db; }
    .severity-info { background-color: #95a5a6; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }
    th {
      background-color: #34495e;
      color: white;
      text-align: left;
      padding: 12px 15px;
    }
    td {
      padding: 10px 15px;
      border-bottom: 1px solid #ddd;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    tr:hover {
      background-color: #f1f2f6;
    }
    tr.severity-critical td:first-child {
      border-left: 4px solid #e74c3c;
    }
    tr.severity-high td:first-child {
      border-left: 4px solid #e67e22;
    }
    tr.severity-moderate td:first-child {
      border-left: 4px solid #f39c12;
    }
    tr.severity-low td:first-child {
      border-left: 4px solid #3498db;
    }
    tr.severity-info td:first-child {
      border-left: 4px solid #95a5a6;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: bold;
      color: white;
    }
    .badge.severity-critical { background-color: #e74c3c; }
    .badge.severity-high { background-color: #e67e22; }
    .badge.severity-moderate { background-color: #f39c12; }
    .badge.severity-low { background-color: #3498db; }
    .badge.severity-info { background-color: #95a5a6; }
    
    .chart-container {
      margin-bottom: 30px;
      height: 300px;
    }
    footer {
      margin-top: 50px;
      text-align: center;
      font-size: 0.9em;
      color: #7f8c8d;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    ul {
      margin: 0;
      padding-left: 20px;
    }
    .tab {
      overflow: hidden;
      border: 1px solid #ccc;
      background-color: #f1f1f1;
      border-radius: 8px 8px 0 0;
    }
    .tab button {
      background-color: inherit;
      float: left;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 12px 16px;
      transition: 0.3s;
      font-size: 16px;
    }
    .tab button:hover {
      background-color: #ddd;
    }
    .tab button.active {
      background-color: #34495e;
      color: white;
    }
    .tabcontent {
      display: none;
      padding: 20px;
      border: 1px solid #ccc;
      border-top: none;
      border-radius: 0 0 8px 8px;
      animation: fadeEffect 1s;
    }
    @keyframes fadeEffect {
      from {opacity: 0;}
      to {opacity: 1;}
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="report-header">
    <div>
      <h1>NPM Audit Security Report</h1>
      <p class="timestamp">Generated on: ${new Date().toLocaleString()}</p>
    </div>
  </div>
  
  <div class="tab">
    <button class="tablinks active" onclick="openTab(event, 'Overview')">Overview</button>
    <button class="tablinks" onclick="openTab(event, 'Vulnerabilities')">Vulnerabilities</button>
    <button class="tablinks" onclick="openTab(event, 'Recommendations')">Recommendations</button>
  </div>
  
  <div id="Overview" class="tabcontent" style="display: block;">
    <h2>Security Overview</h2>
    
    <div class="summary-boxes">
      <div class="summary-box">
        <h3>Total Vulnerabilities</h3>
        <div class="number">${metadata.vulnerabilities.total}</div>
        <div class="severity-distribution">
          ${severityCounts.critical > 0 ? `<div class="severity-bar severity-critical" style="flex: ${severityCounts.critical}"></div>` : ''}
          ${severityCounts.high > 0 ? `<div class="severity-bar severity-high" style="flex: ${severityCounts.high}"></div>` : ''}
          ${severityCounts.moderate > 0 ? `<div class="severity-bar severity-moderate" style="flex: ${severityCounts.moderate}"></div>` : ''}
          ${severityCounts.low > 0 ? `<div class="severity-bar severity-low" style="flex: ${severityCounts.low}"></div>` : ''}
          ${severityCounts.info > 0 ? `<div class="severity-bar severity-info" style="flex: ${severityCounts.info}"></div>` : ''}
        </div>
      </div>
      
      <div class="summary-box">
        <h3>Dependencies</h3>
        <div class="number">${metadata.dependencies.total}</div>
        <div class="label">
          Production: ${metadata.dependencies.prod} | 
          Development: ${metadata.dependencies.dev}
        </div>
      </div>
    </div>
    
    <div class="chart-container">
      <canvas id="severityChart"></canvas>
    </div>
    
    <h3>Severity Breakdown</h3>
    <table>
      <thead>
        <tr>
          <th>Severity Level</th>
          <th>Count</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr class="severity-critical">
          <td><span class="badge severity-critical">Critical</span></td>
          <td>${severityCounts.critical}</td>
          <td>Vulnerabilities that can be exploited easily, and could lead to system compromise, data loss, or service interruption.</td>
        </tr>
        <tr class="severity-high">
          <td><span class="badge severity-high">High</span></td>
          <td>${severityCounts.high}</td>
          <td>Vulnerabilities that are harder to exploit but could still lead to system compromise.</td>
        </tr>
        <tr class="severity-moderate">
          <td><span class="badge severity-moderate">Moderate</span></td>
          <td>${severityCounts.moderate}</td>
          <td>Vulnerabilities that might be exploited under specific circumstances and could pose some risk.</td>
        </tr>
        <tr class="severity-low">
          <td><span class="badge severity-low">Low</span></td>
          <td>${severityCounts.low}</td>
          <td>Vulnerabilities that are difficult to exploit and would have minimal impact.</td>
        </tr>
        <tr class="severity-info">
          <td><span class="badge severity-info">Info</span></td>
          <td>${severityCounts.info}</td>
          <td>Informational findings that might not represent immediate security risks.</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div id="Vulnerabilities" class="tabcontent">
    <h2>Detailed Vulnerability Report</h2>
    
    ${vulnerabilities.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Severity</th>
          <th>Via</th>
          <th>Effects</th>
          <th>Range</th>
          <th>Fix Available</th>
        </tr>
      </thead>
      <tbody>
        ${vulnerabilityRows}
      </tbody>
    </table>
    ` : '<p>No vulnerabilities found. Great job!</p>'}
  </div>
  
  <div id="Recommendations" class="tabcontent">
    <h2>Recommendations</h2>
    
    ${vulnerabilities.length > 0 ? `
    <h3>Remediation Steps</h3>
    <ol>
      <li>Run <code>npm audit fix</code> to automatically fix vulnerabilities that have compatible updates available.</li>
      <li>For vulnerabilities requiring major version updates, assess the impact of upgrading and run <code>npm audit fix --force</code> if acceptable.</li>
      <li>Review each critical and high severity vulnerability to understand its implications for your application.</li>
      <li>Consider implementing security monitoring and regular auditing as part of your development process.</li>
      <li>Check for unused dependencies that might be introducing vulnerabilities and remove them.</li>
    </ol>
    
    <h3>Priority Fixes</h3>
    <p>Consider addressing these vulnerabilities first:</p>
    <ul>
      ${Object.entries(auditData.vulnerabilities || {})
        .filter(([_, vuln]) => ['critical', 'high'].includes(vuln.severity.toLowerCase()))
        .slice(0, 5)
        .map(([name, vuln]) => `
          <li>
            <strong>${name}</strong> - ${vuln.severity} severity
            ${typeof vuln.fixAvailable === 'object' 
              ? ` - Fix available with <code>npm install ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}</code>` 
              : vuln.fixAvailable ? ' - Run <code>npm audit fix</code>' : ' - No automatic fix available'}
          </li>
        `).join('')}
    </ul>
    ` : '<p>Your project looks secure! Here are some suggestions to maintain security:</p><ul><li>Continue running regular security audits</li><li>Keep dependencies up-to-date</li><li>Consider setting up automated dependency updates with tools like Dependabot</li><li>Set up security monitoring in your CI/CD pipeline</li></ul>'}
  </div>

  <footer>
    <p>Generated with npm-audit-report | ${new Date().toLocaleDateString()}</p>
  </footer>

  <script>
    // Initialize severity chart
    const ctx = document.getElementById('severityChart').getContext('2d');
    const severityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(severityChartData.map(item => item.severity.charAt(0).toUpperCase() + item.severity.slice(1)))},
        datasets: [{
          label: 'Vulnerabilities by Severity',
          data: ${JSON.stringify(severityChartData.map(item => item.count))},
          backgroundColor: [
            '#e74c3c', // critical
            '#e67e22', // high
            '#f39c12', // moderate
            '#3498db', // low
            '#95a5a6'  // info
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    function openTab(evt, tabName) {
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      document.getElementById(tabName).style.display = "block";
      evt.currentTarget.className += " active";
    }
  </script>
</body>
</html>
  `;
}