$dest = "c:\Users\ASUS\OneDrive\Desktop\useless_project_Autizman-1\serialos_v1.zip"
$artifactDest = "C:\Users\ASUS\.gemini\antigravity-ide\brain\080f26fa-0853-4f71-8fe3-dcc1ace9402d\serialos_v1.zip"

if (Test-Path $dest) { Remove-Item $dest -Force }
if (Test-Path $artifactDest) { Remove-Item $artifactDest -Force }

$items = Get-ChildItem -Path "c:\Users\ASUS\OneDrive\Desktop\useless_project_Autizman-1" | Where-Object {
    $_.Name -ne 'node_modules' -and 
    $_.Name -ne '.git' -and 
    $_.Name -notlike '*.zip'
}

$publicDest = "c:\Users\ASUS\OneDrive\Desktop\useless_project_Autizman-1\public\serialos_v1.zip"

Compress-Archive -Path $items.FullName -DestinationPath $dest -CompressionLevel Optimal
Copy-Item -Path $dest -Destination $artifactDest -Force
Copy-Item -Path $dest -Destination $publicDest -Force

$item = Get-Item $dest
Write-Host "SUCCESS: Created $($item.FullName) - $($item.Length) bytes"
