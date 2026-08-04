<#
  gen_vo_hazel_mk1.ps1
  Generates the site VO set with Microsoft Hazel (System.Speech / SAPI 5).
  Output: 44.1 kHz / 16-bit / mono WAV -> matches bass_roar_3s.wav + tone_up_3.wav.

  Usage:
    Unblock-File .\gen_vo_hazel_mk1.ps1
    .\gen_vo_hazel_mk1.ps1
    .\gen_vo_hazel_mk1.ps1 -ListVoices
    .\gen_vo_hazel_mk1.ps1 -OutDir "D:\0_Summer_26\0_nHerling_com\assets\audio" -Rate -1
#>

[CmdletBinding()]
param(
    [string]$OutDir    = "$PSScriptRoot\assets\audio",
    [string]$VoiceLike = '*Hazel*',
    [ValidateRange(-10, 10)][int]$Rate = -1,     # -1 = slightly deliberate, system-voice feel
    [ValidateRange(0, 100)][int]$Volume = 100,
    [switch]$ListVoices,
    [switch]$Force                                # overwrite existing files
)

$ErrorActionPreference = 'Stop'

# ---- line set -------------------------------------------------------------
$Lines = @(
    [pscustomobject]@{ File = 'vo_online.wav';      Text = 'Hello. Nathan Herling dot com, online.' }
    [pscustomobject]@{ File = 'vo_pelagic.wav';     Text = "Hello. I'm Pelagic. Pleased to meet you." }
    [pscustomobject]@{ File = 'vo_cv.wav';          Text = 'Loading See Vee.' }
    [pscustomobject]@{ File = 'vo_research.wav';    Text = 'Loading Research.' }
    [pscustomobject]@{ File = 'vo_projects.wav';    Text = 'Loading Projects.' }
    [pscustomobject]@{ File = 'vo_mathematics.wav'; Text = 'Loading Mathematics.' }
)

# ---- engine ---------------------------------------------------------------
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

$installed = $synth.GetInstalledVoices() | Where-Object { $_.Enabled }

if ($ListVoices) {
    Write-Host "`nVoices visible to System.Speech:" -ForegroundColor Cyan
    $installed | ForEach-Object {
        $v = $_.VoiceInfo
        '{0,-38} {1,-8} {2}' -f $v.Name, $v.Gender, $v.Culture.Name
    }
    $synth.Dispose()
    return
}

$target = $installed | Where-Object { $_.VoiceInfo.Name -like $VoiceLike } | Select-Object -First 1
if (-not $target) {
    Write-Host "`nNo voice matching '$VoiceLike' is visible to System.Speech." -ForegroundColor Red
    Write-Host "Visible voices:" -ForegroundColor Yellow
    $installed | ForEach-Object { '  ' + $_.VoiceInfo.Name }
    Write-Host @"

If Hazel is installed but not listed, it is registered as a OneCore voice only.
System.Speech reads:  HKLM\SOFTWARE\Microsoft\Speech\Voices\Tokens
OneCore lives at:     HKLM\SOFTWARE\Microsoft\Speech_OneCore\Voices\Tokens
Copying the Hazel token key across (regedit, export/import) exposes it to SAPI 5.
"@ -ForegroundColor DarkGray
    $synth.Dispose()
    throw "Voice not found."
}

$synth.SelectVoice($target.VoiceInfo.Name)
$synth.Rate   = $Rate
$synth.Volume = $Volume

# ---- output ---------------------------------------------------------------
if (-not (Test-Path -LiteralPath $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
    Write-Host "created  $OutDir" -ForegroundColor DarkGray
}

$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
    44100,
    [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
    [System.Speech.AudioFormat.AudioChannel]::Mono)

Write-Host ""
Write-Host "voice   : $($target.VoiceInfo.Name)" -ForegroundColor Cyan
Write-Host "rate    : $Rate    volume: $Volume"
Write-Host "outdir  : $OutDir"
Write-Host "format  : 44100 Hz / 16-bit / mono"
Write-Host ""

$i = 0
$total = $Lines.Count
$made = 0; $skipped = 0

foreach ($line in $Lines) {
    $i++
    $pct  = [int](100 * $i / $total)
    $path = Join-Path $OutDir $line.File
    Write-Progress -Activity "Rendering VO (Hazel)" -Status "$i/$total  $($line.File)" -PercentComplete $pct

    $bar = ('#' * [int](24 * $i / $total)).PadRight(24, '-')
    if ((Test-Path -LiteralPath $path) -and -not $Force) {
        Write-Host ("[{0}] {1}/{2}  SKIP  {3}  (exists, use -Force)" -f $bar, $i, $total, $line.File) -ForegroundColor DarkYellow
        $skipped++
        continue
    }

    $synth.SetOutputToWaveFile($path, $fmt)
    $synth.Speak($line.Text)
    $synth.SetOutputToNull()        # flush + release the handle

    $kb = [math]::Round((Get-Item -LiteralPath $path).Length / 1KB, 1)
    Write-Host ("[{0}] {1}/{2}  {3,-20} {4,6} KB   `"{5}`"" -f $bar, $i, $total, $line.File, $kb, $line.Text) -ForegroundColor Green
    $made++
}

Write-Progress -Activity "Rendering VO (Hazel)" -Completed
$synth.Dispose()

Write-Host ""
Write-Host "done. $made written, $skipped skipped -> $OutDir" -ForegroundColor Cyan
