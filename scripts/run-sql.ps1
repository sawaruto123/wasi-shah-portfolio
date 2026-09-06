param(
  [string]$Sql,
  [string]$File
)

# Runs SQL against the linked Supabase project via the Management API.
# Reads the access token from Windows Credential Manager ("Supabase CLI").
# Usage:
#   powershell -File scripts/run-sql.ps1 -Sql "select 1"
#   powershell -File scripts/run-sql.ps1 -File supabase/migrations/0001_init.sql

$ErrorActionPreference = 'Stop'

$src = @"
using System;
using System.Runtime.InteropServices;
public static class CredManRunSql {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct CREDENTIAL {
        public uint Flags; public uint Type; public IntPtr TargetName; public IntPtr Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public uint CredentialBlobSize; public IntPtr CredentialBlob; public uint Persist;
        public uint AttributeCount; public IntPtr Attributes; public IntPtr TargetAlias; public IntPtr UserName;
    }
    [DllImport("advapi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CredRead(string target, uint type, uint flags, out IntPtr credentialPtr);
    [DllImport("advapi32.dll", SetLastError = true)]
    private static extern void CredFree(IntPtr cred);
    public static string Token(string target) {
        IntPtr p;
        if (!CredRead(target, 1, 0, out p)) return null;
        try {
            var c = (CREDENTIAL)Marshal.PtrToStructure(p, typeof(CREDENTIAL));
            var buf = new byte[c.CredentialBlobSize];
            Marshal.Copy(c.CredentialBlob, buf, 0, (int)c.CredentialBlobSize);
            return System.Text.Encoding.UTF8.GetString(buf);
        } finally { CredFree(p); }
    }
}
"@
Add-Type -TypeDefinition $src -Language CSharp

# Resolve project ref from the linked project metadata, falling back to a default
$projectRef = 'nkjvfhzfyfdybtynrzxa'
$refFile = Join-Path $PSScriptRoot '..\supabase\.temp\project-ref'
if (Test-Path $refFile) {
  $projectRef = (Get-Content -LiteralPath $refFile -Raw).Trim()
}

$token = [CredManRunSql]::Token("Supabase CLI:supabase")
if (-not $token) { throw "Could not read Supabase access token from Credential Manager" }

if ($File) {
  $query = [System.IO.File]::ReadAllText((Resolve-Path $File), [System.Text.Encoding]::UTF8)
} else {
  $query = $Sql
}
if (-not $query -or $query.Trim().Length -eq 0) { throw "No SQL provided" }

$headers = @{ Authorization = "Bearer $token" }
$json = @{ query = $query } | ConvertTo-Json
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($json)

try {
  $resp = Invoke-RestMethod -Method Post -Uri "https://api.supabase.com/v1/projects/$projectRef/database/query" -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8" -TimeoutSec 120
  if ($null -eq $resp) {
    Write-Output "OK (no result set)"
  } else {
    $resp | ConvertTo-Json -Depth 10
  }
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
  if ($_.ErrorDetails) { Write-Output $_.ErrorDetails.Message }
  exit 1
}
