#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include "WifiCredentials.h" // Archivo separado para las credenciales WiFi
#include "endpoint.h"       // Archivo separado para la URL del endpoint

// --- CONFIGURACIÓN DEL PIN ---
// Se usa el número de GPIO directamente para evitar errores de compilación.
// D3 en la placa NodeMCU corresponde a GPIO0.
const int pulsoPin = 16; 

void setup() {
  // Inicializa la comunicación serial para ver mensajes en el monitor
  Serial.begin(115200);

  // Configura el pin de salida
  pinMode(pulsoPin, OUTPUT);
  digitalWrite(pulsoPin, LOW); // Asegúrate de que el pin inicie en bajo (LOW)

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

    // Inicia la petición HTTP
    if (http.begin(client, serverPath)) {
      Serial.print("[HTTP] Iniciando petición a: ");
      Serial.println(serverPath);

      // Realiza la petición GET
      int httpCode = http.GET();

      // --- LÓGICA MODIFICADA ---
      // Si la petición fue exitosa (código 200), envía el pulso.
      // Ya no se revisa el contenido de la respuesta.
      if (httpCode == HTTP_CODE_OK) {
        Serial.println("Respuesta OK (código 200). Enviando pulso HIGH.");
        
        // --- ENVÍO DEL PULSO ---
        digitalWrite(pulsoPin, HIGH); // Pone el pin en alto
        delay(3000);                  // Mantiene el pulso por 1 segundo (1000 ms)
        digitalWrite(pulsoPin, LOW);  // Vuelve a poner el pin en bajo
        
      } else {
        // Si hay un error, muestra el código por el Monitor Serie.
        Serial.printf("[HTTP] Petición fallida, código: %d\n", httpCode);
      }
      // Libera los recursos
      http.end();
    } else {
      Serial.printf("[HTTP] No se pudo conectar\n");
    }
  } else {
    Serial.println("Error en la conexión WiFi");
  }

  // Espera 10 segundos antes de volver a consultar el endpoint
  delay(10000);
}