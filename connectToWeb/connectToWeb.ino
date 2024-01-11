void setup() {
  Serial.begin(115200);
}

void loop() {
//  static uint32_t counter = 0;
//  Serial.println("Counter: " + String(counter) + ">");
//  counter++;
//  delay(1500);


  static String readString = "";
  while(Serial.available()){
    delay(1);
    char c = Serial.read();
    readString += c;
  }
  
  if(readString.length()> 0){
    readString.trim();
    Serial.println("<UNO received::" + readString + ">");
    readString = "";
  }
}
