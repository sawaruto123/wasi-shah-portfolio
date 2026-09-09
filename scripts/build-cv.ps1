$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

# ---- page setup: A4, clean margins ----
$doc.PageSetup.PaperSize = 7          # wdPaperA4
$doc.PageSetup.TopMargin = 36          # 0.5"
$doc.PageSetup.BottomMargin = 36
$doc.PageSetup.LeftMargin = 43         # 0.6"
$doc.PageSetup.RightMargin = 43

# ---- special chars from code points (encoding-safe) ----
$em = [string][char]0x2014
$en = [string][char]0x2013
$bullet = [string][char]0x2022
$dot = [string][char]0x00B7
$cn = [string][char]0x5CEF + [string][char]0x5C71

function SetFont($size, $bold, $italic, $name, $color) {
  $sel.Font.Size = [single]$size
  $sel.Font.Bold = $bold
  $sel.Font.Italic = $italic
  if ($name) { $sel.Font.Name = $name }
  if ($color) { $sel.Font.Color = $color }
}
function Line($text, $size, $bold, $align, $spaceAfter, $color, $italic) {
  SetFont $size $bold $italic 'Calibri' $color
  $sel.ParagraphFormat.Alignment = $align
  $sel.TypeText($text)
  $sel.TypeParagraph()
  $sel.ParagraphFormat.SpaceAfter = $spaceAfter
}
function Section($text) {
  SetFont 13 $true $false 'Calibri' 7027968
  $sel.ParagraphFormat.Alignment = 0
  $sel.ParagraphFormat.SpaceBefore = 8
  $sel.ParagraphFormat.SpaceAfter = 2
  $sel.TypeText($text)
  $sel.TypeParagraph()
  $sel.ParagraphFormat.Borders.Item(-3).LineStyle = 1
  $sel.ParagraphFormat.Borders.Item(-3).LineWidth = 4
  $sel.Font.Bold = $false
}
function SubHead($text) {
  SetFont 10.5 $true $false 'Calibri' 0
  $sel.ParagraphFormat.Alignment = 0
  $sel.ParagraphFormat.SpaceBefore = 5
  $sel.ParagraphFormat.SpaceAfter = 0
  $sel.TypeText($text)
  $sel.TypeParagraph()
}
function Bullet($text) {
  SetFont 10 $false $false 'Calibri' 0
  $sel.ParagraphFormat.Alignment = 0
  $sel.ParagraphFormat.LeftIndent = 16
  $sel.ParagraphFormat.SpaceAfter = 0
  $sel.TypeText("$bullet  " + $text)
  $sel.TypeParagraph()
}
function Date($text) {
  SetFont 9.5 $false $true 'Calibri' 0
  $sel.ParagraphFormat.Alignment = 2
  $sel.TypeText($text)
  $sel.TypeParagraph()
  SetFont 10 $false $false 'Calibri' 0
}

# ===================== HEADER =====================
Line 'SYED WASI SHAH' 20 $true 1 1 7027968 $false
Line "($cn)  $dot  Filmmaker  $dot  Motion Designer  $dot  Graphic Designer  $dot  Creative Developer" 11 $true 1 1 0 $false
Line "Hong Kong SAR  $dot  +852 9899 2944  $dot  syedwasi983@gmail.com  $dot  Portfolio: wasi-shah-portfolio.vercel.app" 9 $false 1 6 0 $false

# ===================== PROFILE =====================
Section 'PROFILE'
Line "A multidisciplinary creator telling stories for the digital world $em cutting films, designing brand systems, building interactive tools, and shipping real products. Self-disciplined, research-based, and adaptable, with a strong eye for detail and a proven record across marketing, teaching, and creative production." 10 $false 0 4 0 $false
Line "Languages: Cantonese (Native) $dot English (Native) $dot Mandarin (Fluent)" 10 $false 0 3 0 $false

# ===================== EXPERIENCE =====================
Section 'WORK EXPERIENCE'
SubHead "Behance Co Limited $em Adobe Ambassador"
Date "May 2025 $en Present"
Bullet 'Represent the brand between vendor and prospective students, parents, and industry.'
Bullet 'Outreach and recruitment via social media and live events.'
Bullet 'Create blogs, videos, and promotional, workshop, and instructional content.'
Bullet 'Plan and run online/offline events; build relationships with professionals and alumni.'

