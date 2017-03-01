{
  "targets": [
    {
      "target_name": "test_addon",
      "sources": [ "test_addon.cc" ],
      "include_dirs": [ "<!(node -e \"require('nan')\")" ]
    }
  ]
}
