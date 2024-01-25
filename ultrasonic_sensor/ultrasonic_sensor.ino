int trigPin = 11;    // Trigger
int echoPin = 12;    // Echo
long duration, cm, inches;

const int numReadings = 10; // Aantal metingen voor het voortschrijdend gemiddelde
long readings[numReadings]; // De metingen zelf
int readIndex = 0; // Huidige positie in de array
long total = 0; // De som van de metingen
long average = 0; // Het gemiddelde van de metingen

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Initialiseer alle metingen op 0:
  for (int thisReading = 0; thisReading < numReadings; thisReading++) {
    readings[thisReading] = 0;
  }
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  pinMode(echoPin, INPUT);
  duration = pulseIn(echoPin, HIGH);

  cm = (duration/2) / 29.1;
  inches = (duration/2) / 74;

  // Trek de laatste meting af van 'total':
  total = total - readings[readIndex];
  // Lees de nieuwe meting:
  readings[readIndex] = cm;
  // Voeg deze toe aan 'total':
  total = total + readings[readIndex];
  // Ga naar de volgende positie in de array:
  readIndex = readIndex + 1;

  // Als we aan het einde van de array zijn, ga terug naar het begin:
  if (readIndex >= numReadings) {
    readIndex = 0;
  }

  // Bereken het gemiddelde:
  average = total / numReadings;

  // Verzend de gemiddelde afstand:
  Serial.print("<" + String(average) + ">");
  delay(50);

  delay(250);
}
