{
  "targets": [
    {
      "target_name": "index",
      "sources": [
        "main.cc",
        "client.cc",
        "<!@(node -p \"require('fs').readdirSync('./include').map(file=>'include/'+file).join(' ')\")",
        "<!@(node -p \"require('fs').readdirSync('./src').map(file=>'src/'+file).join(' ')\")"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "<(module_root_dir)/include"
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