#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const commander_1 = require("commander");
const index_1 = require("./index");
const adapter_1 = require("./adapter");
// Helper function to read from stdin
function readStdin() {
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
    commander_1.program
        .name('npm-audit-report')
        .description('Generate HTML reports from npm audit JSON output')
        .version(require('../package.json').version)
        .option('-o, --output <path>', 'Output directory for the HTML report', './npm-audit-report')
        .option('-f, --filename <name>', 'Output filename', 'index.html')
        .option('-i, --input <file>', 'Read from JSON file instead of stdin')
        .parse(process.argv);
    const options = commander_1.program.opts();
    try {
        // Determine if input is from a file or stdin
        let auditData;
        if (options.input) {
            console.error(`Reading npm audit data from file: ${options.input}`);
            auditData = fs.readFileSync(options.input, 'utf8');
        }
        else {
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
        let auditReport;
        try {
            // Pass the raw string data to the normalizer which will handle both npm and yarn formats
            auditReport = (0, adapter_1.normalizeAuditData)(auditData);
        }
        catch (error) {
            console.error('Failed to parse audit output. Input is not valid JSON or in unknown format.');
            console.error('Error details:', error.message || String(error));
            console.error('Please ensure you are running either:');
            console.error('  npm audit --json | npm-audit-report');
            console.error('  yarn audit --json | npm-audit-report');
            process.exit(1);
        }
        console.error('Generating HTML report...');
        const html = (0, index_1.generateHtmlReport)(auditReport);
        // Ensure output directory exists
        const outputDir = path.resolve(process.cwd(), options.output);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, options.filename);
        fs.writeFileSync(outputPath, html);
        console.error(`Report generated successfully at: ${outputPath}`);
    }
    catch (error) {
        console.error('Error processing npm audit data:', error);
        process.exit(1);
    }
}
// Execute the script
main();
//# sourceMappingURL=cli.js.map