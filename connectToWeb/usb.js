var port,
  writer,
  reader,
  str = "",
  isSetup = false;

document.addEventListener("click", () => {
  if (!isSetup) {
    isSetup = !isSetup;
    RequestSerialID();
  }
});

async function RequestSerialID() {
  port = await navigator.serial.requestPort();
  await port.open({
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
  });

  console.log(port);
  ReadUnitClosed();
  writer = port.writable.getWriter();
}

async function WriteToSerial(txt) {
  let arr = new Uint8Array(txt.length);
  for (let i = 0; i < arr.length; ++i) {
    arr[i] = txt.charCodeAt(i);
  }
  await writer.write(arr);
}

function myfish(str) {}
async function ReadUnitClosed() {
  while (port.readable) {
    reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        let newStr = "";
        for (let i = 0; i < value.length; i++) {
          newStr += String.fromCharCode(value[i]);
        }
        newStr = newStr.trim();
        str += newStr;
        if (
          str.lastIndexOf("<") != -1 &&
          str.lastIndexOf(">") != -1 &&
          str.lastIndexOf("<") < str.lastIndexOf(">")
        ) {
          let startInx = str.lastIndexOf("<");
          let diff = str.lastIndexOf(">") - startInx;
          str = str.substring(startInx + 1, diff);

          myfish(str);
          ///////////////////////////////////////////////////////////////////////

          console.log(str);
          str = "";
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
