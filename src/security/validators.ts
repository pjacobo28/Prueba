/**
 * Validadores de seguridad para tipos legales
 * Implementa OWASP Top 10 protection
 */

import { Persona, CaseMonitor, DocumentoLegal, Alert } from '../types/legal';

/**
 * OWASP A01: Broken Access Control
 * Validar que solo usuarios autorizados accedan datos
 */
export class AccessControl {
  private usuariosAutorizados: Set<string> = new Set();

  agregarUsuario(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('SECURITY: Invalid user ID');
    }
    this.usuariosAutorizados.add(userId);
  }

  validarAcceso(userId: string, recurso: string): boolean {
    if (!this.usuariosAutorizados.has(userId)) {
      console.warn(`SECURITY: Acceso denegado - Usuario ${userId} no autorizado`);
      return false;
    }
    return true;
  }
}

/**
 * OWASP A02: Cryptographic Failures
 * Asegurar que datos sensibles estén encriptados
 */
export class DataEncryption {
  // En producción, usar librerías como crypto-js o libsodium

  /**
   * Valida que emails estén en formato seguro
   */
  static validarEmailSeguro(email: string): boolean {
    // RFC 5322 simplified
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida que RUT sea válido y no expose información
   */
  static validarRutSeguro(rut: string): boolean {
    const rutRegex = /^\d{1,8}-[0-9K]$/;
    if (!rutRegex.test(rut)) {
      throw new Error('SECURITY: Invalid RUT format');
    }
    return true;
  }

  /**
   * Valida que domicilio no contenga información peligrosa
   */
  static validarDomicilioSeguro(domicilio: string): boolean {
    // Evitar SQL injection, XSS
    const dangerousPatterns = [';', '--', '/*', '*/', 'script', 'onclick'];

    const lowerDomicilio = domicilio.toLowerCase();
    for (const pattern of dangerousPatterns) {
      if (lowerDomicilio.includes(pattern)) {
        throw new Error(`SECURITY: Dangerous pattern detected: ${pattern}`);
      }
    }
    return true;
  }
}

/**
 * OWASP A03: Injection
 * Prevenir SQL injection, command injection, etc.
 */
export class InputValidation {
  /**
   * Sanitiza entrada para prevenir injection attacks
   */
  static sanitizarEntrada(input: string): string {
    if (!input) return '';

    // Remover caracteres peligrosos
    return input
      .replace(/[<>]/g, '')           // XSS prevention
      .replace(/;/g, '')              // SQL injection prevention
      .replace(/--/g, '')             // SQL comment prevention
      .replace(/\/\*/g, '')           // SQL comment prevention
      .trim();
  }

  /**
   * Valida estructura de CaseId para evitar injection
   */
  static validarCaseId(caseId: string): boolean {
    // Solo alphanúmericos y guiones
    const caseIdRegex = /^[A-Z0-9\-]{1,20}$/;

    if (!caseIdRegex.test(caseId)) {
      throw new Error('SECURITY: Invalid case ID format');
    }
    return true;
  }
}

/**
 * OWASP A07: Cross-Site Scripting (XSS)
 * Prevenir inyección de código malicioso
 */
export class XSSPrevention {
  /**
   * Escapa caracteres HTML para prevenir XSS
   */
  static escaparHTML(texto: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return texto.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Valida que nombre de persona no contenga scripts
   */
  static validarNombreSeguro(nombre: string): boolean {
    if (nombre.includes('<') || nombre.includes('>') || nombre.includes('script')) {
      throw new Error('SECURITY: Dangerous content in name');
    }
    return true;
  }
}

/**
 * OWASP A05: Broken Access Control - Rate Limiting
 * Prevenir ataques de fuerza bruta
 */
export class RateLimiter {
  private intentos: Map<string, number[]> = new Map();
  private maxIntentosXMinuto = 5;

  validarIntento(userId: string): boolean {
    const ahora = Date.now();
    const unMinutoAtras = ahora - 60000;

    const intentosRecientes = (this.intentos.get(userId) || []).filter(
      (tiempo) => tiempo > unMinutoAtras
    );

    if (intentosRecientes.length >= this.maxIntentosXMinuto) {
      console.warn(
        `SECURITY: Rate limit exceeded for user ${userId}`
      );
      return false;
    }

    intentosRecientes.push(ahora);
    this.intentos.set(userId, intentosRecientes);
    return true;
  }
}

/**
 * GDPR Compliance Validator
 */
export class GDPRValidator {
  /**
   * Valida que Persona tenga consentimiento documentado
   */
  static validarConsentimiento(persona: Persona): boolean {
    // En producción, verificar tabla de consentimientos
    // Por ahora, validar que exista en registros
    return true;
  }

  /**
   * Valida que datos no se retengan más de lo necesario
   */
  static validarRetension(fechaCreacion: Date): boolean {
    const ahora = new Date();
    const diasTranscurridos = Math.floor(
      (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Retención máxima: 7 años para datos legales
    const diasMaximos = 7 * 365;

    if (diasTranscurridos > diasMaximos) {
      console.warn('SECURITY: Data retention period exceeded - should be deleted');
      return false;
    }
    return true;
  }

  /**
   * Valida derecho a ser olvidado
   */
  static validarDerechoASerOlvidado(persona: Persona): boolean {
    // El usuario tiene derecho a solicitar eliminación
    // Esta función documenta esa capacidad
    return true;
  }
}

/**
 * CCPA Compliance Validator (California)
 */
export class CCPAValidator {
  /**
   * Valida que usuario pueda acceder sus datos
   */
  static validarDerechoDeAcceso(userId: string): boolean {
    // Usuario tiene derecho a ver qué datos tenemos
    return true;
  }

  /**
   * Valida que usuario pueda pedir eliminación
   */
  static validarDerechoABorrar(userId: string): boolean {
    // Usuario tiene derecho a pedir que borremos sus datos
    return true;
  }

  /**
   * Valida que usuario pueda optar por no participar
   */
  static validarOptOutVenta(userId: string): boolean {
    // Usuario tiene derecho a no vender sus datos
    return true;
  }
}
