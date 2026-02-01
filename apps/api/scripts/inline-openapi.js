#!/usr/bin/env node
/**
 * Inline OpenAPI YAML into a TypeScript file.
 * Usage: node scripts/inline-openapi.js <yaml-path> <output-ts-path>
 */
const fs = require('fs');
const path = require('path');

const [yamlPath, outputPath] = process.argv.slice(2);

if (!yamlPath || !outputPath) {
  console.error('Usage: node inline-openapi.js <yaml-path> <output-ts-path>');
  process.exit(1);
}

const resolvedYaml = path.resolve(yamlPath);
const resolvedOutput = path.resolve(outputPath);

if (!fs.existsSync(resolvedYaml)) {
  console.error(`Error: YAML file not found: ${resolvedYaml}`);
  process.exit(1);
}

const yamlContent = fs.readFileSync(resolvedYaml, 'utf8');

// Escape backticks and backslashes for template literal (but not $ since it's static content)
const escaped = yamlContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`');

const tsContent = `/**
 * Auto-generated OpenAPI spec (inlined from ${path.basename(yamlPath)})
 * DO NOT EDIT - regenerate with: npm run predev
 */
export const openApiYaml = \`${escaped}\`;
`;

fs.writeFileSync(resolvedOutput, tsContent, 'utf8');
console.log(`Generated ${resolvedOutput} from ${resolvedYaml}`);
