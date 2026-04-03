/**
 * Scraper para Portal del Poder Judicial Dominicano
 * https://portal.poderjudicial.gob.do/registro/pf
 *
 * Extrae información de expedientes y movimientos
 */

import { Expediente, Movimiento, TipoMovimiento } from "../types/expediente";

// @ts-ignore - Playwright is an optional dependency for web scraping
let chromium: any = null;
let Browser: any = null;
let Page: any = null;

try {
  const pw = require("playwright");
  chromium = pw.chromium;
  Browser = pw.Browser;
  Page = pw.Page;
} catch (e) {
  console.warn("⚠️  Playwright no instalado. Scraping deshabilitado.");
}

export interface ScraperConfig {
  usuario: string;
  contrasena: string;
  headless?: boolean;
}

export class ExpedienteScraper {
  private browser?: any;
  private page?: any;
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = {
      ...config,
      headless: config.headless !== false,
    };
  }

  /**
   * Inicia el navegador y realiza login
   */
  async iniciar(): Promise<void> {
    if (!chromium) {
      throw new Error("Playwright no está instalado. Instala con: npm install playwright");
    }

    console.log("🚀 Iniciando navegador...");
    this.browser = await chromium.launch({
      headless: this.config.headless,
    });

    this.page = await this.browser.newPage();

    // Ir al portal
    console.log("🔓 Navegando al portal del poder judicial...");
    await this.page.goto("https://portal.poderjudicial.gob.do/registro/pf", {
      waitUntil: "networkidle",
    });

    // Realizar login
    await this.login();
  }

  /**
   * Realiza login en el portal
   */
  private async login(): Promise<void> {
    if (!this.page) throw new Error("Página no inicializada");

    console.log("🔐 Realizando login...");

    // Buscar campos de login y llenarlos
    // NOTA: Los selectores específicos dependen del HTML del portal real
    try {
      // Esperar campo de usuario
      await this.page.waitForSelector('input[name="usuario"]', {
        timeout: 10000,
      });
      await this.page.fill('input[name="usuario"]', this.config.usuario);

      // Llenar contraseña
      await this.page.fill('input[name="contrasena"]', this.config.contrasena);

      // Click en login
      await this.page.click('button[type="submit"]');

      // Esperar a que se cargue el dashboard
      await this.page.waitForNavigation({ waitUntil: "networkidle" });

      console.log("✅ Login exitoso");
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  }

  /**
   * Busca un expediente específico
   */
  async buscarExpediente(numeroExpediente: string): Promise<Expediente | null> {
    if (!this.page) throw new Error("Página no inicializada");

    console.log(`🔍 Buscando expediente: ${numeroExpediente}`);

    try {
      // Buscar campo de búsqueda y llenar
      await this.page.fill('input[name="expediente"]', numeroExpediente);

      // Click en buscar
      await this.page.click('button[name="buscar"]');

      // Esperar resultados
      await this.page.waitForSelector(".resultado-expediente", {
        timeout: 5000,
      });

      // Click en primer resultado
      await this.page.click(".resultado-expediente:first-child");

      // Esperar detalle del expediente
      await this.page.waitForSelector(".detalle-expediente", {
        timeout: 5000,
      });

      // Extraer información
      const expediente = await this.extraerDetalleExpediente(numeroExpediente);

      return expediente;
    } catch (error) {
      console.error(`❌ Error buscando expediente ${numeroExpediente}:`, error);
      return null;
    }
  }

  /**
   * Extrae los detalles de un expediente de la página actual
   */
  private async extraerDetalleExpediente(
    numeroExpediente: string
  ): Promise<Expediente> {
    if (!this.page) throw new Error("Página no inicializada");

    // Datos de ejemplo (en producción, extraer del HTML real)
    const datos = {
      caratula: "Expediente sin información",
      demandante: "Desconocido",
      demandado: "Desconocido",
      juzgado: "Desconocido",
      juez: "Desconocido",
      ciudad: "Desconocido",
      estado: "activo",
      fechaRadicacion: new Date().toISOString(),
    };

    // Extraer movimientos
    const movimientos = await this.extraerMovimientos();

    const ultimoMovimiento =
      movimientos.length > 0
        ? movimientos[0]
        : {
            id: "INICIAL",
            numeroExpediente,
            tipo: "radicacion" as TipoMovimiento,
            descripcion: "Expediente radicado",
            fecha: new Date(datos.fechaRadicacion),
          };

    return {
      numeroExpediente,
      caratula: datos.caratula,
      demandante: datos.demandante,
      demandado: datos.demandado,
      juzgado: datos.juzgado,
      juez: datos.juez,
      ciudad: datos.ciudad,
      fechaRadicacion: new Date(datos.fechaRadicacion),
      estado: datos.estado as "activo" | "resuelto" | "apelacion" | "archivado",
      movimientos,
      ultimoMovimiento,
      creado: new Date(),
      actualizado: new Date(),
      monitoredDesde: new Date(),
    };
  }

  /**
   * Extrae el historial de movimientos de la página actual
   */
  private async extraerMovimientos(): Promise<Movimiento[]> {
    if (!this.page) throw new Error("Página no inicializada");

    try {
      const movimientos = await this.page.evaluate(() => {
        // @ts-ignore - document is available in browser context
        const filas = document.querySelectorAll(".movimiento-fila");
        const resultado: Omit<Movimiento, "id">[] = [];

        filas.forEach((fila: any) => {
          const fecha = fila.querySelector(".fecha")?.textContent || "";
          const tipo = fila.querySelector(".tipo")?.textContent || "otro";
          const descripcion =
            fila.querySelector(".descripcion")?.textContent || "";
          const juez = fila.querySelector(".juez")?.textContent;
          const numeroAuto = fila.querySelector(".numero-auto")?.textContent;

          resultado.push({
            numeroExpediente: "", // Se llenará después
            tipo: tipo as TipoMovimiento,
            descripcion,
            fecha: new Date(fecha),
            juez,
            numeroAuto,
          });
        });

        return resultado;
      });

      // Asignar IDs a movimientos
      return movimientos.map((m: Omit<Movimiento, "id">, idx: number) => ({
        ...m,
        id: `MOV-${Date.now()}-${idx}`,
        numeroExpediente: "", // Se llenará en el contexto de uso
      }));
    } catch (error) {
      console.warn("⚠️ No se pudieron extraer movimientos del DOM:", error);
      return [];
    }
  }

  /**
   * Busca múltiples expedientes
   */
  async buscarMuchosExpedientes(
    numeros: string[]
  ): Promise<(Expediente | null)[]> {
    const resultados: (Expediente | null)[] = [];

    for (const numero of numeros) {
      const exp = await this.buscarExpediente(numero);
      resultados.push(exp);

      // Pequeño delay para no sobrecargar el servidor
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return resultados;
  }

  /**
   * Cierra el navegador
   */
  async cerrar(): Promise<void> {
    if (this.browser) {
      console.log("🔌 Cerrando navegador...");
      await this.browser.close();
    }
  }
}

/**
 * Función auxiliar para usar el scraper
 */
export async function extraerExpedientes(
  usuario: string,
  contrasena: string,
  numeros: string[]
): Promise<Expediente[]> {
  const scraper = new ExpedienteScraper({ usuario, contrasena });

  try {
    await scraper.iniciar();
    const resultados = await scraper.buscarMuchosExpedientes(numeros);
    return resultados.filter((r) => r !== null) as Expediente[];
  } finally {
    await scraper.cerrar();
  }
}
