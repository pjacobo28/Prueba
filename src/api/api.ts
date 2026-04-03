/**
 * API REST para sistema legal automatizado
 * Endpoints para acceso a casos, documentos, alertas y jurisprudencia
 */

import {
  Persona,
  CaseMonitor,
  DocumentoLegal,
  Alert,
  Jurisprudencia,
} from '../types/legal';

/**
 * Interface para respuesta de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  code: number;
}

/**
 * Interface para paginación
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Clase para gestionar API REST
 */
export class LegalAPI {
  private baseUrl: string;
  private token?: string;
  private casos: Map<string, CaseMonitor> = new Map();
  private documentos: Map<string, DocumentoLegal> = new Map();
  private alertas: Map<string, Alert> = new Map();

  constructor(baseUrl: string = 'http://localhost:3000/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Autenticar usuario
   */
  async authenticate(email: string, password: string): Promise<ApiResponse<{ token: string }>> {
    // Validación básica
    if (!email || !password) {
      return {
        success: false,
        error: 'Email y contraseña requeridos',
        code: 400,
        timestamp: new Date(),
      };
    }

    // En producción, hacer petición HTTP
    this.token = `token_${Date.now()}`;

    return {
      success: true,
      data: { token: this.token },
      message: 'Autenticación exitosa',
      code: 200,
      timestamp: new Date(),
    };
  }

  /**
   * Validar autenticación
   */
  private validarToken(): ApiResponse<null> | null {
    if (!this.token) {
      return {
        success: false,
        error: 'No autorizado',
        code: 401,
        timestamp: new Date(),
      };
    }
    return null;
  }

  /**
   * GET /casos - Obtener lista de casos
   */
  async getCasos(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<CaseMonitor>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return {
        success: false,
        error: tokenError.error,
        code: 401,
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        timestamp: new Date(),
      };
    }

    const casos = Array.from(this.casos.values());
    const total = casos.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedCasos = casos.slice(start, start + pageSize);

    return {
      success: true,
      data: paginatedCasos,
      total,
      page,
      pageSize,
      totalPages,
      message: `${total} casos encontrados`,
      code: 200,
      timestamp: new Date(),
    };
  }

