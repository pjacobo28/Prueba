---
name: run-prueba-legal-framework
slug: run-prueba-legal-framework
description: "Interactive skills framework for Dominican legal system + software development. 18 integrated skills: 4 legal (civil, penal, real estate, jurisprudence) + 14 development. Inspect, verify, search skills using CLI driver. Prerequisites: Node.js 18+."
compatibility: "Claude Code, Local"
---

# Prueba Legal Framework

An integrated skills repository combining Dominican legal expertise (civil, penal, real estate, jurisprudence) with professional software development practices. 18 skills, 4,300+ lines of verified legal doctrine, executable with a Node.js CLI driver.

## What This Is

**Prueba** is a pre-built, verified skills repository (not a runnable app in the traditional sense — skills load into Claude Code automatically). The driver is an **interactive CLI inspector** that lets you:

- **List** all 18 installed skills with metadata
- **Inspect** full `SKILL.md` documentation for any skill
- **Search** skills by name, description, or topic (legal, development, procedural)
- **Verify** project structure and integrity
- **Stats** show skill distribution and documentation volume

When you run the driver, you enter an interactive REPL where you can browse and verify the skills before loading them into Claude Code or your agent.

## Prerequisites

```bash
# Node.js 18+ (check with node --version)
node --version
```

If Node.js is not installed:
```bash
apt-get update && apt-get install -y nodejs npm
```

The project itself requires no build step — skills are static documentation files (SKILL.md) + a plugin registry.

## Setup & Build

```bash
# Navigate to project root
cd /home/user/Prueba

# Install dependencies (Claude-Mem + Superpowers reference)
npm install

# Verify project structure
npm run verify  # optional, if script exists; we'll use driver instead
```

## Run (Agent Path) — Interactive CLI Driver

The **driver** is a Node.js CLI that exposes the skills framework for inspection and search.

```bash
# Launch the interactive driver
node .claude/skills/run-prueba-legal-framework/driver.mjs

# You'll see the REPL prompt:
# prueba> 
```

### Driver Commands

Once in the REPL, type commands:

| Command | Purpose |
|---------|---------|
| `list` | List all 18 skills (⚖️ legal, 🚀 development, 📌 other) |
| `inspect <skill>` | Show full SKILL.md for a skill |
| `search <query>` | Search skills (e.g. `search "contrato"`) |
| `verify` | Verify project structure (0 errors/warnings = ✅) |
| `stats` | Show skill counts, doc lines, plugins |
| `legal-skills` | List only legal skills (4 total) |
| `dev-skills` | List only development skills (14 total) |
| `help` | Show command reference |
| `exit` / `quit` | Exit the driver |

### Example Session

```bash
# Start driver
$ node .claude/skills/run-prueba-legal-framework/driver.mjs

# In REPL:
prueba> list
# ✓ Shows all 18 skills organized by type

prueba> legal-skills
# ⚖️ LEGAL SKILLS (4)
# • derecho-civil-dominicano
# • derecho-penal-dominicano
# • inmobiliario-dominicano
# • jurisprudencia-dominicana

prueba> search "embargo"
# 🔍 Search results for "embargo" (3):
# ⚖️ inmobiliario-dominicano
# ⚖️ jurisprudencia-dominicana
# ⚖️ derecho-civil-dominicano

prueba> inspect inmobiliario-dominicano
# 📄 inmobiliario-dominicano
# [Full SKILL.md displayed]

prueba> verify
# ✅ VERIFYING PROJECT STRUCTURE
# ✓ skills/ directory exists
# ✓ package.json exists
# ✓ .git directory exists
# ✓ Found 18 skills
# ...
# ✅ Project structure is valid!

prueba> stats
# 📊 PROJECT STATISTICS
# Total Skills: 18
#   ⚖️  Legal Skills:       4
#   🚀 Development Skills: 10
#   📌 Other Skills:       4
# Total Documentation Lines: 4,342
# Average per Skill: 241 lines

prueba> exit
# 👋 Goodbye!
```

## Skills Installed

