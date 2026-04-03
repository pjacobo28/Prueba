# 🤖 GitHub Automation & CI/CD Configuration

## 📁 Estructura

```
.github/
├── workflows/
│   ├── ci.yml              # Pipeline principal de CI/CD
│   └── security.yml        # Análisis de seguridad avanzado
├── ISSUE_TEMPLATE/
│   ├── bug_report.md       # Template para reportar bugs
│   └── feature_request.md  # Template para features
├── dependabot.yml          # Configuración de Dependabot
├── CODEOWNERS              # Asignación automática de reviews
├── pull_request_template.md # Template para PRs
└── README.md               # Este archivo
```

## 🚀 Workflows Automatizados

### 🔷 CI/CD Pipeline (`ci.yml`)

Se ejecuta en **push** y **pull_request** en:
- `main`
- `claude/install-context7-plugin-a01Ck`

**Etapas:**
1. **Setup & Install** - Instala dependencias
2. **Type Check** - Valida tipos TypeScript
3. **Tests & Coverage** - Ejecuta suite de tests
4. **Security Validators** - Verifica OWASP/GDPR/CCPA
5. **Build** - Construye el proyecto
6. **Summary** - Resumen de resultados

**Resultado:**
- ✅ Si pasa: PR puede hacerse merge
- ❌ Si falla: Indica qué revisar

---

### 🔐 Security Analysis (`security.yml`)

Se ejecuta:
- **On push/PR** en las ramas especificadas
- **Daily** a las 2 AM UTC

**Análisis:**
1. **CodeQL** (SAST) - Escanea vulnerabilidades en código TypeScript
2. **Dependencies** (SCA) - Verifica npm packages
3. **Secret Detection** - Busca API keys/tokens/passwords
4. **Custom Security** - Valida OWASP/GDPR/CCPA
5. **License Check** - Verifica licencias de dependencies
6. **Security Summary** - Reporte final

---

## 📦 Dependabot Configuration

**Actualiza automáticamente:**
- ✅ npm packages (producción y desarrollo)
- ✅ GitHub Actions

**Frecuencia:** 
- Weekly (lunes a las 3 AM)

**Auto-merge:**
- Parches y menores en development ✅
- Parches en production ✅

**Notificación:**
- Asignado a: @pjacobo28
- Etiquetas: dependencies, npm, github-actions

---

## 👥 Code Owners

Automáticamente asigna reviews a:
- `@pjacobo28` (propietario global)

Archivos específicos:
- `/src/types/legal.ts` → Domain types
- `/src/security/validators.ts` → Security validators
- `/src/api/api.ts` → REST API
- `/tests/` → Test suites
- `/.github/` → Automation

---

## 📝 Templates

### Bug Report
Úsalo para reportar bugs:
- Pasos para reproducir
- Comportamiento esperado vs actual
- Detalles de seguridad

### Feature Request
Para sugerir features nuevas:
- Descripción completa
- Beneficios
- Impacto en seguridad

### Pull Request
Automáticamente aplicado a todos los PRs:
- Checklist de validación
- Coverage requirements
- Security checks

---

## ✅ Requisitos para Merge

Toda PR **debe pasar**:

✅ **CI Pipeline**
- Type checking
- Todos los tests (72 tests)
- Coverage >= 80%
- Security validators

✅ **Security Scans**
- CodeQL analysis
- Dependabot checks
- No secrets detectados

✅ **Code Review**
- Aprobación del propietario (@pjacobo28)
- Checklist completado

---

## 🔒 Secrets Management

**Secrets configurados en GitHub:**

| Nombre | Uso | Visibilidad |
|--------|-----|-------------|
| `GITGUARDIAN_API_KEY` | Secret scanning | Solo GitHub |
| `CODECOV_TOKEN` | Coverage reports | Solo workflows |

**Cómo agregar nuevo secret:**
1. Ir a Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Nombre (MAYÚSCULAS_CON_GUIONES)
4. Valor
5. Usar en workflows como: `${{ secrets.MI_SECRET }}`

---

## 📊 Monitoreo

### 🔍 CodeQL Results
- Ir a **Security** tab → **Code scanning**
- Ver vulnerabilidades encontradas
- Auto-linked con PRs

### 📈 Coverage Reports
- Cada PR muestra coverage
- Integración con Codecov
- Histórico en Coverage tab

### 📋 Dependabot Updates
- Ver en **Pull requests**
- Auto-merge algunos PRs
- Notificaciones a @pjacobo28

---

## 🛠️ Troubleshooting

### CI Pipeline falla
1. Lee los logs en **Actions** tab
2. Revisa qué etapa falló
3. Ejecuta localmente: `npm run test:coverage`

### Secret detectado
1. **INMEDIATAMENTE**: Revoca el secret
2. Crea nuevo secret
3. Espera a que GitGuardian escanee
4. Reintenta el push

### Dependabot no actualiza
1. Verifica `.github/dependabot.yml`
2. Verifica permisos en el repo
3. Abre issue en GitHub

---

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://codeql.github.com/)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [Security Best Practices](https://docs.github.com/en/code-security)

---

## 👤 Contacto

Para preguntas o issues con los workflows:
- Abre un issue con etiqueta `github-actions`
- O contacta a @pjacobo28
