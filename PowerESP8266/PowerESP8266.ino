#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include "WifiCredentials.h" // Archivo separado para las credenciales WiFi
#include "endpoint.h"       // Archivo separado para la URL del endpoint

// --- CONFIGURACIÓN DEL PIN ---
// Se usa el número de GPIO directamente para evitar errores de compilación.
// D3 en la placa NodeMCU corresponde a GPIO0.
const int pulsoPin = 16;

// Máximo de redirecciones a seguir
const int MAX_REDIRECTS = 5;

// Helper: Construye una URL absoluta desde una base y una Location relativa/absoluta.
// - Si loc comienza con "http" la devuelve tal cual.
// - Si loc comienza con "/" devuelve scheme://host + loc
// - Si loc es relativa sin slash, añade a base (base sin path).
String buildAbsoluteURL(const String &base, const String &loc) {
  if (loc.length() == 0) return base;
  String lowerLoc = loc;
  lowerLoc.toLowerCase();
  if (lowerLoc.startsWith("http://") || lowerLoc.startsWith("https://")) {
    return loc; // ya es absoluta
  }

  // Extraer scheme://host[:port] de base
  int schemePos = base.indexOf("://");
  if (schemePos == -1) {
    // base sin scheme, devolver loc si es absoluta por suerte
    if (loc[0] == '/') return String("https://") + base + loc;
    return base + "/" + loc;
  }

  int hostStart = schemePos + 3;
  int pathStart = base.indexOf('/', hostStart);
  String origin;
  if (pathStart == -1) {
    origin = base; // base ya es scheme://host[:port]
  } else {
    origin = base.substring(0, pathStart); // scheme://host[:port]
  }

  if (loc[0] == '/') {
    return origin + loc; // origin + path
  } else {
    // relativo sin slash: append to origin + last path segment of base
    if (pathStart == -1) {
      return origin + "/" + loc;
    } else {
      // quitar todo después del último '/'
      int lastSlash = base.lastIndexOf('/');
      if (lastSlash <= hostStart) {
        return origin + "/" + loc;
      } else {
        String prefix = base.substring(0, lastSlash + 1);
        return prefix + loc;
      }
    }
  }
}

void setup() {
  // Inicializa la comunicación serial para ver mensajes en el monitor
  Serial.begin(115200);

  // Configura el pin de salida
  pinMode(pulsoPin, OUTPUT);
  digitalWrite(pulsoPin, HIGH); // Asegúrate de que el pin inicie en ALOT (HIGH)

  // --- CONEXIÓN A WIFI ---
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n¡Conectado a la red WiFi!");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Solo procede si estamos conectados a la red WiFi
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    String url = serverPath; // viene de endpoint.h
    bool success = false;

    for (int redirectCount = 0; redirectCount <= MAX_REDIRECTS; ++redirectCount) {
      Serial.print("[HTTP] Iniciando petición a: ");
      Serial.println(url);

      if (!http.begin(client, url)) {
        Serial.println("[HTTP] http.begin() falló");
        break;
      }

      // Opcional: setea un User-Agent para evitar reglas anti-bots
      http.setUserAgent("ESP8266-UpWifi/1.0");

      int httpCode = http.GET();
      Serial.printf("[HTTP] Código recibido: %d\n", httpCode);

      // Leer y mostrar algunas cabeceras
      String loc = http.header("Location");
      if (loc.length() > 0) {
        Serial.print("[HTTP] Location: ");
        Serial.println(loc);
      }
      String serverHdr = http.header("Server");
      if (serverHdr.length() > 0) {
        Serial.print("[HTTP] Server: ");
        Serial.println(serverHdr);
      }
      String contentType = http.header("Content-Type");
      if (contentType.length() > 0) {
        Serial.print("[HTTP] Content-Type: ");
        Serial.println(contentType);
      }

      if (httpCode == HTTP_CODE_OK) {
        // 200 OK: leer body y accionar
        String body = http.getString();
        Serial.println("[HTTP] Body recibido:");
        Serial.println(body);

        // --- ENVÍO DEL PULSO ---
        Serial.println("Respuesta OK (código 200). Enviando pulso HIGH.");
        digitalWrite(pulsoPin, LOW); // Pone el pin en BAJO
        delay(1000);                  // Mantiene el pulso por 3000 ms
        digitalWrite(pulsoPin, HIGH);  // Vuelve a poner el pin en ALTO

        success = true;
        http.end();
        break;
      }

      // If not OK, perform a raw TLS fetch and print full response headers/body for debugging
      if (httpCode != HTTP_CODE_OK) {
        Serial.println("[HTTP] Ejecutando fetch raw para obtener cabeceras completas...");
        // print raw headers using a simple TLS client (ignores cert validation)
        String rawLoc = printRawHeaders(url);
        Serial.print("[DEBUG] rawLoc returned: '"); Serial.print(rawLoc); Serial.println("'");
        // If raw fetch indicates 200 OK, perform the pulse (we printed body already)
        if (rawLoc == "__RAW_200__") {
          Serial.println("[RAW->OK] Se detectó 200 OK en raw fetch. Enviando pulso HIGH.");
          digitalWrite(pulsoPin, LOW);
          delay(1000);
          digitalWrite(pulsoPin, HIGH);
          success = true;
          http.end();
          break;
        }
        if (rawLoc.length() > 0) {
          Serial.print("[HTTP] Ubicacion obtenida via raw fetch: ");
          Serial.println(rawLoc);
          // construir URL absoluta y seguirla
          String nextUrl = buildAbsoluteURL(url, rawLoc);
          Serial.print("[HTTP] Siguiendo a (raw): "); Serial.println(nextUrl);
          http.end();
          url = nextUrl;
          delay(200);
          continue;
        }
      }

      // Si es redirección (301/302/307/308) y hay Location -> seguir
      if ((httpCode == 301 || httpCode == 302 || httpCode == 307 || httpCode == 308) && loc.length() > 0) {
        Serial.println("[HTTP] Redirección detectada, preparando a seguir Location...");

        // Construir URL absoluta si loc es relativa
        String nextUrl = buildAbsoluteURL(url, loc);
        Serial.print("[HTTP] Siguiendo a: ");
        Serial.println(nextUrl);

        http.end(); // cerrar antes de la siguiente petición
        url = nextUrl;
        delay(200); // breve espera
        continue; // siguiente iteración
      }

      // No OK y no redirect -> log y salir
      Serial.printf("[HTTP] Petición fallida, código: %d\n", httpCode);
      if (httpCode > 0) {
        String errBody = http.getString();
        if (errBody.length() > 0) {
          Serial.println("[HTTP] Body de error:");
          Serial.println(errBody);
        }
      } else {
        Serial.println("[HTTP] Código HTTP inválido (cliente)");
      }
      http.end();
      break;
    } // for redirects

    if (!success) {
      Serial.println("[HTTP] No se obtuvo un 200 tras seguir redirecciones.");
    }
  } else {
    Serial.println("Error en la conexión WiFi");
  }

  // Espera 10 segundos antes de volver a consultar el endpoint
  delay(10000);
}

