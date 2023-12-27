const fs = require("fs");
const { ItemsDat } = require("../../dist");

const file = fs.readFileSync("./test/items-builder-v16/items.dat");

const item = new ItemsDat(file);

(async () => {
  const decoded = await item.decode();

  decoded.items.forEach((i) => {
    i.itemRenderer.length ? console.log(i) : undefined;
  });
})();
