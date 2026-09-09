$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

# ---- page: A4, margins ----
$doc.PageSetup.PaperSize = 7
$doc.PageSetup.TopMargin = 30
$doc.PageSetup.BottomMargin = 30
$doc.PageSetup.LeftMargin = 43
$doc.PageSetup.RightMargin = 43
$contentWidth = 595.276 - 86  # A4 width - margins

# ---- colors ----
$blue = 11891758   # RGB(46,116,181) = #2E74B5
$dark = 0

# ---- special chars ----
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
  SetFont 13.5 $true $false $blue 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=8; $sel.ParagraphFormat.SpaceAfter=1
  $sel.TypeText($text); $sel.TypeParagraph()
  # thin blue rule
  $sel.ParagraphFormat.Borders.Item(-3).LineStyle=1
  $sel.ParagraphFormat.Borders.Item(-3).LineWidth=4
  $sel.ParagraphFormat.Borders.Item(-3).Color=$blue
  $sel.Font.Bold=$false
}
function Entry($company,$role,$date,$duties){
  SetFont 10.5 $true $false $dark 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=6; $sel.ParagraphFormat.SpaceAfter=0
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
function SkillGroup($text){  # blue subheading in skills
  SetFont 11 $true $false $blue 'Calibri'
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=6; $sel.ParagraphFormat.SpaceAfter=0
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
  $sel.ParagraphFormat.Alignment=0; $sel.ParagraphFormat.SpaceBefore=5; $sel.ParagraphFormat.SpaceAfter=0
  $sel.TypeText($name); $sel.TypeParagraph()
  Bullet $desc
}

# ===================== HEADER =====================
SetFont 19 $true $false $dark 'Calibri'
$sel.ParagraphFormat.Alignment=1; $sel.ParagraphFormat.SpaceAfter=2
$sel.TypeText("Syed Wasi Shah ($cn)"); $sel.TypeParagraph()

# QR code
$shape = $doc.InlineShapes.AddPicture("<home>\Downloads\image1.png")
$shape.Height = 54; $shape.Width = 54
$sel.ParagraphFormat.Alignment=1; $sel.ParagraphFormat.SpaceAfter=2
$sel.TypeParagraph()

Line "+852 9899 2944  $dot  syedwasi983@gmail.com  $dot  wasi-shah-portfolio.vercel.app" 9 $false $false $dark 1 0
Line "NATIVE-CANTONESE  $pipe  ENGLISH  $pipe  FILMMAKER  $pipe  MOTION DESIGNER  $pipe  GRAPHIC DESIGNER  $pipe  CREATIVE DEVELOPER" 8.5 $false $false $blue 1 6

# thin rule under header (blue)
$sel.ParagraphFormat.Borders.Item(-3).LineStyle=1
$sel.ParagraphFormat.Borders.Item(-3).LineWidth=6
$sel.ParagraphFormat.Borders.Item(-3).Color=$blue

# ===================== PROFILE =====================
Section 'PROFILE'
Line "A team player who is patient, creative and adaptable with experience in various extracurricular activities and projects. A self-disciplined and independent worker who believes in research-based methodology and aims to facilitate task execution efficiently." 10 $false $false $dark 0 2
Line "A multidisciplinary creator telling stories for the digital world $em cutting films, designing brand systems, building interactive tools, and shipping real products." 10 $false $false $dark 0 2
Line "Languages: Cantonese (Native) $dot English (Native) $dot Mandarin (Fluent)" 10 $false $false $dark 0 2

# ===================== EXPERIENCE =====================
Section 'WORK EXPERIENCE'
Entry 'Seaman Paper Asia' 'Graphic Part Time Trainee' "June 2024 $en August 2024" @(
 'Assist in handling day-to-day graphic design work as assigned by Senior Graphic Designer',
 'Coordinate with various internal departments for marketing materials',
 'Assist in marketing research',
 'Assist in assessing ink coverage of TP products',
 'Support ad hoc projects as required'
)
Entry 'Virtual Academy International' 'Marketing Part Time & Teacher' "June 2024 $en Current" @(
 'Research target markets',
 'Plan and execute marketing campaigns',
 'Manage social media accounts',
 'Deliver engaging online lessons, adapting content to diverse learning needs'
)
Entry 'moji Corporation Limited' 'Creative Intern (APAC)' "September 2024 $en July 2025" @(
 'Collaborate with the creative team to develop innovative design concepts',
 'Assist in creating visual content for digital marketing campaigns',
 'Participate in brainstorming sessions for upcoming projects',
 'Edit and retouch photos for promotional materials',
 'Support the production of video content as needed'
)
Entry 'Behance Co Limited' 'Adobe Ambassador' "May 2025 $en Current" @(
 'Representation: Liaise between vendor and prospective students/parents',
 'Outreach and Recruitment: Engage potential students via social media and events',
 'Content Creation: Develop blogs, videos, and promotional materials',
 'Workshop Content Creation: Design instructional materials and presentations',
 'Workshop Teaching: Deliver content, encourage participation, and support students',
 'Event Coordination: Plan and execute online/offline events',
 'Networking: Build relationships with industry professionals and alumni'
)

# ===================== PROFESSIONAL SKILLS =====================
Section 'PROFESSIONAL SKILLS'
SkillGroup 'Video Editing & Motion Graphics'
Skill 'Adobe Premiere Pro (Mastery)' 'Comprehensive command of video editing, including advanced color grading, sound design, effects integration, and animation.'
Skill 'Adobe After Effects (Mastery)' 'Expert proficiency in motion graphics, visual effects, compositing, and dynamic animation.'
Skill 'Blender (Basic)' 'Fundamental 3D modeling, texturing, rigging, and animation for video and motion graphics integration.'
SkillGroup 'Graphic Design'
Skill 'Adobe Photoshop (Proficiency)' 'Image editing, retouching, layer management, and digital asset creation.'
Skill 'Adobe Illustrator (Proficiency)' 'Vector tools for logo design, typography, iconography, and scalable illustrations.'
SkillGroup 'Web & Development'
Skill 'JavaScript / TypeScript / React' 'Interactive web apps, including this Three.js portfolio and the Cash finance system.'
Skill 'Supabase / Postgres / REST' 'Backend, RLS, edge functions, image & video optimization.'
Skill 'Python' 'Data manipulation (Pandas, NumPy) and web development (Flask, Django).'
Skill 'PowerShell / WPF / Godot' 'Desktop tools and a Godot platformer; HTML/CSS, Electron, MediaPipe.'
SkillGroup 'AI & Automation'
Skill 'ComfyUI / Midjourney / CrewAI' 'Custom Stable Diffusion workflows and agentic task orchestration.'
SkillGroup 'Productivity & Collaboration'
Skill 'MS Office & Google Suite' 'Document, spreadsheet, and presentation creation with consistent quality.'

# ===================== SELECTED PROJECTS =====================
Section 'SELECTED PROJECTS'
Proj 'Face Overlay $em Real-time streaming overlay (Electron + MediaPipe)' 'Tracks facial landmarks in real time, drives an avatar, captured in OBS.'
Proj 'Cash $em Personal finance system (React + TypeScript + Supabase)' 'User app + admin console; 6 tables, RLS, edge functions; HK MPF; bilingual UI.'
Proj 'Gold Finder $em 2D platformer (Godot)' 'Hand-built platformer published on itch.io, exported to HTML5.'
Proj 'Obsidian Tasks Widget & Expense Tracker (PowerShell + WPF)' 'Always-on-top task widget and markdown-based expense logger.'
Proj 'Portfolio World $em this site (React + Three.js + Tailwind + Supabase)' 'Space-themed 3D world with CMS, security headers, and SEO.'

# ===================== EDUCATION =====================
Section 'EDUCATION'
Entry 'Hong Kong Metropolitan University' 'BSc Computer Science' "September 2024 $en Current" @(
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
