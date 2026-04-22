Add-Type -AssemblyName System.Drawing

$publicDir = Join-Path $PSScriptRoot '..\public'
if (!(Test-Path $publicDir)) { New-Item -ItemType Directory -Path $publicDir | Out-Null }

$size = 1024
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$rect = New-Object System.Drawing.Rectangle(0,0,$size,$size)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255,28,24,84), [System.Drawing.Color]::FromArgb(255,255,138,73), 90)
$g.FillRectangle($grad, 0,0,$size,$size)

$overlayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120,20,12,62))
$g.FillRectangle($overlayBrush, 0,0,$size,[int]($size*0.45))

$silhouette = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230,8,10,20))
$g.FillRectangle($silhouette, 0,820,$size,220)

$buildings = @(
  @(140,620,36,220), @(200,590,28,250), @(258,560,52,280), @(324,600,22,240),
  @(365,545,70,295), @(450,585,28,255), @(505,535,56,305), @(578,600,24,240),
  @(620,555,82,285), @(732,618,28,222), @(776,590,46,250), @(838,635,36,205)
)
foreach ($b in $buildings) { $g.FillRectangle($silhouette, [int]$b[0],[int]$b[1],[int]$b[2],[int]$b[3]) }

# Pin
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245,255,255,255))
$pinCx = 512; $pinCy = 360
$outerW = 420; $innerW = 300
$g.FillEllipse($white, [int]($pinCx-$outerW/2), [int]($pinCy-$outerW/2), $outerW, $outerW)

$pointer = [System.Drawing.Point[]]@(
  (New-Object System.Drawing.Point([int]($pinCx-110), [int]($pinCy+120))),
  (New-Object System.Drawing.Point([int]($pinCx+110), [int]($pinCy+120))),
  (New-Object System.Drawing.Point([int]$pinCx, [int]($pinCy+360)))
)
$g.FillPolygon($white, $pointer)

$inner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,116,54,112))
$g.FillEllipse($inner, [int]($pinCx-$innerW/2), [int]($pinCy-$innerW/2), $innerW, $innerW)

$tail = [System.Drawing.Point[]]@(
  (New-Object System.Drawing.Point([int]($pinCx-18), [int]($pinCy+138))),
  (New-Object System.Drawing.Point([int]($pinCx+8), [int]($pinCy+152))),
  (New-Object System.Drawing.Point([int]($pinCx-8), [int]($pinCy+176)))
)
$g.FillPolygon($inner, $tail)

$dot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245,255,255,255))
$g.FillEllipse($dot, [int]($pinCx-90), [int]($pinCy-10), 36,36)
$g.FillEllipse($dot, [int]($pinCx-18), [int]($pinCy-10), 36,36)
$g.FillEllipse($dot, [int]($pinCx+54), [int]($pinCy-10), 36,36)

$baseOut = Join-Path $publicDir 'icon-1024.png'
$bmp.Save($baseOut, [System.Drawing.Imaging.ImageFormat]::Png)

function Save-Resized([System.Drawing.Bitmap]$src, [int]$w, [string]$outPath) {
  $dst = New-Object System.Drawing.Bitmap($w, $w)
  $gg = [System.Drawing.Graphics]::FromImage($dst)
  $gg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gg.DrawImage($src, 0,0,$w,$w)
  $dst.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $gg.Dispose(); $dst.Dispose()
}

Save-Resized $bmp 512 (Join-Path $publicDir 'icon-512.png')
Save-Resized $bmp 192 (Join-Path $publicDir 'icon-192.png')
Save-Resized $bmp 180 (Join-Path $publicDir 'apple-touch-icon.png')
Save-Resized $bmp 32  (Join-Path $publicDir 'favicon-32x32.png')

$dot.Dispose(); $inner.Dispose(); $white.Dispose(); $silhouette.Dispose(); $overlayBrush.Dispose(); $grad.Dispose();
$g.Dispose(); $bmp.Dispose()
Write-Output 'ICONS_GENERATED'
