-- Add drawn-out diagrams to the remaining projects.

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Built in Godot with GDScript: scenes for the player controller, levels, collectibles and UI.\n- Exported to HTML5 and published on itch.io so it plays in the browser.\n\nGAME LOOP\n┌───────────────┐\n│  Player input │\n└───────┬───────┘\n        ▼\n┌────────────────────────┐\n│   Godot runtime        │\n│   physics · collision  │\n└───────┬────────────────┘\n        ▼\n   HTML5 export ──▶ itch.io'
where id = 'gold-finder';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Windows PowerShell 5.1 + WPF always-on-top widget.\n- Scans the Obsidian vault markdown for frontmatter tasks and open checkboxes.\n- Groups by area and note, with filters, sorting and write-back when you tick a box.\n- A startup installer and a watchdog keep it running.\n\nDATA FLOW\n   Obsidian vault  ( markdown · frontmatter · checkboxes )\n                        │  scan\n                        ▼\n   PowerShell engine ──  group · filter · sort\n                        │  WPF\n                        ▼\n   Always-on-top widget\n                        │  tick a box\n                        ▼\n   write-back to the note file'
where id = 'obsidian-tasks';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- Pure PowerShell, shipped as a Flipper Zero BadUSB payload.\n- Runs a themed cleanup routine (temp files, caches, logs) with a cyberpunk terminal aesthetic.\n- No dependencies - drop it on a target machine and run.\n\nFLOW\n   Flipper Zero ──BadUSB──▶ PowerShell payload\n                                  │\n                                  ▼\n              staged cleanup ( temp · cache · logs )\n                                  │\n                                  ▼\n                  cyberpunk terminal output'
where id = 'flipper-winsweep';

update public.projects set detailed_description = E'HOW IT IS BUILT\n- A Firefox WebExtension written in JavaScript.\n- Forked from LYiHub open-source Card-Master; adds a collectible card-game layer to the browser.\n- Packaged and signed for Firefox distribution.\n\nSTRUCTURE\n   Firefox extension\n     ├─ content script ──▶ card-game layer on the page\n     ├─ popup UI\n     └─ BOTW card assets ( bundled )'
where id = 'card-master';
