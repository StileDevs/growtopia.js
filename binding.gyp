{
  "targets": [
    {
      "target_name": "gtjs",
      "sources": [
        "lib/main.cc",
        "lib/client.cc",
        "lib/client_peer.cc",
        "<!@(node -p \"require('fs').readdirSync('./lib/include').map(file=>'lib/include/'+file).join(' ')\")",
        "<!@(node -p \"require('fs').readdirSync('./lib/src').map(file=>'lib/src/'+file).join(' ')\")"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<(module_root_dir)/lib/include"
      ],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "conditions": [
        [
          "OS==\"win\"",
          {
            "msbuild_settings": {
              "Link": {
                "ImageHasSafeExceptionHandlers": "false"
              }
            },
            "libraries": ["winmm.lib", "ws2_32.lib"]
          }
        ]
      ]
    }
  ]
}