# npm-audit-report

Generate beautiful HTML reports from npm audit output. This tool transforms the JSON output from `npm audit --json` into a visually appealing and interactive HTML report that makes it easy to understand your project's security vulnerabilities.

## Features

- Visual representation of vulnerabilities by severity
- Tabbed interface for easy navigation
- Interactive charts using Chart.js
- Detailed vulnerability information
- Recommendations for fixing security issues
- Responsive design that works on mobile and desktop

## Installation

### From GitHub 

With npm:
```bash
npm install --save-dev github:finadeck/npm-audit-report
```

With yarn:
```bash
yarn add --dev github:finadeck/npm-audit-report
```

Or specify a specific version/tag:

```bash
# npm
npm install --save-dev github:finadeck/npm-audit-report#v1.0.0

# yarn
yarn add --dev github:finadeck/npm-audit-report#v1.0.0
```

## Usage

### Basic Usage with npm

Run an npm audit with JSON output and pipe it to the reporter:

```bash
npm audit --json | npm-audit-report
```

### Basic Usage with yarn

Yarn audit also supports JSON output:

```bash
yarn audit --json | npm-audit-report
```

The HTML report will be generated in the `./npm-audit-report` directory by default.

### Using an Input File

You can also save the npm audit output to a file and then use it as input:

```bash
npm audit --json > audit.json
npm-audit-report --input audit.json
```

### Custom Output Directory

```bash
npm audit --json | npm-audit-report --output ./docs/security
```

### Custom Output Filename

```bash
npm audit --json | npm-audit-report --filename audit-report.html
```

### Using in npm/yarn Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "audit:html": "npm audit --json | npm-audit-report --output ./security-reports"
  }
}
```

For yarn projects:

```json
{
  "scripts": {
    "audit:html": "yarn audit --json | npm-audit-report --output ./security-reports"
  }
}
```

Then run:

```bash
# With npm
npm run audit:html

# With yarn
yarn audit:html
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <path>` | Output directory for the HTML report | `./npm-audit-report` |
| `-f, --filename <name>` | Output filename | `index.html` |
| `-i, --input <file>` | Read from JSON file instead of stdin | - |
| `-h, --help` | Display help information | - |
| `-v, --version` | Display version information | - |

## Programmatic Usage

You can also use the library programmatically in your own Node.js applications:

```javascript
const { generateHtmlReport } = require('npm-audit-report');
const fs = require('fs');

// Read your audit data
const auditData = JSON.parse(fs.readFileSync('./audit.json', 'utf8'));

// Generate the HTML report
const htmlReport = generateHtmlReport(auditData);

// Do something with the HTML report
fs.writeFileSync('./security-report.html', htmlReport);
```

## TypeScript Support

This package includes TypeScript definitions:

```typescript
import { generateHtmlReport, AuditReport } from 'npm-audit-report';
import * as fs from 'fs';

const auditData: AuditReport = JSON.parse(fs.readFileSync('./audit.json', 'utf8'));
const htmlReport = generateHtmlReport(auditData);
```

## License

MIT