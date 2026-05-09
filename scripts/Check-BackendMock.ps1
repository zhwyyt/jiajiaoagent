$health = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8787/health
Write-Output $health.Content
