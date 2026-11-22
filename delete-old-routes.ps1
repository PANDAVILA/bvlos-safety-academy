# Run from C:\Users\panda\Downloads\bvlos-academy AFTER copying the new files over.
# Removes the old Spanish route folders (the new English ones replace them).
$old = "cursos","noticias","informes","tienda","consultoria","registro","aprender","panel","contacto"
foreach ($d in $old) {
  $p = Join-Path "app" $d
  if (Test-Path $p) { Remove-Item -Recurse -Force $p; Write-Host "Removed $p" }
}
Write-Host "Checking middleware for old paths..."
if (Test-Path "middleware.ts") { Select-String -Path "middleware.ts" -Pattern "cursos|noticias|informes|tienda|consultoria|registro|aprender|panel|contacto" } else { Write-Host "No middleware.ts found" }
