$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

$doc.PageSetup.PaperSize = 7
$doc.PageSetup.TopMargin = 30
$doc.PageSetup.BottomMargin = 30
$doc.PageSetup.LeftMargin = 43
$doc.PageSetup.RightMargin = 43
$contentWidth = 595.276 - 86

$blue = 11891758   # RGB(46,116,181)
$dark = 0
$em = [string][char]0x2014
$en = [string][char]0x2013
$bullet = [string][char]0x2022
$dot = [string][char]0x00B7
$pipe = [string][char]0x007C
$cn = [string][char]0x5CEF + [string][char]0x5C71

function SetFont($size,$bold,$italic,$color,$name){
  $sel.Font.Size=[single]$size; $sel.Font.Bold=$bold; $sel.Font.Italic=$italic
  if($name){$sel.Font.Name=$name}
  if($color){$sel.Font.Color=$color}
}
function Line($text,$size,$bold,$italic,$color,$align,$after){
  SetFont $size $bold $italic $color 'Calibri'
  $sel.ParagraphFormat.Alignment=$align; $sel.ParagraphFormat.SpaceAfter=$after
  $sel.TypeText($text); $sel.TypeParagraph()
}
function Section($text){
  SetFont 13 $true $false $blue 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=7; $sel.ParagraphFormat.SpaceAfter=1
  $sel.TypeText($text); $sel.TypeParagraph()
  $sel.ParagraphFormat.Borders.Item(-3).LineStyle=1
  $sel.ParagraphFormat.Borders.Item(-3).LineWidth=4
  $sel.ParagraphFormat.Borders.Item(-3).Color=$blue
  $sel.Font.Bold=$false
}
function Entry($company,$role,$date,$duties){
  SetFont 10.5 $true $false $dark 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=5; $sel.ParagraphFormat.SpaceAfter=0
  $sel.ParagraphFormat.TabStops.Add($contentWidth,2)
  $sel.TypeText("$company`t$date"); $sel.TypeParagraph()
  SetFont 10.5 $false $true $dark 'Calibri'
  $sel.ParagraphFormat.TabStops.ClearAll()
  $sel.TypeText($role); $sel.TypeParagraph()
  SetFont 10 $true $true $dark 'Calibri'
  $sel.TypeText('Duties:'); $sel.TypeParagraph()
  foreach($d in $duties){ Bullet $d }
}
function Bullet($text){
  SetFont 10 $false $false $dark 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.LeftIndent=16; $sel.ParagraphFormat.SpaceAfter=0
  $sel.TypeText("$bullet  "+$text); $sel.TypeParagraph()
}
function SkillGroup($text){
  SetFont 10.5 $true $false $blue 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=5; $sel.ParagraphFormat.SpaceAfter=0
  $sel.TypeText($text); $sel.TypeParagraph()
}
function Skill($name,$desc){
  SetFont 10 $false $false $dark 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.LeftIndent=16; $sel.ParagraphFormat.SpaceAfter=1
  $sel.TypeText("$bullet  ")
  $sel.Font.Bold=$true; $sel.TypeText($name)
  $sel.Font.Bold=$false
  $sel.TypeText(" $em $desc")
  $sel.TypeParagraph()
}
function Proj($name,$desc){
  SetFont 10.5 $true $false $dark 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=4; $sel.ParagraphFormat.SpaceAfter=0
  $sel.TypeText($name); $sel.TypeParagraph()
  Bullet $desc
}

# ===================== HEADER =====================
SetFont 19 $true $false $dark 'Calibri'
$sel.ParagraphFormat.Alignment=1; $sel.ParagraphFormat.SpaceAfter=1
$sel.TypeText("Syed Wasi Shah ($cn)"); $sel.TypeParagraph()

$shape = $doc.InlineShapes.AddPicture("<home>\Downloads\image1.png")
$shape.Height = 44; $shape.Width = 44
$sel.ParagraphFormat.Alignment=1; $sel.ParagraphFormat.SpaceAfter=1
$sel.TypeParagraph()

Line "+852 9899 2944  $dot  syedwasi983@gmail.com  $dot  wasi-shah-portfolio.vercel.app" 9 $false $false $dark 1 0
Line "NATIVE-CANTONESE  $pipe  ENGLISH  $pipe  FILMMAKER  $pipe  MOTION DESIGNER  $pipe  GRAPHIC DESIGNER  $pipe  CREATIVE DEVELOPER" 8.5 $false $false $blue 1 5
$sel.ParagraphFormat.Borders.Item(-3).LineStyle=1
$sel.ParagraphFormat.Borders.Item(-3).LineWidth=6
$sel.ParagraphFormat.Borders.Item(-3).Color=$blue

