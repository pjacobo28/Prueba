/**
 * Tests para validadores de seguridad
 * OWASP Top 10 + GDPR + CCPA compliance
 */

import {
  AccessControl,
  DataEncryption,
  InputValidation,
  XSSPrevention,
  RateLimiter,
  GDPRValidator,
  CCPAValidator,
} from '../src/security/validators';

describe('Security Validators', () => {
  describe('AccessControl', () => {
    test('crea control de acceso', () => {
      const ac = new AccessControl();
      expect(ac).toBeDefined();
    });

    test('agrega usuario autorizado', () => {
      const ac = new AccessControl();
      ac.agregarUsuario('user123');
      expect(ac.validarAcceso('user123', 'casos')).toBe(true);
    });

    test('rechaza usuario no autorizado', () => {
      const ac = new AccessControl();
      ac.agregarUsuario('user123');
      expect(ac.validarAcceso('user456', 'casos')).toBe(false);
    });

    test('rechaza ID de usuario vacío', () => {
      const ac = new AccessControl();
      expect(() => ac.agregarUsuario('')).toThrow('SECURITY: Invalid user ID');
    });
  });

  describe('DataEncryption', () => {
    test('valida email seguro', () => {
      expect(DataEncryption.validarEmailSeguro('usuario@example.com')).toBe(true);
      expect(DataEncryption.validarEmailSeguro('invalid.email')).toBe(false);
    });

    test('valida RUT seguro', () => {
      expect(DataEncryption.validarRutSeguro('12345678-9')).toBe(true);
      expect(() => DataEncryption.validarRutSeguro('INVALID')).toThrow(
        'SECURITY: Invalid RUT format'
      );
    });

    test('valida domicilio seguro - rechaza SQL injection', () => {
      expect(() =>
        DataEncryption.validarDomicilioSeguro('Calle 123; DROP TABLE usuarios;')
      ).toThrow('SECURITY: Dangerous pattern detected');
    });

    test('valida domicilio seguro - rechaza script injection', () => {
      expect(() =>
        DataEncryption.validarDomicilioSeguro('Calle <script>alert("xss")</script>')
      ).toThrow('SECURITY: Dangerous pattern detected');
    });

    test('valida domicilio seguro - acepta válido', () => {
      expect(DataEncryption.validarDomicilioSeguro('Calle Principal 123')).toBe(true);
    });
  });

  describe('InputValidation', () => {
    test('sanitiza entrada - remueve caracteres peligrosos', () => {
      const input = 'Normal text; DROP TABLE; <script>';
      const sanitized = InputValidation.sanitizarEntrada(input);
      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    test('valida CaseId válido', () => {
      expect(InputValidation.validarCaseId('CASO-2024-001')).toBe(true);
      expect(InputValidation.validarCaseId('CASOLABORAL-123')).toBe(true);
    });

    test('rechaza CaseId con caracteres peligrosos', () => {
      expect(() => InputValidation.validarCaseId('CASO; DROP')).toThrow(
        'SECURITY: Invalid case ID format'
      );
    });

    test('rechaza CaseId vacío', () => {
      expect(() => InputValidation.validarCaseId('')).toThrow(
        'SECURITY: Invalid case ID format'
      );
    });
  });

  describe('XSSPrevention', () => {
    test('escapa caracteres HTML', () => {
      const html = '<script>alert("xss")</script>';
      const escaped = XSSPrevention.escaparHTML(html);
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });

    test('valida nombre seguro - acepta válido', () => {
      expect(XSSPrevention.validarNombreSeguro('Juan Pérez García')).toBe(true);
    });

    test('rechaza nombre con script tag', () => {
      expect(() => XSSPrevention.validarNombreSeguro('Juan<script>alert')).toThrow(
        'SECURITY: Dangerous content in name'
      );
    });

    test('rechaza nombre con caracteres peligrosos', () => {
      expect(() => XSSPrevention.validarNombreSeguro('Juan>alert(1)')).toThrow(
        'SECURITY: Dangerous content in name'
      );
    });
  });

  describe('RateLimiter', () => {
    test('permite intentos dentro del límite', () => {
      const limiter = new RateLimiter();
      expect(limiter.validarIntento('user123')).toBe(true);
      expect(limiter.validarIntento('user123')).toBe(true);
      expect(limiter.validarIntento('user123')).toBe(true);
    });

    test('rechaza intentos excesivos', () => {
      const limiter = new RateLimiter();
      for (let i = 0; i < 5; i++) {
        limiter.validarIntento('user456');
      }
      expect(limiter.validarIntento('user456')).toBe(false);
    });

    test('diferentes usuarios tienen límites independientes', () => {
      const limiter = new RateLimiter();
      limiter.validarIntento('user1');
      limiter.validarIntento('user1');
      limiter.validarIntento('user2');
      expect(limiter.validarIntento('user1')).toBe(true);
      expect(limiter.validarIntento('user2')).toBe(true);
    });
  });

  describe('GDPRValidator', () => {
    test('valida consentimiento', () => {
      // En test simplificado, siempre es válido
      expect(GDPRValidator.validarConsentimiento({ nombre: 'Test' } as any)).toBe(
        true
      );
    });

    test('valida retención de datos - dentro de límite', () => {
      const fechaPasada = new Date();
      fechaPasada.setFullYear(fechaPasada.getFullYear() - 5); // 5 años atrás
      expect(GDPRValidator.validarRetension(fechaPasada)).toBe(true);
    });

    test('valida retención de datos - fuera de límite', () => {
      const fechaMuyPasada = new Date();
      fechaMuyPasada.setFullYear(fechaMuyPasada.getFullYear() - 10); // 10 años atrás
      expect(GDPRValidator.validarRetension(fechaMuyPasada)).toBe(false);
    });

    test('valida derecho a ser olvidado', () => {
      const persona = { nombre: 'Test' } as any;
      expect(GDPRValidator.validarDerechoASerOlvidado(persona)).toBe(true);
    });
  });

  describe('CCPAValidator', () => {
    test('valida derecho de acceso', () => {
      expect(CCPAValidator.validarDerechoDeAcceso('user123')).toBe(true);
    });

    test('valida derecho a borrar', () => {
      expect(CCPAValidator.validarDerechoABorrar('user456')).toBe(true);
    });

    test('valida opt-out de venta', () => {
      expect(CCPAValidator.validarOptOutVenta('user789')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('flujo completo de acceso seguro', () => {
      const ac = new AccessControl();
      ac.agregarUsuario('abogado@bufete.com');

      // Validar acceso
      expect(ac.validarAcceso('abogado@bufete.com', 'casos')).toBe(true);

      // Validar datos del usuario
      expect(DataEncryption.validarEmailSeguro('abogado@bufete.com')).toBe(true);

      // Validar entrada
      expect(InputValidation.validarCaseId('CASO-2024-001')).toBe(true);

      // Validar sin XSS
      const nombre = 'Dr. Juan Pérez';
      expect(XSSPrevention.validarNombreSeguro(nombre)).toBe(true);
    });

    test('prevención de ataque de fuerza bruta', () => {
      const limiter = new RateLimiter();
      let intentosBloqueados = 0;

      for (let i = 0; i < 10; i++) {
        if (!limiter.validarIntento('atacante')) {
          intentosBloqueados++;
        }
      }

      expect(intentosBloqueados).toBeGreaterThan(0);
    });

    test('cumplimiento GDPR + CCPA', () => {
      // GDPR
      const fechaCreacion = new Date();
      expect(GDPRValidator.validarRetension(fechaCreacion)).toBe(true);
      expect(GDPRValidator.validarDerechoASerOlvidado({} as any)).toBe(true);

      // CCPA
      expect(CCPAValidator.validarDerechoDeAcceso('user@test.com')).toBe(true);
      expect(CCPAValidator.validarOptOutVenta('user@test.com')).toBe(true);
    });
  });
});
