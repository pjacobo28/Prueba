/**
 * Tests para API REST
 * Validación de endpoints y respuestas
 */

import { LegalAPI, ApiResponse } from '../src/api/api';
import { Persona, CaseMonitor, DocumentoLegal } from '../src/types/legal';

describe('LegalAPI', () => {
  let api: LegalAPI;
  let token: string;
  const demandante: Persona = {
    nombre: 'Cliente Test',
    rut: '99999999-9',
    domicilio: 'Calle Test 999',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    api = new LegalAPI();
    // Autenticar antes de cada test
    const authResult = await api.authenticate('test@bufete.com', 'password123');
    token = authResult.data?.token || '';
  });

  describe('Autenticación', () => {
    test('autentica usuario exitosamente', async () => {
      const result = await api.authenticate('user@test.com', 'password');
      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.data?.token).toBeDefined();
    });

    test('rechaza sin email o contraseña', async () => {
      const result = await api.authenticate('', 'password');
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.error).toContain('requeridos');
    });
  });

  describe('Casos - GET /casos', () => {
    test('obtiene lista vacía de casos al inicio', async () => {
      const result = await api.getCasos();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    test('obtiene casos con paginación', async () => {
      // Crear 2 casos
      const caso1: CaseMonitor = {
        caseId: 'CASO-001',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };

      const caso2: CaseMonitor = {
        caseId: 'CASO-002',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };

      await api.createCase(caso1);
      await api.createCase(caso2);

      const result = await api.getCasos(1, 10);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    test('requiere autenticación', async () => {
      const unauthApi = new LegalAPI();
      const result = await unauthApi.getCasos();
      expect(result.success).toBe(false);
      expect(result.code).toBe(401);
    });
  });

  describe('Casos - GET /casos/:caseId', () => {
    beforeEach(async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-TEST-001',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };
      await api.createCase(caso);
    });

    test('obtiene caso por ID', async () => {
      const result = await api.getCaseById('CASO-TEST-001');
      expect(result.success).toBe(true);
      expect(result.data?.caseId).toBe('CASO-TEST-001');
    });

    test('retorna 404 si caso no existe', async () => {
      const result = await api.getCaseById('NO-EXISTE');
      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
      expect(result.error).toContain('no encontrado');
    });

    test('rechaza ID vacío', async () => {
      const result = await api.getCaseById('');
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });
  });

  describe('Casos - POST /casos', () => {
    test('crea nuevo caso', async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-NEW-001',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };

      const result = await api.createCase(caso);
      expect(result.success).toBe(true);
      expect(result.code).toBe(201);
      expect(result.data?.caseId).toBe('CASO-NEW-001');
      expect(result.message).toContain('exitosamente');
    });

    test('rechaza caso sin datos obligatorios', async () => {
      const casoInvalido: any = {
        caseId: 'CASO-INV',
        // falta demandante y demandado
      };

      const result = await api.createCase(casoInvalido);
      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.error).toContain('obligatorios');
    });

    test('rechaza caso duplicado', async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-DUP-001',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };

      await api.createCase(caso);
      const result2 = await api.createCase(caso);
      expect(result2.success).toBe(false);
      expect(result2.code).toBe(409);
      expect(result2.error).toContain('ya existe');
    });
  });

  describe('Documentos - GET /casos/:caseId/documentos', () => {
    beforeEach(async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-DOC-001',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };
      await api.createCase(caso);
    });

    test('obtiene documentos de caso', async () => {
      const resultado = await api.getCaseDocuments('CASO-DOC-001');
      expect(resultado.success).toBe(true);
      expect(resultado.data).toHaveLength(0);
    });

    test('retorna 404 si caso no existe', async () => {
      const resultado = await api.getCaseDocuments('NO-EXISTE');
      expect(resultado.success).toBe(false);
      expect(resultado.code).toBe(404);
    });
  });

  describe('Documentos - POST /casos/:caseId/documentos', () => {
    beforeEach(async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-ADD-DOC',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };
      await api.createCase(caso);
    });

    test('agrega documento a caso', async () => {
      const doc: DocumentoLegal = {
        id: 'DOC-001',
        nombre: 'Demanda Inicial',
        tipo: 'demanda',
        fecha: new Date(),
      };

      const result = await api.addDocumentToCase('CASO-ADD-DOC', doc);
      expect(result.success).toBe(true);
      expect(result.code).toBe(201);
      expect(result.data?.caseId).toBe('CASO-ADD-DOC');
    });

    test('retorna 404 si caso no existe', async () => {
      const doc: DocumentoLegal = {
        id: 'DOC-002',
        nombre: 'Escrito',
        tipo: 'escrito',
        fecha: new Date(),
      };

      const result = await api.addDocumentToCase('NO-EXISTE', doc);
      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
    });
  });

  describe('Alertas - GET /casos/:caseId/alertas', () => {
    beforeEach(async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-ALERT-001',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };
      await api.createCase(caso);
    });

    test('obtiene alertas de caso', async () => {
      const result = await api.getCaseAlerts('CASO-ALERT-001');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.any(Array));
    });

    test('crea alerta al agregar documento', async () => {
      const doc: DocumentoLegal = {
        id: 'DOC-ALERT',
        nombre: 'Documento',
        tipo: 'demanda',
        fecha: new Date(),
      };

      await api.addDocumentToCase('CASO-ALERT-001', doc);
      const result = await api.getCaseAlerts('CASO-ALERT-001');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].tipo).toBe('nuevo_documento');
    });
  });

  describe('Alertas - PATCH /casos/:caseId/alertas/:alertaId/leer', () => {
    beforeEach(async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-READ-ALERT',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };
      await api.createCase(caso);

      const doc: DocumentoLegal = {
        id: 'DOC-READ',
        nombre: 'Documento',
        tipo: 'demanda',
        fecha: new Date(),
      };
      await api.addDocumentToCase('CASO-READ-ALERT', doc);
    });

    test('marca alerta como leída', async () => {
      const alertas = await api.getCaseAlerts('CASO-READ-ALERT');
      const alertaId = alertas.data![0].id;

      const result = await api.markAlertAsRead('CASO-READ-ALERT', alertaId);
      expect(result.success).toBe(true);
      expect(result.data?.leida).toBe(true);
    });

    test('retorna 404 si alerta no existe', async () => {
      const result = await api.markAlertAsRead('CASO-READ-ALERT', 'NO-EXISTE');
      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
    });
  });

  describe('Estadísticas', () => {
    test('obtiene estadísticas del sistema', async () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-STATS',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };
      await api.createCase(caso);

      const result = await api.getStats();
      expect(result.success).toBe(true);
      expect(result.data?.totalCasos).toBeGreaterThan(0);
      expect(result.data?.alertasPendientes).toEqual(expect.any(Number));
    });
  });

  describe('Integration Tests', () => {
    test('flujo completo: crear caso, agregar documento, marcar alerta', async () => {
      // 1. Crear caso
      const caso: CaseMonitor = {
        caseId: 'CASO-INTEGRATION',
        demandante,
        demandado: demandante,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };
      const createResult = await api.createCase(caso);
      expect(createResult.success).toBe(true);

      // 2. Agregar documento
      const doc: DocumentoLegal = {
        id: 'DOC-INTEGRATION',
        nombre: 'Demanda de Integración',
        tipo: 'demanda',
        fecha: new Date(),
      };
      const docResult = await api.addDocumentToCase('CASO-INTEGRATION', doc);
      expect(docResult.success).toBe(true);

      // 3. Obtener alertas
      const alertasResult = await api.getCaseAlerts('CASO-INTEGRATION');
      expect(alertasResult.data).toHaveLength(1);

      // 4. Marcar alerta como leída
      const alertaId = alertasResult.data![0].id;
      const readResult = await api.markAlertAsRead('CASO-INTEGRATION', alertaId);
      expect(readResult.success).toBe(true);
      expect(readResult.data?.leida).toBe(true);

      // 5. Verificar estadísticas
      const statsResult = await api.getStats();
      expect(statsResult.data?.totalCasos).toBeGreaterThan(0);
      expect(statsResult.data?.totalDocumentos).toBeGreaterThan(0);
    });
  });
});
