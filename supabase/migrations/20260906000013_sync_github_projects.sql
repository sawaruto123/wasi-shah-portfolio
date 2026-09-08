-- Replace seed projects with real GitHub repos from sawaruto123
delete from public.projects;

insert into public.projects
  (id, exp_number, title, category, category_badge, tag, extra_badge, image, col_span, description, tech, github_url, website_url, published, sort_order)
values
  ('face-overlay', '01', 'Face Overlay', 'ai', 'MediaPipe', 'Real-time facial expression overlay for streaming', 'Electron', 'https://opengraph.githubassets.com/1/sawaruto123/face-overlay', '8', 'Real-time facial expression overlay for streaming — a standalone Electron app built on MediaPipe Face Landmarker. No dev server, no browser tab, just a floating window you capture in OBS.', array['JavaScript','Electron','MediaPipe','Vite'], 'https://github.com/sawaruto123/face-overlay', null, true, 0),

  ('flipper-hacksim', '02', 'Flipper HackSim', 'code', 'Cybersecurity', 'Cinematic hacking simulator for Flipper Zero', 'PowerShell', 'https://opengraph.githubassets.com/1/sawaruto123/flipper-hacksim', '4', 'A cinematic PowerShell hacking simulator for Flipper Zero BadUSB featuring fake breaches, ransomware alerts, and cyberpunk terminal effects.', array['PowerShell','Flipper Zero','BadUSB'], 'https://github.com/sawaruto123/flipper-hacksim', null, true, 1),

  ('flipper-winsweep', '03', 'Flipper WinSweep', 'code', 'Utility', 'Cyberpunk Windows cleanup utility', 'PowerShell', 'https://opengraph.githubassets.com/1/sawaruto123/flipper-winsweep', '4', 'Cyberpunk-themed Windows cleanup utility for Flipper Zero BadUSB and PowerShell.', array['PowerShell','Flipper Zero','Windows'], 'https://github.com/sawaruto123/flipper-winsweep', null, true, 2),

  ('fatherday-card', '04', 'Father''s Day Card', 'code', 'Web Design', 'Animated Father''s Day greeting card', 'HTML/CSS', 'https://opengraph.githubassets.com/1/sawaruto123/FatherDay_Card', '4', 'A beautiful, minimalist, and animated web-based greeting card designed for Father''s Day.', array['HTML','CSS','JavaScript'], 'https://github.com/sawaruto123/FatherDay_Card', 'https://father-day-card-gold.vercel.app', true, 3),

  ('dsa-practice', '05', 'DSA Practice', 'code', 'Algorithms', 'DSA practice in Python', 'Python', 'https://opengraph.githubassets.com/1/sawaruto123/dsa-practice', '4', 'DSA practice in Python: tracking my progress from initial brute-force ideas to optimized solutions.', array['Python','DSA','LeetCode'], 'https://github.com/sawaruto123/dsa-practice', null, true, 4);