SubHead "Virtual Academy International $em Marketing & Teacher"
Date "Jun 2024 $en Present"
Bullet 'Research target markets; plan and execute marketing campaigns.'
Bullet 'Manage social media accounts and create engaging content.'
Bullet 'Deliver online lessons, adapting content to diverse learning needs.'

SubHead "moji Corporation Limited $em Creative Intern (APAC)"
Date "Sep 2024 $en Jul 2025"
Bullet 'Collaborate on design concepts and visual content for digital campaigns.'
Bullet 'Edit and retouch photos; support video content production.'
Bullet 'Participate in brainstorming for upcoming projects.'

SubHead "Seaman Paper Asia $em Graphic Trainee"
Date "Jun 2024 $en Aug 2024"
Bullet 'Handle day-to-day graphic design and coordinate across departments.'
Bullet 'Assist marketing research and assess product ink coverage; support ad hoc projects.'

# ===================== TECHNICAL SKILLS =====================
Section 'TECHNICAL SKILLS'
SubHead 'Video & Motion'
Bullet "Adobe Premiere Pro (advanced) $em editing, color grading, sound design, effects, animation."
Bullet "Adobe After Effects (advanced) $em motion graphics, compositing, VFX, expressions."
Bullet "Blender $em 3D modeling, texturing, rigging, animation."
SubHead 'Design'
Bullet "Adobe Photoshop $em retouching, layer management, digital asset creation."
Bullet "Adobe Illustrator $em logo, typography, iconography, vector illustration."
SubHead 'Development'
Bullet 'JavaScript / TypeScript, React, Three.js, Tailwind CSS, Node.js, Vite, Git, Vercel, SQL.'
Bullet "Python $em data (Pandas, NumPy), web (Flask, Django), automation."
Bullet 'Supabase (Postgres + RLS + edge functions), REST APIs, image/video optimization.'
Bullet 'PowerShell, WPF, Godot (GDScript), HTML/CSS, Electron, MediaPipe.'
SubHead 'AI & Automation'
Bullet 'Midjourney, ComfyUI (Stable Diffusion), CrewAI agentic workflows, LLM tooling.'
SubHead 'Productivity'
Bullet "Microsoft Office (Word, Excel, PowerPoint) $dot Google Suite (Docs, Sheets, Slides)."

# ===================== PROJECTS =====================
Section 'SELECTED PROJECTS'
SubHead "Face Overlay $em Real-time streaming overlay (Electron + MediaPipe)"
Bullet 'Tracks facial landmarks in real time and drives an avatar; captured in OBS.'
SubHead "Cash $em Personal finance system (React + TypeScript + Supabase)"
Bullet 'User app + admin console; 6 tables, RLS, edge functions; onboarding with HK MPF; bilingual.'
SubHead "Gold Finder $em 2D platformer (Godot)"
Bullet 'Hand-built platformer published on itch.io, exported to HTML5.'
SubHead "Obsidian Tasks Widget & Expense Tracker (PowerShell + WPF)"
Bullet 'Always-on-top task widget; markdown-based expense logger with auto-spend summaries.'
SubHead "Portfolio World $em this site (React + Three.js + Tailwind + Supabase)"
Bullet 'Space-themed 3D world with CMS, security headers, SEO, dynamic OG image.'
SubHead "Card-Master $em Firefox extension (fork)"
Bullet 'Card-game browser extension forked from an open-source repo.'

# ===================== EDUCATION =====================
Section 'EDUCATION'
SubHead "Hong Kong Metropolitan University $em BSc Computer Science"
Date "Sep 2024 $en Present"
Bullet 'Coursework: Object-Oriented Programming (Java), Discrete Math, Computer Architecture, Linear Algebra.'
SubHead 'Carmel Bunnan Tong Memorial Secondary School'
Date "Sep 2018 $en May 2024"
Bullet 'Electives: Information & Communications Technology (ICT), Geography.'

# ===================== REFERENCE =====================
Section 'REFERENCES'
SubHead 'Andrea Chu'
Line "Founder & CEO, Virtual Academy International Education Limited  $dot  +852 6290 0006" 9.5 $false 0 3 0 $false
SubHead 'Samuel Jones'
Line "General Manager APAC, Seaman Paper Asia  $dot  +852 2684 3700" 9.5 $false 0 0 0 $false

$out = '<home>\Downloads\SYED-WASI-SHAH_CV_2026_Updated.docx'
$doc.SaveAs2($out)
$doc.Close()
$word.Quit()
Write-Output "Saved: $out"
