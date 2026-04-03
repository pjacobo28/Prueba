# Jest/Testing MCP Server Installation

## ¿Qué es Jest/Testing?

Jest/Testing es un servidor MCP que proporciona framework de testing automatizado:
- Testing unitario
- Testing de integración
- Coverage de código
- Snapshots
- Mocking

## Características principales

### 1. **Testing Unitario**
- Prueba funciones individuales
- Validación de lógica
- Casos edge case
- Comportamiento esperado

### 2. **Testing de Integración**
- Prueba módulos juntos
- Flujos completos
- APIs
- Integración de sistemas

### 3. **Coverage de Código**
- Líneas cubiertas por tests
- Ramas evaluadas
- Funciones probadas
- Reportes visuales

### 4. **Mocking y Snapshots**
- Mock de funciones externas
- Snapshots de estado
- Datos de prueba
- Fixtures reutilizables

## Cómo usar Jest

### Crear tests:
```bash
/create-test "funcionalidad"
# Crea archivo de test
```

### Ejecutar tests:
```bash
/run-tests
# Ejecuta suite completa
```

### Coverage:
```bash
/coverage-report
# Genera reporte de cobertura
```

### Watch mode:
```bash
/test-watch
# Ejecuta tests en tiempo real
```

## 🎯 Aplicaciones para Herramientas Legales

### 1. **Testing de Monitoreo de Casos**
```javascript
describe('Case Monitor', () => {
  test('detecta cambios en expediente', () => {
    // Simula portal judicial
    // Verifica que detecte cambios
    // Valida alertas
  });
  
  test('descarga documentos correctamente', () => {
    // Prueba descarga de archivos
    // Valida formato
    // Verifica almacenamiento
  });
});
```

### 2. **Testing de Procesamiento de Documentos**
```javascript
describe('Document Processor', () => {
  test('extrae datos correctamente de PDF', () => {
    // Carga PDF de prueba
    // Extrae información
    // Valida estructura
  });
  
  test('maneja PDFs escaneados', () => {
    // Prueba OCR
    // Valida texto extraído
  });
});
```

### 3. **Testing de Datos Legales**
```javascript
describe('Legal Data', () => {
  test('valida estructura de demanda', () => {
    // Crea demanda de prueba
    // Valida elementos obligatorios
    // Verifica requisitos
  });
  
  test('calcula plazos correctamente', () => {
    // Prueba cálculo de fechas
    // Valida períodos
  });
});
```

### 4. **Testing de APIs**
```javascript
describe('Case API', () => {
  test('devuelve casos del usuario', () => {
    // Llama endpoint
    // Valida respuesta
    // Verifica formato
  });
  
  test('maneja errores correctamente', () => {
    // Prueba con datos inválidos
    // Valida respuesta de error
  });
});
```

## Flujo de TDD (Test-Driven Development)

```
1. Escribe test que falla (RED)
    ↓
2. Escribe código mínimo para pasar (GREEN)
    ↓
3. Refactoriza sin cambiar comportamiento (REFACTOR)
    ↓
4. Repite
    
Resultado: Código probado y confiable
```

## Integración con Superpowers

```
Superpowers (/execute-plan con TDD)
    + Jest Testing
    = Desarrollo completamente validado

Flujo:
1. /brainstorming (planifica)
2. /create-test (escribe test)
3. Código falla (/run-tests)
4. Implementa código
5. Tests pasan (/run-tests)
6. Refactoriza (/refactor-code)
```

## Coverage Recomendado

### Mínimo para producción:
```
Funciones: 80%
Ramas: 75%
Líneas: 80%
Statements: 80%
```

### Para trabajo legal:
```
Funciones: 90%
Ramas: 85%
Líneas: 90%
Statements: 90%

Motivo: Datos sensibles y críticos
```

## Ejemplo: Testing Completo

```javascript
// test/case-monitor.test.js
import { CaseMonitor } from '../src/case-monitor';

describe('CaseMonitor', () => {
  let monitor;
  
  beforeEach(() => {
    monitor = new CaseMonitor();
  });
  
  describe('Monitoreo básico', () => {
    test('inicializa correctamente', () => {
      expect(monitor.cases).toEqual([]);
      expect(monitor.alerts).toEqual([]);
    });
  });
  
  describe('Agregar casos', () => {
    test('agrega caso exitosamente', () => {
      monitor.addCase({ id: '123', status: 'active' });
      expect(monitor.cases).toHaveLength(1);
    });
    
    test('rechaza casos duplicados', () => {
      monitor.addCase({ id: '123' });
      expect(() => monitor.addCase({ id: '123' }))
        .toThrow('Case already exists');
    });
  });
  
  describe('Detección de cambios', () => {
    test('detecta cambio de estado', () => {
      monitor.addCase({ id: '123', status: 'pending' });
      monitor.updateStatus('123', 'resolved');
      
      expect(monitor.alerts).toHaveLength(1);
      expect(monitor.alerts[0].type).toBe('status-change');
    });
  });
});
```

## Reportes de Coverage

```bash
/coverage-report
# Genera:
├── Terminal output
├── HTML report
├── Coverage badges
└── CI integration
```

Resultado:
```
Statements   : 85.2% ( 142/167 )
Branches     : 80.5% ( 65/80 )
Functions    : 88.3% ( 53/60 )
Lines        : 86.1% ( 145/168 )
```

## Más información

Visita https://claude.com/plugins/jest-testing para más detalles.
