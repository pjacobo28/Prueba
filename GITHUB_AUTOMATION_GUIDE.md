# 🚀 GitHub Automation Complete Guide

## 📊 Arquitectura de Automation

```
┌─────────────────────────────────────────────────────────────┐
│                     GIT PUSH / PULL REQUEST                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─────────────────────────────────────────┐
                 │                                         │
         ┌───────▼────────┐                        ┌──────▼────────┐
         │  CI/CD PIPELINE │                        │ SECURITY SCAN  │
         │   (ci.yml)      │                        │ (security.yml) │
         └───────┬────────┘                        └──────┬────────┘
                 │                                         │
                 ├──────────────┬─────────────────────────┤
                 │              │                         │
         ┌───────▼──────┐  ┌───▼────────────┐  ┌────────▼─────────┐
         │ Type Check   │  │ Tests & Cov    │  │ CodeQL (SAST)    │
         │ (TypeScript) │  │ (Jest 80%)     │  │ (Vuln Detection) │
         └──────────────┘  └────────────────┘  └──────────────────┘
                 │              │                         │
         ┌───────▼──────┐  ┌───▼────────────┐  ┌────────▼─────────┐
         │ Build        │  │ Security Val   │  │ SCA (npm audit)  │
         │ (TypeScript) │  │ (OWASP/GDPR)   │  │ (Dependency)     │
         └──────────────┘  └────────────────┘  └──────────────────┘
                 │              │                         │
                 └──────────────┼─────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  ALL CHECKS PASSED?   │
                    └───────────┬───────────┘
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
            ✅ YES                        ❌ NO
                  │                           │
         ┌────────▼──────────┐    ┌─────────▼─────────┐
         │ Can Merge PR      │    │ Block Merge       │
         │ Manual approval   │    │ Fix issues needed │
         │ Still required    │    │ Re-run checks     │
         └───────────────────┘    └───────────────────┘
```

---

## 🔄 Workflow en Tiempo Real

### Escenario: Hacer push a rama

```bash
$ git push origin feature-branch
```

**¿Qué pasa automáticamente?**

1. **Inmediatamente** (2-3 segundos después)
   - GitHub detecta el push
   - Inicia todos los workflows

2. **Paralelo - Setup & Dependencies** (30s)
   ```
   npm ci
   └─ Instala dependencias exactas de package-lock.json
   ```

3. **Paralelo - Type Check** (10s)
   ```
   npm run type-check
   ├─ Verifica tipos TypeScript
   ├─ Sin errores de tipo
   └─ Strict mode activado
   ```

4. **Paralelo - Tests & Coverage** (15s)
   ```
   npm run test:coverage
   ├─ 72 tests ejecutados
   ├─ 84.48% cobertura global
   └─ Reporte en PR + Codecov
   ```

5. **Paralelo - Security Validators** (10s)
   ```
   npm test -- --testPathPattern=security
   ├─ OWASP Top 10: ✓
   ├─ GDPR Art 15-21: ✓
   └─ CCPA Rights: ✓
   ```

6. **En paralelo - CodeQL Security Scan** (45s)
   ```
   CodeQL Analysis
   ├─ JavaScript/TypeScript
   ├─ Busca vulnerabilidades
   └─ Genera reporte
   ```

7. **En paralelo - Dependencies Check** (20s)
   ```
   npm audit
   ├─ Escanea todas las deps
   ├─ Busca vulnerabilidades
   └─ Reporta riesgos
   ```

8. **En paralelo - Secret Detection** (30s)
   ```
   GitGuardian Scan
   ├─ Busca API keys
   ├─ Busca passwords
   └─ Busca tokens
   ```

9. **Summary** (5s)
   ```
   ✅ ALL CHECKS PASSED
   o
   ❌ FAILED - See details above
   ```

**Tiempo total: ~1-2 minutos**

---

## 🎯 Estados en GitHub

### 📊 Actions Tab