  /**
   * GET /casos/:caseId - Obtener caso específico
   */
  async getCaseById(caseId: string): Promise<ApiResponse<CaseMonitor>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return tokenError as any;
    }

    if (!caseId || caseId.trim() === '') {
      return {
        success: false,
        error: 'ID de caso requerido',
        code: 400,
        timestamp: new Date(),
      };
    }

    const caso = this.casos.get(caseId);
    if (!caso) {
      return {
        success: false,
        error: `Caso ${caseId} no encontrado`,
        code: 404,
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: caso,
      code: 200,
      timestamp: new Date(),
    };
  }

  /**
   * POST /casos - Crear nuevo caso
   */
  async createCase(caso: CaseMonitor): Promise<ApiResponse<CaseMonitor>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return tokenError as any;
    }

    // Validación
    if (!caso.caseId || !caso.demandante || !caso.demandado) {
      return {
        success: false,
        error: 'Datos obligatorios faltantes',
        code: 400,
        timestamp: new Date(),
      };
    }

    if (this.casos.has(caso.caseId)) {
      return {
        success: false,
        error: `Caso ${caso.caseId} ya existe`,
        code: 409,
        timestamp: new Date(),
      };
    }

    this.casos.set(caso.caseId, caso);

    return {
      success: true,
      data: caso,
      message: `Caso ${caso.caseId} creado exitosamente`,
      code: 201,
      timestamp: new Date(),
    };
  }

  /**
   * GET /casos/:caseId/documentos - Obtener documentos de caso
   */
  async getCaseDocuments(caseId: string): Promise<ApiResponse<DocumentoLegal[]>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return tokenError as any;
    }

    // Validar que caso existe
    const caso = this.casos.get(caseId);
    if (!caso) {
      return {
        success: false,
        error: `Caso ${caseId} no encontrado`,
        code: 404,
        timestamp: new Date(),
      };
    }

    const documentos = Array.from(this.documentos.values()).filter(
      (d) => d.caseId === caseId
    );

    return {
      success: true,
      data: documentos,
      message: `${documentos.length} documentos encontrados`,
      code: 200,
      timestamp: new Date(),
    };
  }

  /**
   * POST /casos/:caseId/documentos - Agregar documento a caso
   */
  async addDocumentToCase(
    caseId: string,
    documento: DocumentoLegal
  ): Promise<ApiResponse<DocumentoLegal>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return tokenError as any;
    }

    // Validar que caso existe
    const caso = this.casos.get(caseId);
    if (!caso) {
      return {
        success: false,
        error: `Caso ${caseId} no encontrado`,
        code: 404,
        timestamp: new Date(),
      };
    }

    documento.caseId = caseId;
    this.documentos.set(documento.id, documento);

    // Crear alerta
    const alerta: Alert = {
      id: `ALERT-${Date.now()}`,
      caseId,
      tipo: 'nuevo_documento',
      mensaje: `Se agregó documento: ${documento.nombre}`,
      fecha: new Date(),
      leida: false,
    };
    this.alertas.set(alerta.id, alerta);

    return {
      success: true,
      data: documento,
      message: `Documento ${documento.id} agregado`,
      code: 201,
      timestamp: new Date(),
    };
  }

  /**
   * GET /casos/:caseId/alertas - Obtener alertas de caso
   */
  async getCaseAlerts(caseId: string): Promise<ApiResponse<Alert[]>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return tokenError as any;
    }

    // Validar que caso existe
    const caso = this.casos.get(caseId);
    if (!caso) {
      return {
        success: false,
        error: `Caso ${caseId} no encontrado`,
        code: 404,
        timestamp: new Date(),
      };
    }

    const alertas = Array.from(this.alertas.values()).filter(
      (a) => a.caseId === caseId
    );

    return {
      success: true,
      data: alertas,
      message: `${alertas.length} alertas encontradas`,
      code: 200,
      timestamp: new Date(),
    };
  }

  /**
   * PATCH /casos/:caseId/alertas/:alertaId/leer - Marcar alerta como leída
   */
  async markAlertAsRead(caseId: string, alertaId: string): Promise<ApiResponse<Alert>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return tokenError as any;
    }

    const alerta = this.alertas.get(alertaId);
    if (!alerta) {
      return {
        success: false,
        error: `Alerta ${alertaId} no encontrada`,
        code: 404,
        timestamp: new Date(),
      };
    }

    if (alerta.caseId !== caseId) {
      return {
        success: false,
        error: 'Alerta no pertenece a este caso',
        code: 400,
        timestamp: new Date(),
      };
    }

    alerta.leida = true;
    this.alertas.set(alertaId, alerta);

    return {
      success: true,
      data: alerta,
      message: 'Alerta marcada como leída',
      code: 200,
      timestamp: new Date(),
    };
  }

  /**
   * Obtener estadísticas
   */
  async getStats(): Promise<ApiResponse<{ totalCasos: number; totalDocumentos: number; alertasPendientes: number }>> {
    const tokenError = this.validarToken();
    if (tokenError) {
      return tokenError as any;
    }

    const alertasPendientes = Array.from(this.alertas.values()).filter(
      (a) => !a.leida
    ).length;

    return {
      success: true,
      data: {
        totalCasos: this.casos.size,
        totalDocumentos: this.documentos.size,
        alertasPendientes,
      },
      code: 200,
      timestamp: new Date(),
    };
  }
}

/**
 * Función de prueba de API
 */
export async function testAPI(): Promise<void> {
  const api = new LegalAPI();

  // Autenticar
  console.log('1. Autenticando...');
  const authResult = await api.authenticate('abogado@bufete.com', 'password123');
  console.log(authResult.message);

  // Crear caso
  console.log('\n2. Creando caso...');
  const demandante: Persona = {
    nombre: 'Cliente A',
    rut: '11111111-1',
    domicilio: 'Calle 1',
    email: 'cliente@example.com',
  };

  const caso: CaseMonitor = {
    caseId: 'CASO-2024-001',
    demandante,
    demandado: demandante,
    estado: 'activo',
    ultimaActualizacion: new Date(),
  };

  const createResult = await api.createCase(caso);
  console.log(createResult.message);

  // Obtener caso
  console.log('\n3. Obteniendo caso...');
  const getResult = await api.getCaseById('CASO-2024-001');
  console.log(`Caso obtenido: ${getResult.data?.caseId}`);

  // Obtener estadísticas
  console.log('\n4. Estadísticas...');
  const statsResult = await api.getStats();
  console.log(`Total de casos: ${statsResult.data?.totalCasos}`);
  console.log(`Alertas pendientes: ${statsResult.data?.alertasPendientes}`);
}
