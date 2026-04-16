# Prueba

Project with Claude Code plugins and skills installed.

## Plugins Installed

### 1. Claude-Mem
Persistent memory compression system for Claude Code.

**Features:**
- **Persistent Memory** - Context survives across sessions
- **Progressive Disclosure** - Layered memory retrieval with token cost visibility
- **Skill-Based Search** - Query your project history with mem-search skill
- **Web Viewer UI** - Real-time memory stream
- **Privacy Control** - Use `<private>` tags to exclude sensitive content from storage
- **Context Configuration** - Fine-grained control over what context gets injected

**Repository:** https://github.com/thedotmack/claude-mem

### 2. Superpowers
Complete software development workflow for coding agents.

**Features:**
- **Specification Refinement** - Asks what you're trying to do before jumping to code
- **Design Review** - Shows design in readable chunks for approval
- **Implementation Planning** - Clear plan following TDD and YAGNI principles
- **Subagent-Driven Development** - Agents work autonomously through tasks with review
- **Composable Skills** - Set of reusable skills for common development tasks

**Repository:** https://github.com/obra/superpowers

### 3. Anthropic Skills
Official Anthropic implementation of skills for Claude - a comprehensive library of pre-built skills for various tasks.

**Available Skills (17):**
- **Creative & Design**: algorithmic-art, brand-guidelines, canvas-design, frontend-design, slack-gif-creator, theme-factory
- **Development & Technical**: claude-api, mcp-builder, skill-creator, webapp-testing, web-artifacts-builder
- **Enterprise & Communication**: internal-comms, doc-coauthoring
- **Document Skills**: docx, pdf, pptx, xlsx

**Features:**
- Pre-built skills for immediate use
- Open source (Apache 2.0) + source-available document skills
- Self-contained skills with instructions and metadata
- Pattern reference for creating custom skills
- Full agent skills standard specification

**Repository:** https://github.com/anthropics/skills