```
Workflow Name         Status    Duration
─────────────────────────────────────────
CI/CD Pipeline        ✅ Pass   1m 23s
Security Analysis     ✅ Pass   2m 15s
Dependabot Update     🔄 Run    In Progress
```

### 🔍 Cada Workflow Tiene:

```
✅ Setup & Install          ✅ 30s
✅ Type Check               ✅ 10s
✅ Tests & Coverage         ✅ 15s
✅ Security Validators      ✅ 10s
✅ Build                    ✅ 8s
✅ Summary                  ✅ 2s
```

### 📝 PR Details

```
All checks have passed
├─ ✅ CI/CD Pipeline (legal-tech-stack)
├─ ✅ Security Analysis (legal-tech-stack)
├─ ✅ Dependabot (if applicable)
└─ ✅ Ready to merge (requires approval)
```

---

## 📋 Checklist: Qué Valida Cada Paso

### ✅ Type Check
```
□ Sin errores de tipos
□ TypeScript strict mode
□ Tipos correctos en interfaces
□ Sem imports faltantes
□ Sin `any` types
```

### ✅ Tests
```
□ 72/72 tests pasan
□ Coverage >= 80%
  ├─ Statements: 84.48%
  ├─ Branches: 86.3%
  ├─ Functions: 94.87%
  └─ Lines: 84.88%
□ Sin tests skipped
□ Sin warnings
```

### ✅ Security
```
□ OWASP Top 10: ✓
  ├─ A01: Broken Access Control
  ├─ A02: Cryptographic Failures
  ├─ A03: Injection
  ├─ A05: Access Control
  └─ A07: XSS
□ GDPR Articles 15-21: ✓
□ CCPA Consumer Rights: ✓
```

### ✅ CodeQL
```
□ Sin vulnerabilidades críticas
□ Sin high-severity issues
□ Reporte disponible en Security tab
□ Auto-linked a PR
```

### ✅ Dependencies
```
□ Sin vulnerabilidades críticas
□ Sin moderate vulnerabilities (idealmente)
□ npm audit clean
□ Licencias conocidas
```

### ✅ Secrets
```
□ Sin API keys encontradas
□ Sin passwords encontrados
□ Sin tokens expuestos
□ Sin credenciales
```

---

## 🔄 Dependabot Workflow

### Cada lunes a las 3 AM (Hora Chile):

```
1. Busca actualizaciones disponibles
   ├─ npm packages (prod)
   ├─ npm packages (dev)
   └─ GitHub Actions

2. Crea PRs automáticas
   ├─ Agrupadas (production/development)
   ├─ Con descripciones
   └─ Asignadas a @pjacobo28

3. Auto-run CI Pipeline
   ├─ Valida que no rompe nada
   ├─ Ejecuta todos los tests
   └─ Verifica seguridad

4. Auto-merge (si pasa)
   ├─ Parches en dev: ✅ Auto-merge
   ├─ Parches en prod: ✅ Auto-merge
   ├─ Menores en dev: ✅ Auto-merge
   └─ Mayores en prod: 🚫 Manual
```

### Ejemplo de Dependabot PR:

```markdown
## Bump typescript from 6.0.2 to 6.0.4

Bumps [typescript](https://github.com/microsoft/TypeScript) 
from 6.0.2 to 6.0.4.

### Release notes
...

- ✅ CI pipeline passed
- ✅ 72/72 tests pass
- ✅ Coverage maintained
- ✅ Security scan clean

📦 Auto-merging this PR in 5 minutes if no issues...
```

---

## 🔐 Seguridad Day-to-Day

### Si algo se hace push con problemas:

```
1. Recibes notificación en GitHub
   └─ Email + GitHub notification

2. Ves qué falló:
   ├─ Type errors
   ├─ Test failures
   ├─ Coverage dropped
   ├─ Security issues
   └─ Dependencies vulnerable

3. Opciones:
   a) Fix localmente + push nuevo
   b) Usar GitHub web editor
   c) Usa GitHub Actions logs para debug

4. Re-run workflow:
   ├─ Click "Re-run all jobs"
   ├─ O "Re-run failed jobs"
   └─ Espera 1-2 minutos
```

