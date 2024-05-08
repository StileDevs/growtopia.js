const fs = require("fs");
const { ItemsDat } = require("../../dist");

const file = fs.readFileSync("./test/items-builder-v17-and-v18/items.dat");

const item = new ItemsDat(file);

(async () => {
  const decoded = await item.decode();

  decoded.items.forEach((i) => {
    i.unknown1 ? console.log("unknown 1", i) : undefined;
    i.unknown2 ? console.log("unknown 2", i) : undefined;
  });

  const encoded = await item.encode(decoded);
  console.log({ encoded });
})();
