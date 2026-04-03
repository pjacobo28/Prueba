/**
 * Tests para tipos legales
 * Validación de interfaces y funcionalidad
 */

import {
  Persona,
  CaseMonitor,
  DocumentoLegal,
  Alert,
  Jurisprudencia,
  ArgumentoLegal,
  CasoLegal,
  Usuario,
  esRutValido,
  esEmailValido,
  esEstadoValido,
  esTipoDocumentoValido,
} from '../src/types/legal';

describe('Tipos Legales', () => {
  describe('Persona', () => {
    test('crea persona correctamente', () => {
      const persona: Persona = {
        nombre: 'Juan Pérez García',
        rut: '12345678-9',
        domicilio: 'Calle Principal 123, Santiago',
        email: 'juan@example.com',
        telefono: '+56912345678',
        profesion: 'Abogado',
      };

      expect(persona.nombre).toBe('Juan Pérez García');
      expect(persona.rut).toBe('12345678-9');
      expect(persona.email).toBe('juan@example.com');
    });

    test('persona con campos mínimos', () => {
      const persona: Persona = {
        nombre: 'Jane Doe',
        rut: '87654321-K',
        domicilio: 'Av. Secundaria 456',
        email: 'jane@example.com',
      };

      expect(persona.telefono).toBeUndefined();
      expect(persona.profesion).toBeUndefined();
    });
  });

  describe('CaseMonitor', () => {
    const demandante: Persona = {
      nombre: 'Cliente A',
      rut: '11111111-1',
      domicilio: 'Dir. Cliente',
      email: 'cliente@example.com',
    };

    const demandado: Persona = {
      nombre: 'Demandado B',
      rut: '22222222-2',
      domicilio: 'Dir. Demandado',
      email: 'demandado@example.com',
    };

    test('crea monitoreo de caso básico', () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-2024-001',
        demandante,
        demandado,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };

      expect(caso.caseId).toBe('CASO-2024-001');
      expect(caso.estado).toBe('activo');
      expect(caso.demandante.nombre).toBe('Cliente A');
    });

    test('caso con detalles completos', () => {
      const proximaAudiencia = new Date('2024-05-10');
      const caso: CaseMonitor = {
        caseId: 'CASO-2024-002',
        demandante,
        demandado,
        estado: 'activo',
        ultimaActualizacion: new Date(),
        proximaAudiencia,
        juzgado: 'Juzgado Civil de Santiago',
        juez: 'Honorable Dr. Pedro López',
        descripcion: 'Demanda por cobro de pesos',
      };

      expect(caso.juzgado).toBe('Juzgado Civil de Santiago');
      expect(caso.proximaAudiencia).toEqual(proximaAudiencia);
    });

    test('cambio de estado válido', () => {
      const caso: CaseMonitor = {
        caseId: 'CASO-2024-003',
        demandante,
        demandado,
        estado: 'activo',
        ultimaActualizacion: new Date(),
      };

      // Simular cambio de estado
      const casoActualizado: CaseMonitor = {
        ...caso,
        estado: 'resuelto',
        ultimaActualizacion: new Date(),
      };

      expect(casoActualizado.estado).toBe('resuelto');
      expect(casoActualizado.caseId).toBe(caso.caseId);
    });
  });

  describe('DocumentoLegal', () => {
    test('crea documento de demanda', () => {
      const doc: DocumentoLegal = {
        id: 'DOC-2024-001',
        nombre: 'Demanda Inicial',
        tipo: 'demanda',
        fecha: new Date('2024-03-15'),
        contenido: 'Texto de la demanda...',
        url: '/documentos/DOC-2024-001.pdf',
        caseId: 'CASO-2024-001',
      };

      expect(doc.tipo).toBe('demanda');
      expect(doc.nombre).toBe('Demanda Inicial');
      expect(doc.caseId).toBe('CASO-2024-001');
    });

    test('crea documento de sentencia', () => {
      const doc: DocumentoLegal = {
        id: 'DOC-2024-002',
        nombre: 'Sentencia Definitiva',
        tipo: 'sentencia',
        fecha: new Date('2024-04-01'),
      };

      expect(doc.tipo).toBe('sentencia');
      expect(doc.contenido).toBeUndefined();
    });
  });

  describe('Alert', () => {
    test('crea alerta de cambio de estado', () => {
      const alerta: Alert = {
        id: 'ALERT-2024-001',
        caseId: 'CASO-2024-001',
        tipo: 'cambio_estado',
        mensaje: 'El estado del caso cambió a resuelto',
        fecha: new Date(),
        leida: false,
      };

      expect(alerta.tipo).toBe('cambio_estado');
      expect(alerta.leida).toBe(false);
      expect(alerta.caseId).toBe('CASO-2024-001');
    });

    test('alerta de nuevo documento', () => {
      const alerta: Alert = {
        id: 'ALERT-2024-002',
        caseId: 'CASO-2024-001',
        tipo: 'nuevo_documento',
        mensaje: 'Se agregó una sentencia',
        fecha: new Date(),
        leida: false,
        accion: 'revisar_documento',
      };

      expect(alerta.accion).toBe('revisar_documento');
    });

    test('marcar alerta como leída', () => {
      const alerta: Alert = {
        id: 'ALERT-2024-003',
        caseId: 'CASO-2024-001',
        tipo: 'proximaAudiencia',
        mensaje: 'Audiencia el 10 de mayo',
        fecha: new Date(),
        leida: false,
      };

      const alertaLeida: Alert = {
        ...alerta,
        leida: true,
      };

      expect(alertaLeida.leida).toBe(true);
      expect(alerta.leida).toBe(false); // Original sin cambios
    });
  });

  describe('Jurisprudencia', () => {
    test('crea referencia de jurisprudencia', () => {
      const juris: Jurisprudencia = {
        id: 'JURIS-2024-001',
        corte: 'Corte Suprema',
        fecha: new Date('2024-02-15'),
        tema: 'Indemnización por despido injustificado',
        partes: 'Trabajador vs. Empresa XYZ',
        resolucion:
          'Se condena al empleador al pago de indemnización por despido sin causa justificada',
        sentencia: 'ROL 12345-2024',
      };

      expect(juris.corte).toBe('Corte Suprema');
      expect(juris.tema).toContain('Indemnización');
    });
  });

  describe('Validadores de Tipo', () => {
    test('esRutValido - acepta RUT válido', () => {
      expect(esRutValido('12345678-9')).toBe(true);
      expect(esRutValido('1234567-K')).toBe(true);
      expect(esRutValido('25123456-0')).toBe(true);
    });

    test('esRutValido - rechaza RUT inválido', () => {
      expect(esRutValido('123456789')).toBe(false); // Sin guion
      expect(esRutValido('12345678-')).toBe(false); // Sin verificador
      expect(esRutValido('ABC12345-9')).toBe(false); // Letras en número
    });

    test('esEmailValido - acepta email válido', () => {
      expect(esEmailValido('usuario@example.com')).toBe(true);
      expect(esEmailValido('nombre.apellido@empresa.co')).toBe(true);
    });

    test('esEmailValido - rechaza email inválido', () => {
      expect(esEmailValido('usuario@')).toBe(false);
      expect(esEmailValido('@example.com')).toBe(false);
      expect(esEmailValido('usuario')).toBe(false);
    });

    test('esEstadoValido - acepta estados válidos', () => {
      expect(esEstadoValido('activo')).toBe(true);
      expect(esEstadoValido('resuelto')).toBe(true);
      expect(esEstadoValido('apelacion')).toBe(true);
      expect(esEstadoValido('archivado')).toBe(true);
    });

    test('esEstadoValido - rechaza estados inválidos', () => {
      expect(esEstadoValido('pendiente')).toBe(false);
      expect(esEstadoValido('en_proceso')).toBe(false);
      expect(esEstadoValido('')).toBe(false);
    });

    test('esTipoDocumentoValido - acepta tipos válidos', () => {
      expect(esTipoDocumentoValido('demanda')).toBe(true);
      expect(esTipoDocumentoValido('sentencia')).toBe(true);
      expect(esTipoDocumentoValido('auto')).toBe(true);
    });

    test('esTipoDocumentoValido - rechaza tipos inválidos', () => {
      expect(esTipoDocumentoValido('contrato')).toBe(false);
      expect(esTipoDocumentoValido('acta')).toBe(false);
      expect(esTipoDocumentoValido('')).toBe(false);
    });
  });

  describe('CasoLegal Integrado', () => {
    test('crea caso legal completo', () => {
      const demandante: Persona = {
        nombre: 'Cliente',
        rut: '11111111-1',
        domicilio: 'Dir. 1',
        email: 'cliente@example.com',
      };

      const caso: CasoLegal = {
        id: 'CASOLEGAL-2024-001',
        monitor: {
          caseId: 'CASO-2024-001',
          demandante,
          demandado: demandante,
          estado: 'activo',
          ultimaActualizacion: new Date(),
        },
        documentos: [],
        alertas: [],
        jurisprudenciaAplicable: [],
        argumentos: [],
        creado: new Date(),
        actualizado: new Date(),
      };

      expect(caso.monitor.caseId).toBe('CASO-2024-001');
      expect(caso.documentos).toHaveLength(0);
      expect(caso.alertas).toHaveLength(0);
    });

    test('agregar documentos y alertas', () => {
      const demandante: Persona = {
        nombre: 'Cliente',
        rut: '11111111-1',
        domicilio: 'Dir. 1',
        email: 'cliente@example.com',
      };

      let caso: CasoLegal = {
        id: 'CASOLEGAL-2024-002',
        monitor: {
          caseId: 'CASO-2024-002',
          demandante,
          demandado: demandante,
          estado: 'activo',
          ultimaActualizacion: new Date(),
        },
        documentos: [],
        alertas: [],
        jurisprudenciaAplicable: [],
        argumentos: [],
        creado: new Date(),
        actualizado: new Date(),
      };

      // Agregar documento
      caso.documentos.push({
        id: 'DOC-001',
        nombre: 'Demanda',
        tipo: 'demanda',
        fecha: new Date(),
      });

      // Agregar alerta
      caso.alertas.push({
        id: 'ALERT-001',
        caseId: 'CASO-2024-002',
        tipo: 'nuevo_documento',
        mensaje: 'Documento agregado',
        fecha: new Date(),
        leida: false,
      });

      expect(caso.documentos).toHaveLength(1);
      expect(caso.alertas).toHaveLength(1);
    });
  });
});
