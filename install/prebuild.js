const { exec } = require("child_process");

const plat = [
  {
    platform: "win32",
    arch: "ia32"
  },
  {
    platform: "win32",
    arch: "x64"
  }
];

plat.forEach(async (v) => {
  console.log(
    `node-pre-gyp configure build package --target_platform=${v.platform} --target_arch=${v.arch}`
  );
  await exec(
    `node-pre-gyp configure build package --target_platform=${v.platform} --target_arch=${v.arch}`
  );
});