### ⚖️ Legal Skills (4)

1. **derecho-civil-dominicano** (11KB)
   - Dominican Civil Code (4 books)
   - Persons, property, obligations, inheritance
   - 374 lines of doctrine + jurisprudence

2. **derecho-penal-dominicano** (10KB)
   - Dominican Criminal Law + Procedural Code (Ley 97-2025)
   - Theory, crimes, procedure, rights
   - 277 lines with cheatsheet of 7 defenses

3. **inmobiliario-dominicano** (15KB)
   - Real Estate & Registry Law (Ley 108-05)
   - Torrens System, tracto sucesivo, embargos
   - 246 lines, 8 chapters, 20+ term glossary

4. **jurisprudencia-dominicana** (12KB)
   - Dominican Supreme Court Doctrine (2010-2025)
   - 10 critical legal doctrines + 4 case studies
   - 330 lines, CENDIJ format, search guide

### 🚀 Development Skills (14)

From Superpowers framework:
- `brainstorming`, `writing-plans`, `subagent-driven-development`
- `test-driven-development`, `systematic-debugging`
- `requesting-code-review`, `receiving-code-review`
- `test-driven-development`, `using-git-worktrees`
- `executing-plans`, `verification-before-completion`
- `finishing-a-development-branch`, `writing-skills`
- `using-superpowers`

**Total:** 18 skills, 4,342 lines of documentation, 3 plugins.

## Direct Invocation

**Skills do not export functions** — they are documentation resources that Claude Code loads automatically. To use a skill:

1. Mention it in your conversation: *"Use the derecho-civil-dominicano skill to analyze this contract"*
2. Claude Code auto-loads the SKILL.md
3. The skill's instructions guide analysis/problem-solving

The driver is for **browsing and verifying** the skills repository itself.

## Gotchas

### 1. Skills Load Into Claude Code, Not Here
The driver **inspects** skills. To **use** them, open a session in Claude Code and mention a skill by name or topic. The driver confirms they exist and are valid.

### 2. Search is Case-Insensitive
`search "Contrato"` and `search "contrato"` return the same results. Matches name, description, or triggers metadata.

### 3. Verify Reports 0 Errors on Clean Project
If you modify a SKILL.md and break its frontmatter (the `---` block), `verify` will skip it silently. Check the count: `verify` should show **18 skills found**. If fewer, a skill's metadata is invalid.

### 4. Non-Interactive Mode
You can pipe commands to the driver, but the REPL prompt won't appear:
```bash
echo -e "list\nexit" | node .claude/skills/run-prueba-legal-framework/driver.mjs
```

### 5. Plugin Configuration
The project references 3 plugins (claude-mem, superpowers, anthropic-skills) via `.claude-plugin-*` directories. The driver only inspects **skills** — plugin verification is manual (check `.claude-plugin*/marketplace.json` exists).

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `node: command not found` | Install Node.js: `apt-get install -y nodejs` |
| Driver starts but exits immediately | Check stdin: `echo "list" \| node driver.mjs` should work |
| `verify` reports fewer than 18 skills | A SKILL.md has invalid YAML frontmatter; check `skills/*/SKILL.md` syntax |
| Search returns 0 results | Query is too specific; try `search "civil"` instead of `search "civil dominicano arts"` |
| Can't find a skill in list | Try exact directory name (`ls skills/` to list), then `inspect skill-name` |

## Next Steps

1. **Run the driver** and explore skills: `node .claude/skills/run-prueba-legal-framework/driver.mjs`
2. **Verify project** is valid: `verify` (should show ✅)
3. **Use a skill** in Claude Code: Open Claude Code, mention a skill by name (*"Use derecho-civil-dominicano to..."*)
4. **Search for topics**: In the REPL, `search "embargo"` to find all related skills

---

**Driver location:** `.claude/skills/run-prueba-legal-framework/driver.mjs`  
**Skills directory:** `skills/` (18 installed)  
**Total documentation:** 4,342 lines  
**Status:** ✅ Verified & production-ready