// Helper: realiza una petición TLS/HTTP mínima y vuelca la respuesta cruda a Serial
String printRawHeaders(const String &url) {
  WiFiClientSecure secure;
  secure.setInsecure(); // no validar certificado (solo para debug)

  // Parse URL simple (scheme://host[:port]/path)
  String tmp = url;
  int schemePos = tmp.indexOf("://");
  String host = tmp;
  String path = "/";
  int port = 443;
  if (schemePos >= 0) {
    host = tmp.substring(schemePos + 3);
  }
  int slashPos = host.indexOf('/');
  if (slashPos >= 0) {
    path = host.substring(slashPos);
    host = host.substring(0, slashPos);
  }
  int colonPos = host.indexOf(':');
  if (colonPos >= 0) {
    port = host.substring(colonPos + 1).toInt();
    host = host.substring(0, colonPos);
  }

  Serial.print("[RAW] Conectando a "); Serial.print(host); Serial.print(":"); Serial.println(port);
  if (!secure.connect(host, port)) {
    Serial.println("[RAW] fallo al conectar") ;
    return String();
  }

  // Send minimal GET
  secure.print(String("GET ") + path + " HTTP/1.1\r\n");
  secure.print(String("Host: ") + host + "\r\n");
  secure.print("User-Agent: ESP8266-UpWifi/1.0\r\n");
  secure.print("Connection: close\r\n");
  secure.print("\r\n");

  // Read status line and headers
  unsigned long start = millis();
  String foundLocation = "";
  bool saw200 = false;
  bool firstLine = true;
  while (secure.connected() && (millis() - start) < 5000) {
    while (secure.available()) {
      String line = secure.readStringUntil('\n');
      line.trim();
      if (firstLine) {
        // capture status line like "HTTP/1.1 200 OK"
        if (line.indexOf(" 200 ") >= 0) {
          saw200 = true;
        }
        firstLine = false;
      }
      if (line.length() == 0) {
        Serial.println("[RAW] -- end headers --");
        // read up to ~2KB of body for inspection
        int toRead = 2048;
        while (secure.available() && toRead > 0) {
          String chunk = secure.readStringUntil('\n');
          Serial.println(chunk);
          toRead -= chunk.length();
        }
        secure.stop();
        if (foundLocation.length() > 0) return foundLocation;
        if (saw200) return String("__RAW_200__");
        return String();
      }
      Serial.println(line);
      // detectar header Location
      if (line.startsWith("Location:") || line.startsWith("location:")) {
        int colon = line.indexOf(':');
        if (colon >= 0) {
          String locVal = line.substring(colon + 1);
          locVal.trim();
          foundLocation = locVal;
        }
      }
    }
    delay(10);
  }
  Serial.println("[RAW] timeout leyendo respuesta");
  secure.stop();
  if (foundLocation.length() > 0) return foundLocation;
  if (saw200) return String("__RAW_200__");
  return String();
}