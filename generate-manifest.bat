@echo off
powershell -ExecutionPolicy Bypass -Command ^
  "$gallery = 'images\gallery';" ^
  "Get-ChildItem -Path $gallery -Directory | ForEach-Object {" ^
  "  $files = Get-ChildItem -Path $_.FullName -File |" ^
  "    Where-Object { $_.Extension -match '(?i)^\.(jpg|jpeg|png|webp|gif|bmp|heic|heif)$' } |" ^
  "    Select-Object -ExpandProperty Name | Sort-Object -Unique;" ^
  "  $files = @($files);" ^
  "  $json = ConvertTo-Json $files -Compress;" ^
  "  if ($files.Count -eq 0) { $json = '[]' };" ^
  "  if ($files.Count -eq 1) { $json = '[' + (ConvertTo-Json $files[0]) + ']' };" ^
  "  $out = 'window.GALLERY_MANIFESTS = {' + [Environment]::NewLine;" ^
  "  Write-Host ('  ' + $_.Name + ': ' + $files.Count + ' photos');" ^
  "};" ^
  "$out2 = 'window.GALLERY_MANIFESTS = {' + [Environment]::NewLine;" ^
  "Get-ChildItem -Path $gallery -Directory | ForEach-Object {" ^
  "  $files = Get-ChildItem -Path $_.FullName -File |" ^
  "    Where-Object { $_.Extension -match '(?i)^\.(jpg|jpeg|png|webp|gif|bmp|heic|heif)$' } |" ^
  "    Select-Object -ExpandProperty Name | Sort-Object -Unique;" ^
  "  $files = @($files);" ^
  "  $json = ConvertTo-Json $files -Compress;" ^
  "  if ($files.Count -eq 0) { $json = '[]' };" ^
  "  if ($files.Count -eq 1) { $json = '[' + (ConvertTo-Json $files[0]) + ']' };" ^
  "  $out2 += '  ' + (ConvertTo-Json $_.Name) + ': ' + $json + ',' + [Environment]::NewLine;" ^
  "};" ^
  "$out2 += '};';" ^
  "Set-Content -Path 'gallery-data.js' -Value $out2 -Encoding UTF8;" ^
  "Write-Host '';" ^
  "Write-Host 'Done! Commit and push gallery-data.js to GitHub.' -ForegroundColor Green"
pause
