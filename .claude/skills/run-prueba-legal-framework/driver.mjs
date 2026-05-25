#!/usr/bin/env node

/**
 * Prueba Legal Framework Driver
 *
 * Interactive CLI to inspect, verify, and work with the integrated
 * legal + development skills framework.
 *
 * Commands:
 *   list              - List all skills with metadata
 *   inspect <skill>   - Show full SKILL.md for a skill
 *   search <query>    - Search skills by name/description/topic
 *   verify            - Verify project structure and skill validity
 *   stats             - Show project statistics
 *   legal-skills      - List only legal skills
 *   dev-skills        - List only development skills
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

// ============================================================================
// SKILL DISCOVERY
// ============================================================================

function discoverSkills() {
  const skillsDir = path.join(projectRoot, 'skills');
  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const skills = [];

  for (const dir of skillDirs) {
    const skillPath = path.join(skillsDir, dir, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, 'utf-8');
      const metadata = parseSkillMetadata(content);
      skills.push({
        name: dir,
        path: skillPath,
        ...metadata,
      });
    }
  }

  return skills;
}

function parseSkillMetadata(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return { name: 'Unknown', description: '' };

  const frontmatter = frontmatterMatch[1];
  const metadata = {};

  // Parse YAML-like frontmatter
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      metadata[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return metadata;
}

// ============================================================================
// SKILL CLASSIFICATION
// ============================================================================

function classifySkill(skillName) {
  const legalKeywords = ['derecho', 'civil', 'penal', 'inmobiliario', 'jurisprudencia', 'legal'];
  const devKeywords = ['plan', 'brainstorm', 'debug', 'test', 'subagent', 'execution', 'review', 'skill', 'git'];

  const isLegal = legalKeywords.some(k => skillName.toLowerCase().includes(k));
  const isDev = devKeywords.some(k => skillName.toLowerCase().includes(k));

  if (isLegal) return 'LEGAL';
  if (isDev) return 'DEVELOPMENT';
  return 'OTHER';
}

// ============================================================================
// COMMANDS
// ============================================================================

function cmdList(skills, args) {
  console.log('\n📚 PRUEBA LEGAL FRAMEWORK - SKILLS DIRECTORY\n');

  const byType = { LEGAL: [], DEVELOPMENT: [], OTHER: [] };

  for (const skill of skills) {
    const type = classifySkill(skill.name);
    byType[type].push(skill);
  }

  // Legal skills
  if (byType.LEGAL.length > 0) {
    console.log('⚖️  LEGAL SKILLS (4)');
    for (const skill of byType.LEGAL) {
      const desc = skill.description || '(no description)';
      console.log(`  • ${skill.name.padEnd(30)} — ${desc}`);
    }
    console.log('');
  }

  // Development skills
  if (byType.DEVELOPMENT.length > 0) {
    console.log('🚀 DEVELOPMENT SKILLS (14)');
    for (const skill of byType.DEVELOPMENT) {
      const desc = skill.description || '(no description)';
      console.log(`  • ${skill.name.padEnd(30)} — ${desc}`);
    }
    console.log('');
  }

  // Other skills
  if (byType.OTHER.length > 0) {
    console.log('📌 OTHER SKILLS');
    for (const skill of byType.OTHER) {
      const desc = skill.description || '(no description)';
      console.log(`  • ${skill.name.padEnd(30)} — ${desc}`);
    }
    console.log('');
  }

  console.log(`Total: ${skills.length} skills installed\n`);
}

function cmdInspect(skills, args) {
  if (!args[1]) {
    console.log('Usage: inspect <skill-name>\n');
    console.log('Available skills:');
    for (const skill of skills) {
      console.log(`  • ${skill.name}`);
    }
    return;
  }

  const skillName = args[1];
  const skill = skills.find(s => s.name === skillName);

  if (!skill) {
    console.error(`❌ Skill not found: ${skillName}\n`);
    return;
  }

  console.log(`\n📄 ${skill.name}\n`);
  const content = fs.readFileSync(skill.path, 'utf-8');
  console.log(content);
}

function cmdSearch(skills, args) {
  if (!args[1]) {
    console.log('Usage: search <query>\n');
    return;
  }

  const query = args.slice(1).join(' ').toLowerCase();
  const results = skills.filter(skill =>
    skill.name.toLowerCase().includes(query) ||
    (skill.description && skill.description.toLowerCase().includes(query)) ||
    (skill.triggers && skill.triggers.toLowerCase().includes(query))
  );

  if (results.length === 0) {
    console.log(`\n❌ No skills found matching: "${query}"\n`);
    return;
  }

  console.log(`\n🔍 Search results for "${query}" (${results.length}):\n`);
  for (const skill of results) {
    const type = classifySkill(skill.name);
    const typeIcon = type === 'LEGAL' ? '⚖️ ' : type === 'DEVELOPMENT' ? '🚀 ' : '📌 ';
    console.log(`${typeIcon}${skill.name}`);
    if (skill.description) {
      console.log(`   ${skill.description}`);
    }
  }
  console.log('');
}

function cmdLegalSkills(skills, args) {
  const legal = skills.filter(s => classifySkill(s.name) === 'LEGAL');
  console.log(`\n⚖️  LEGAL SKILLS (${legal.length})\n`);

  for (const skill of legal) {
    console.log(`• ${skill.name}`);
    if (skill.description) {
      console.log(`  ${skill.description}`);
    }
    console.log('');
  }
}

function cmdDevSkills(skills, args) {
  const dev = skills.filter(s => classifySkill(s.name) === 'DEVELOPMENT');
  console.log(`\n🚀 DEVELOPMENT SKILLS (${dev.length})\n`);

  for (const skill of dev) {
    console.log(`• ${skill.name}`);
    if (skill.description) {
      console.log(`  ${skill.description}`);
    }
    console.log('');
  }
}

function cmdVerify(skills, args) {
  console.log('\n✅ VERIFYING PROJECT STRUCTURE\n');

  let errors = 0;
  let warnings = 0;

  // Check skills directory
  const skillsDir = path.join(projectRoot, 'skills');
  if (!fs.existsSync(skillsDir)) {
    console.error('❌ skills/ directory not found');
    errors++;
  } else {
    console.log('✓ skills/ directory exists');
  }

  // Check package.json
  const pkgPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.warn('⚠ package.json not found');
    warnings++;
  } else {
    console.log('✓ package.json exists');
  }

  // Check .git
  const gitDir = path.join(projectRoot, '.git');
  if (!fs.existsSync(gitDir)) {
    console.warn('⚠ .git directory not found');
    warnings++;
  } else {
    console.log('✓ .git directory exists');
  }

  // Verify each skill
  console.log(`\n✓ Found ${skills.length} skills:\n`);
  for (const skill of skills) {
    if (!fs.existsSync(skill.path)) {
      console.error(`  ❌ ${skill.name} — SKILL.md not found`);
      errors++;
    } else {
      const type = classifySkill(skill.name);
      const typeIcon = type === 'LEGAL' ? '⚖️ ' : type === 'DEVELOPMENT' ? '🚀 ' : '📌 ';
      console.log(`  ✓ ${typeIcon}${skill.name.padEnd(35)} — ${skill.description || '(no description)'}`);
    }
  }

  console.log(`\n📊 Summary: ${skills.length} skills, ${errors} errors, ${warnings} warnings\n`);

  if (errors === 0 && warnings === 0) {
    console.log('✅ Project structure is valid!\n');
  } else {
    console.log(`⚠ Project has ${errors} error(s) and ${warnings} warning(s)\n`);
  }
}

function cmdStats(skills, args) {
  const legal = skills.filter(s => classifySkill(s.name) === 'LEGAL');
  const dev = skills.filter(s => classifySkill(s.name) === 'DEVELOPMENT');
  const other = skills.filter(s => classifySkill(s.name) === 'OTHER');

  console.log('\n📊 PROJECT STATISTICS\n');
  console.log(`Total Skills: ${skills.length}`);
  console.log(`  ⚖️  Legal Skills:       ${legal.length}`);
  console.log(`  🚀 Development Skills: ${dev.length}`);
  console.log(`  📌 Other Skills:       ${other.length}`);

  // Calculate total lines
  let totalLines = 0;
  for (const skill of skills) {
    try {
      const content = fs.readFileSync(skill.path, 'utf-8');
      totalLines += content.split('\n').length;
    } catch (e) {
      // ignore
    }
  }

  console.log(`\nTotal Documentation Lines: ${totalLines.toLocaleString()}`);
  console.log(`Average per Skill: ${Math.round(totalLines / skills.length)} lines`);

  // Plugins
  const pluginDirs = [
    '.claude-plugin',
    '.claude-plugin-superpowers',
    '.claude-plugin-anthropic-skills'
  ];

  let pluginCount = 0;
  for (const dir of pluginDirs) {
    if (fs.existsSync(path.join(projectRoot, dir))) {
      pluginCount++;
    }
  }

  console.log(`\nPlugins Configured: ${pluginCount}`);
  console.log('  • Claude-Mem');
  console.log('  • Superpowers');
  console.log('  • Anthropic Skills');

  console.log('\n');
}

function cmdHelp() {
  console.log(`
🚀 PRUEBA LEGAL FRAMEWORK - INTERACTIVE DRIVER

Commands:
  list                - List all installed skills
  inspect <skill>     - Display full SKILL.md for a skill
  search <query>      - Search skills by name/description
  verify              - Verify project structure and integrity
  stats               - Show project statistics
  legal-skills        - List legal skills only
  dev-skills          - List development skills only
  help                - Show this help message
  exit/quit           - Exit the driver

Examples:
  list
  inspect derecho-civil-dominicano
  search "contrato"
  search "TDD"
  verify
  stats
  legal-skills
  dev-skills

`);
}

// ============================================================================
// MAIN REPL
// ============================================================================

async function main() {
  const skills = discoverSkills();

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║       🏛️  PRUEBA LEGAL FRAMEWORK - SKILLS INSPECTOR 🚀         ║
║                                                                ║
║  Dominican Law + Software Development Skills Integration      ║
║  Type 'help' for commands, 'exit' to quit                     ║
╚════════════════════════════════════════════════════════════════╝
`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const prompt = () => {
    rl.question('prueba> ', (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        prompt();
        return;
      }

      const [cmd, ...args] = trimmed.split(/\s+/);

      switch (cmd.toLowerCase()) {
        case 'list':
          cmdList(skills, args);
          break;
        case 'inspect':
          cmdInspect(skills, [cmd, ...args]);
          break;
        case 'search':
          cmdSearch(skills, [cmd, ...args]);
          break;
        case 'verify':
          cmdVerify(skills, args);
          break;
        case 'stats':
          cmdStats(skills, args);
          break;
        case 'legal-skills':
          cmdLegalSkills(skills, args);
          break;
        case 'dev-skills':
          cmdDevSkills(skills, args);
          break;
        case 'help':
          cmdHelp();
          break;
        case 'exit':
        case 'quit':
          console.log('\n👋 Goodbye!\n');
          rl.close();
          return;
        default:
          console.log(`❌ Unknown command: ${cmd}\nType 'help' for available commands.\n`);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
