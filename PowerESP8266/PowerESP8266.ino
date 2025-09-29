#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// --- CONFIGURACIÓN WIFI ---
const char* ssid = "EL_NOMBRE_DE_TU_WIFI";       // Reemplaza con el nombre de tu red
const char* password = "TU_CONTRASENA_WIFI"; // Reemplaza con tu contraseña
// URL del endpoint a consultar
const String serverPath = "http://192.76.9.1:8000/power-pc";

// --- CONFIGURACIÓN DEL PIN ---
const int pulsoPin = D3; // Pin D3 (que corresponde a GPIO0 en el ESP8266)

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

      // Si la petición fue exitosa (código 200)
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString(); // Obtiene la respuesta del servidor
        Serial.print("[HTTP] Respuesta recibida: ");
        Serial.println(payload);

        // Comprueba si la respuesta es "true"
        if (payload.equalsIgnoreCase("true")) {
          Serial.println("Respuesta es 'true'. Enviando pulso HIGH al pin D3.");
          
          // --- ENVÍO DEL PULSO ---
          digitalWrite(pulsoPin, HIGH); // Pone el pin en alto
          delay(1000);                  // Mantiene el pulso por 1 segundo (1000 ms)
          digitalWrite(pulsoPin, LOW);  // Vuelve a poner el pin en bajo
          
        } else {
          Serial.println("La respuesta no fue 'true'. No se envía pulso.");
        }
      } else {
        Serial.printf("[HTTP] Error en la petición GET, código: %d\n", httpCode);
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