### Si se detecta un secret:

```
⚠️ CRÍTICO - INMEDIATO:
1. Revoca el secret
2. Crea uno nuevo
3. Actualiza en producción (si necesario)

Luego:
4. Fix el código que lo expuso
5. Re-run security scans
6. Verifica con GitGuardian
```

---

## 📊 Monitores & Dashboards

### GitHub Actions Tab
```
https://github.com/pjacobo28/Prueba/actions
```

### Security Tab
```
https://github.com/pjacobo28/Prueba/security
├── Code scanning (CodeQL)
├── Dependabot alerts
├── Secret scanning
└── Security advisories
```

### Coverage Reports
```
Cada PR muestra:
├─ Coverage badge
├─ Cobertura total
├─ Archivos modificados
└─ Link a Codecov
```

---

## 🚨 Troubleshooting Común

### Problema: Tests fallan localmente pero no en CI

```bash
# Sincroniza con CI environment
npm ci                 # Usa package-lock.json exactamente
npm run test:coverage  # Mismo que CI
```

### Problema: TypeScript strict mode errores

```
Solución:
1. npm run type-check
2. Arregla los errores mostrados
3. Push nuevamente
```

### Problema: Coverage cayó bajo 80%

```
Necesitas:
1. Más tests para el código nuevo
2. O remover código sin test
3. Target mínimo: 80%
```

### Problema: Dependabot PR no auto-merge

```
Verifica:
1. ¿Pasó CI pipeline?
2. ¿Es un tipo que auto-merge?
   ├─ Parches: ✅
   ├─ Menores en dev: ✅
   └─ Mayores en prod: ❌ Manual
3. Manual: Click "Merge" en PR
```

### Problema: Secret detectado

```
INMEDIATO:
1. Revoca el secret
2. Verifica no esté en git history
3. Fuerza push (si necesario)
4. Crea nuevo secret
5. Re-run security scans
```

---

## 📚 Comandos Útiles

### Local (antes de push)
```bash
# Simula CI pipeline localmente
npm run type-check           # Type validation
npm run test:coverage        # Tests con coverage
npm test -- --testPathPattern=security  # Security tests

# Todo junto
npm run type-check && npm run test:coverage
```

### En GitHub Actions (web UI)
```
1. Ir a Actions tab
2. Seleccionar workflow
3. Click "Run workflow" (dropdown)
4. Seleccionar rama
5. Click "Run workflow" button
```

### CLI (si tienes gh CLI)
```bash
gh run list                    # Ver runs recientes
gh run view <run-id>          # Detalles de un run
gh run rerun <run-id>         # Re-run un workflow
```

---

## ✨ Best Practices

1. **Antes de push:**
   ```bash
   npm run type-check && npm run test:coverage
   ```

2. **En commit message:**
   ```
   Describe qué cambió y por qué
   Ejemplo: "fix: prevent XSS in case title"
   ```

3. **En PR description:**
   ```
   - [ ] Tests added
   - [ ] Security checked
   - [ ] GDPR compliance reviewed
   ```

4. **Espera a que pasen todos los checks:**
   ```
   ✅ Todos en verde antes de mergear
   ```

5. **Después de merge:**
   ```
   Dependabot puede crear PRs de actualización
   Revísalas regularmente
   ```

---

## 🎯 Summary

Tu stack legal tech ahora tiene:

✅ **Automated Type Checking** - TypeScript strict mode en cada push
✅ **Continuous Testing** - 72 tests, 80%+ coverage required
✅ **Security Scanning** - CodeQL + custom validators
✅ **Dependency Management** - Dependabot updates automáticas
✅ **Secret Detection** - GitGuardian previene leaks
✅ **Compliance Validation** - OWASP/GDPR/CCPA checks
✅ **Code Quality** - Auto-merge para parches
✅ **Documentation** - Templates para issues/PRs

**Resultado: Desarrollo seguro y confiable sin esfuerzo manual.**
