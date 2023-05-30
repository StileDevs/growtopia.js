import { DataObject } from "../../types";

export function parseAction(chunk: Buffer) {
  let data: DataObject = {};
  chunk[chunk.length - 1] = 0;

  let str = chunk.toString("utf-8", 4);
  const lines = str.split("\n");

  lines.forEach((line) => {
    if (line.startsWith("|")) line = line.slice(1);
    const info = line.split("|");

    let key = info[0];
    let val = info[1];

    if (key && val) {
      if (val.endsWith("\x00")) val = val.slice(0, -1);
      data[key] = val;
    }
  });

  return data;
}
