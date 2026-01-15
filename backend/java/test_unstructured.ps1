# Read API Key from .env
$envFile = "d:\workspace\ragAssistant\.env"
$apiKey = ""
$apiUrl = "http://localhost:8000" # Default

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "UNSTRUCTURED_API_KEY=(.*)") { $apiKey = $matches[1] }
        if ($_ -match "UNSTRUCTURED_API_URL=(.*)") { $apiUrl = $matches[1] }
        if ($_ -match "rag.unstructured.api-key=(.*)") { $apiKey = $matches[1] }
        if ($_ -match "rag.unstructured.api-url=(.*)") { $apiUrl = $matches[1] }
    }
}

Write-Host "URL: $apiUrl"
# Write-Host "Key: $apiKey"

# Sample Markdown
$markdown = @"
# Order API Guide

## Permissions
Only authenticated users can access this.

## Endpoints
GET /api/orders
Returns a list of orders.
"@

$tempFile = [System.IO.Path]::GetTempFileName() + ".md"
$markdown | Set-Content -Path $tempFile -Encoding UTF8

try {
    $uri = "$apiUrl/general/v0/general"
    
    # Simple curl using Invoke-RestMethod is tricky with multipart. 
    # Using curl.exe if available or constructing multipart manually.
    # Trying curl.exe first as it's often available.
    
    Write-Host "Sending request to $uri..."
    
    $headers = @{
        "Accept" = "application/json"
        "unstructured-api-key" = $apiKey
    }

    # Use curl (tar-curl or system curl)
    # Windows 10+ has curl.
    $form = @{
        "files" = Get-Item $tempFile
        "strategy" = "fast"
        "chunking_strategy" = "by_title"
        "max_characters" = "1000"
        "overlap" = "200"
    }
    
    # Powershell 7+ handles -Form, but PS 5.1 is common.
    # Let's use curl.exe command string.
    
    # Use Start-Process to run curl properly
    Write-Host "Executing curl..."
    $curlArgs = @(
        "-X", "POST", $uri,
        "-H", "unstructured-api-key: $apiKey",
        "-H", "Accept: application/json",
        "-F", "files=@$tempFile",
        "-F", "strategy=fast",
        "-F", "chunking_strategy=by_title",
        "-F", "max_characters=1000",
        "-F", "overlap=200"
    )
    
    # Using explicit quotes for headers can be tricky with Start-Process argument list splitting.
    # Alternatively, use Invoke-WebRequest from Powershell which understands multipart better in modern versions, 
    # but let's stick to curl.exe and careful quoting isn't needed if passed as array elements.
    # Wait, the error was "Could not resolve host: N0m...". This means `curl` saw the key as a separate argument.
    # This implies the space in "unstructured-api-key: KEY" caused splitting.
    
    # Use direct curl execution with simple quoting
    Write-Host "Executing curl directly..."
    
    # We use --header "Key: Value" format.
    # We must ensure the API key is clean.
    $apiKey = $apiKey.Trim()
    
    & curl.exe -s -X POST "$uri" `
      --header "unstructured-api-key: $apiKey" `
      --header "Accept: application/json" `
      -F "files=@$tempFile" `
      -F "max_characters=1000" `
      -F "overlap=200"



} finally {
    if (Test-Path $tempFile) { Remove-Item $tempFile }
}
