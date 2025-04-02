#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';
import { generateHtmlReport } from './index';
import { AuditReport } from './types';
import { normalizeAuditData } from './adapter';

// Helper function to read from stdin
function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

async function main() {
  program
    .name('npm-audit-report')
    .description('Generate HTML reports from npm audit JSON output')
    .version(require('../package.json').version)
    .option('-o, --output <path>', 'Output directory for the HTML report', './npm-audit-report')
    .option('-f, --filename <name>', 'Output filename', 'index.html')
    .option('-i, --input <file>', 'Read from JSON file instead of stdin')
    .parse(process.argv);

  const options = program.opts();
  
  try {
    // Determine if input is from a file or stdin
    let auditData: string;
    
    if (options.input) {
      console.error(`Reading npm audit data from file: ${options.input}`);
      auditData = fs.readFileSync(options.input, 'utf8');
    } else {
      // Check if stdin is being piped
      if (process.stdin.isTTY) {
        console.error('Error: No piped input detected.');
        console.error('Usage: npm audit --json | npm-audit-report');
        console.error('Alternative: npm-audit-report --input audit.json');
        process.exit(1);
      }
      
      console.error('Reading npm audit data from stdin...');
      auditData = await readStdin();
    }
    
    console.error('Parsing audit data...');
    let auditReport: AuditReport;
    
    try {
      // Pass the raw string data to the normalizer which will handle both npm and yarn formats
      auditReport = normalizeAuditData(auditData);
    } catch (error: any) {
      console.error('Failed to parse audit output. Input is not valid JSON or in unknown format.');
      console.error('Error details:', error.message || String(error));
      console.error('Please ensure you are running either:');
      console.error('  npm audit --json | npm-audit-report');
      console.error('  yarn audit --json | npm-audit-report');
      process.exit(1);
    }
    
    console.error('Generating HTML report...');
    const html = generateHtmlReport(auditReport);
    
    // Ensure output directory exists
    const outputDir = path.resolve(process.cwd(), options.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, options.filename);
    fs.writeFileSync(outputPath, html);
    
    console.error(`Report generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error('Error processing npm audit data:', error);
    process.exit(1);
  }
}

// Execute the script
main();