# ===================== PROFILE =====================
Section 'PROFILE'
Line "A patient, creative and adaptable team player with experience across marketing, teaching, and creative production. A self-disciplined, research-based independent worker who ships real products $em from films and design systems to interactive tools." 10 $false $false $dark 0 2
Line "Languages: Cantonese (Native) $dot English (Native) $dot Mandarin (Fluent)" 10 $false $false $dark 0 2

# ===================== EXPERIENCE =====================
Section 'WORK EXPERIENCE'
Entry 'Behance Co Limited' 'Adobe Ambassador' "May 2025 $en Present" @(
 'Liaise between vendor and prospective students/parents; outreach via social media and events',
 'Create blogs, videos, workshop & instructional content; deliver workshops and presentations',
 'Plan and run online/offline events; build relationships with professionals and alumni'
)
Entry 'Virtual Academy International' 'Marketing Part Time & Teacher' "June 2024 $en Present" @(
 'Research target markets; plan and execute marketing campaigns; manage social media',
 'Deliver engaging online lessons, adapting content to diverse learning needs'
)
Entry 'moji Corporation Limited' 'Creative Intern (APAC)' "September 2024 $en July 2025" @(
 'Collaborate on design concepts and visual content for digital campaigns',
 'Edit and retouch photos; support video production; participate in brainstorming'
)
Entry 'Seaman Paper Asia' 'Graphic Part Time Trainee' "June 2024 $en August 2024" @(
 'Handle day-to-day graphic design; coordinate with departments for marketing materials',
 'Assist marketing research and assess product ink coverage; support ad hoc projects'
)

# ===================== PROFESSIONAL SKILLS =====================
Section 'PROFESSIONAL SKILLS'
SkillGroup 'Video & Motion'
Skill 'Adobe Premiere Pro (Mastery)' 'Advanced editing, color grading, sound design, effects, and animation.'
Skill 'Adobe After Effects (Mastery)' 'Motion graphics, compositing, and dynamic animation.'
Skill 'Blender (Basic)' '3D modeling, texturing, rigging, and animation.'
SkillGroup 'Graphic Design'
Skill 'Adobe Photoshop (Proficiency)' 'Image editing, retouching, and digital asset creation.'
Skill 'Adobe Illustrator (Proficiency)' 'Logo design, typography, iconography, and vector illustration.'
SkillGroup 'Web & Development'
Skill 'JavaScript / TypeScript / React / Three.js' 'Interactive web apps and 3D worlds.'
Skill 'Supabase / Postgres / REST' 'Backend, RLS, edge functions, image & video optimization.'
Skill 'PowerShell / WPF / Godot / Python' 'Desktop tools, a Godot platformer, and automation.'
SkillGroup 'AI & Automation'
Skill 'ComfyUI / Midjourney / CrewAI' 'Custom Stable Diffusion workflows and agentic orchestration.'
SkillGroup 'Productivity'
Skill 'MS Office & Google Suite' 'Documents, spreadsheets, and presentations.'

# ===================== SELECTED PROJECTS =====================
Section 'SELECTED PROJECTS'
Proj "Face Overlay $em streaming avatar (Electron + MediaPipe)" 'Real-time facial tracking that drives an avatar, captured in OBS.'
Proj "Cash $em finance system (React + TypeScript + Supabase)" 'User app + admin console; RLS, edge functions, HK MPF, bilingual.'
Proj "Gold Finder $em 2D platformer (Godot)" 'Published on itch.io, exported to HTML5.'
Proj "Obsidian Tools & Portfolio World" 'PowerShell/WPF task widget & expense tracker; and this 3D site with CMS.'

# ===================== EDUCATION =====================
Section 'EDUCATION'
Entry 'Hong Kong Metropolitan University' 'BSc Computer Science' "September 2024 $en Present" @(
 'Coursework: Object-Oriented Programming (Java), Discrete Mathematics, Computer Architecture, Linear Algebra'
)
Entry 'Carmel Bunnan Tong Memorial Secondary School' 'Secondary Education' "September 2018 $en May 2024" @(
 'Electives: Information & Communications Technology (ICT), Geography'
)

# ===================== REFERENCE =====================
Section 'REFERENCES'
Entry 'Andrea Chu' 'Founder & CEO, Virtual Academy International Education Limited' '' @('Phone: +852 6290 0006')
Entry 'Samuel Jones' 'General Manager APAC, Seaman Paper Asia' '' @('Phone: +852 2684 3700')

$out = '<home>\Downloads\SYED-WASI-SHAH_CV_2026_Updated.docx'
$doc.SaveAs2($out)
$doc.Close(); $word.Quit()
Write-Output "Saved: $out"
