---
name: RIFTBALL — World Chronicle
description: One great illuminated codex lying open on a scriptorium desk; every section is a spread, and time advances by turning the page.
colors:
  desk: "#1b120c"
  desk-2: "#2a1b11"
  leather: "#4a1512"
  leather-2: "#2e0b09"
  oxblood: "#5e1a17"
  vellum: "#efe3c6"
  vellum-2: "#e6d6b2"
  vellum-3: "#d8c49a"
  ink: "#2b1d14"
  ink-2: "#56412f"
  ink-3: "#7a6248"
  rubric: "#a3271c"
  lapis: "#1f3d7a"
  verdigris: "#2f6b57"
  murex: "#5a2a6b"
  sable: "#2a231f"
  gold: "#c8962e"
  gold-hi: "#f0cf6a"
  gold-deep: "#7a5414"
  rubric-paper: "#fbf1d8"
  leaf-white: "#fff4d6"
typography:
  display:
    fontFamily: "Grenze Gotisch, serif"
    fontSize: "clamp(2.8rem, 4.4vw, 4.9rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.005em"
  numeral:
    fontFamily: "Grenze Gotisch, serif"
    fontSize: "clamp(3.6rem, 6vw, 5.6rem)"
    fontWeight: 900
    lineHeight: 0.95
    fontFeature: "lnum"
  headline:
    fontFamily: "Grenze Gotisch, serif"
    fontSize: "clamp(1.7rem, 2.2vw, 2.3rem)"
    fontWeight: 700
    lineHeight: 1
  title-lead:
    fontFamily: "Alegreya, serif"
    fontSize: "clamp(1.7rem, 2.4vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 1.08
  title:
    fontFamily: "Alegreya, serif"
    fontSize: "1.22rem"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Alegreya, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "onum, pnum"
  rubric:
    fontFamily: "Alegreya SC, serif"
    fontSize: "0.92rem"
    fontWeight: 700
    lineHeight: 1.2
  data:
    fontFamily: "Alegreya Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.3
    fontFeature: "lnum, tnum"
rounded:
  hairline: "2px"
  leaf: "3px"
  binding: "10px"
  arena: "18px"
  round: "50%"
spacing:
  row: "7px"
  gap: "14px"
  block: "26px"
  section: "34px"
  page: "clamp(22px, 3.6vw, 60px)"
components:
  button-gilt:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    typography: "{typography.rubric}"
    rounded: "{rounded.leaf}"
    padding: "10px 26px"
    height: "46px"
  button-ink:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.ink}"
    typography: "{typography.rubric}"
    rounded: "{rounded.leaf}"
    padding: "8px 18px"
    height: "42px"
  button-ink-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.vellum}"
  button-ink-danger:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.rubric}"
  choice-option:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.ink-2}"
    typography: "{typography.rubric}"
    rounded: "{rounded.hairline}"
    padding: "6px 14px"
    height: "38px"
  choice-option-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.vellum}"
  seek-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "8px 4px"
    height: "44px"
  ribbon:
    textColor: "{colors.rubric-paper}"
    typography: "{typography.rubric}"
    padding: "12px 4px 0"
    width: "clamp(64px, 6.2vw, 104px)"
    height: "78px"
  ribbon-open:
    height: "104px"
  turn-tab:
    backgroundColor: "{colors.vellum}"
    textColor: "{colors.rubric}"
    typography: "{typography.headline}"
    padding: "18px 30px 14px 16px"
  ledger-head:
    textColor: "{colors.rubric}"
    typography: "{typography.rubric}"
    padding: "8px"
  ledger-cell:
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    padding: "7px 8px"
  scoreboard:
    backgroundColor: "{colors.oxblood}"
    textColor: "{colors.leaf-white}"
    typography: "{typography.numeral}"
    padding: "22px clamp(18px, 3vw, 46px)"
---

# Design System: RIFTBALL — World Chronicle

## Overview

**Creative North Star: "The Illuminated Codex"**

The whole game is one book. A dark oak desk under a warm candle pool holds an oxblood leather binding with brass corner bosses and a tooled gilt border; inside it lies a two-page vellum spread with deckled edges, foxing, a shaded gutter and vine borders in the outer margins. Every section (Chronicle, Tourneys, Bestiary, Armorial, the Lists, Rolls, Annals) is another spread of that same book, chosen by a silk ribbon hanging from the masthead, and time advances by turning the leaf. Nothing floats on a dashboard; everything is written, rubricated, illuminated or bound.

Pigments own whole regions rather than accenting small ones: a lapis field fills the contest-to-come arch and the Grand Rift bracket, an oxblood banner carries the scoreboard, verdigris and murex wash the trait and spark panels. Text is iron-gall ink on vellum; rubrics (headings, labels, ranks, meta) are red. Burnished gold leaf is kept for "now, next" and honours. The voice of the type matches the voice of the writing: blackletter for what a scribe would letter large, calligraphic humanist text for reading, small caps for rubrics, and a quiet humanist sans only where numbers need to line up.

Density is a reading book's, not a terminal's. Long stories run at 58–62ch, ledgers are ruled in faint red rather than boxed, and stat tiles are replaced by two-column ruled ledgers. The interface refuses the dark sidebar dashboard of framed panels and card grids.

**Key Characteristics:**
- One continuous object: desk, binding, vellum spread, gutter, ribbons, turn tab.
- Pigment fields (lapis, oxblood, verdigris, murex) own whole regions; small accents stay ink and rubric.
- Burnished leaf marks only the present, the next action and honours.
- Blackletter display, Alegreya text, Alegreya SC rubrics, Alegreya Sans for figures.
- Ruled red lines instead of boxes; old-style figures in prose, lining tabular figures in ledgers.
- Motion is physical: leaf turns, ink writing on, ribbons lowering, seals cracking, a gold glint on honours.

## Colors

A manuscript palette: dark oak and leather around the book, warm vellum and iron-gall ink on the page, and five saturated pigments plus gold leaf used as fields.

### Primary
- **Rubric Red** (#a3271c): the scribe's red. Section heads, labels, ranks, datelines, glosses, ledger headers and their ruling, the winning side's name, danger states, red-letter weeks on the calendar. The Chronicle ribbon's silk is the same pigment (exposed in code as both `--rubric` and `--vermilion`).

### Secondary
- **Lapis Ground** (#1f3d7a): the miniature ground. Fills the contest-to-come arch and the lead miniature (the Grand Rift uses its deeper gradient, #1b3570 to #142a5a), sprinkled with gold dots. Also the focus outline colour and the Tourneys silk.
- **Oxblood Banner** (#5e1a17): the scoreboard banner (graded #6e1f18 to #4a1210) and the Rolls silk. Close kin to the binding.

### Tertiary
- **Verdigris** (#2f6b57): wins, "saved" state, rising zones, professional rarity, trait panels, the vine borders, the Bestiary silk.
- **Murex Purple** (#5a2a6b): extraordinary rarity, spark-ability panels, the Lists silk.
- **Burnished Gold** (#c8962e), **Gold Highlight** (#f0cf6a), **Gold Shadow** (#7a5414): gold leaf and gold linework. As burnished leaf (a lit, noise-textured gold with one highlight band) it marks the current week, the primary "next" action, great ratings and legendary/generational frames. As flat line it draws bracket joins, progress fills, rarity rings and lettering on lapis and oxblood fields.

### Neutral
- **Scriptorium Desk** (#1b120c) and **Desk Oak** (#2a1b11): the page background beyond the book, with a wood grain, a candle pool at top centre and a dark vignette.
- **Binding Leather** (#4a1512) and **Leather Shadow** (#2e0b09): the codex cover, the "Further" tab of the turn control, the closed-book loading cover.
- **Vellum** (#efe3c6), **Vellum Shade** (#e6d6b2), **Vellum Edge** (#d8c49a): the page, inactive realm tabs, miniature grounds and paper edges.
- **Iron-Gall Ink** (#2b1d14), **Faded Ink** (#56412f), **Ghost Ink** (#7a6248): text, secondary text, tertiary/placeholder text and draws.
- **Sable** (#2a231f): the Annals silk.
- **Rubric Paper** (#fbf1d8) and **Leaf White** (#fff4d6): text set on rubric, ribbons and pigment fields; big numerals on lapis and oxblood.

### Named Rules
**The Leaf Is Earned Rule.** Burnished leaf appears only on the present (current calendar week), the next action (the gilt button) and honours (great ratings, gilt seals, legendary and generational frames). Flat gold may draw lines and letter on pigment fields; leaf may not decorate.

**The Pigment Owns The Region Rule.** A pigment is a ground, not a sprinkle. Lapis, oxblood, verdigris and murex fill a whole miniature, banner or panel, with light text on top or a translucent wash (8–10% fill, 40–50% edge) behind ink. Never tint small chips in five colours.

**The Ink And Rubric Rule.** On vellum, text is ink; anything that labels, ranks, dates or heads is rubric red. Do not introduce a third text colour for emphasis.

## Typography

**Display Font:** Grenze Gotisch (with serif)
**Body Font:** Alegreya (with serif)
**Rubric Font:** Alegreya SC (with serif)
**Data Font:** Alegreya Sans (with sans-serif)

**Character:** A heavy, legible blackletter carries titles, section heads and great numerals the way a scribe letters them large; Alegreya's calligraphic humanism carries reading text, with its small-caps cut doing every rubric job and its sans sibling setting figures.

### Hierarchy
- **Display** (Grenze Gotisch 900, clamp(2.8rem, 4.4vw, 4.9rem), 0.92): the folio title of every spread ("The Chronicle"), balanced; a word may turn red.
- **Numeral** (Grenze Gotisch 900, clamp(3.6rem, 6vw, 5.6rem), 0.95, lining): scores on the scoreboard; the arch score (clamp(2.6rem, 4vw, 3.8rem)) and great ratings (2.6rem) are smaller cuts of the same role.
- **Headline** (Grenze Gotisch 700, clamp(1.7rem, 2.2vw, 2.3rem), 1): page heads, always rubric red; also the Turn the Page label and contest tabs.
- **Title** (Alegreya 800): the lead story headline (clamp(1.7rem, 2.4vw, 2.4rem), 1.08) and every story, athlete and gift heading (1.12–1.5rem, 1.1–1.2), balanced.
- **Body** (Alegreya 400, 1.125rem, 1.55, old-style proportional figures): reading text; lead body at 1.2rem / 1.6 to 62ch; folio subtitles and asides in italic Faded Ink to 58ch.
- **Rubric** (Alegreya SC 700, 0.8–1.1rem): labels, ranks, datelines, ribbon names, choice labels, ledger headers, button text. Real small caps, never uppercase plus tracking.
- **Data** (Alegreya Sans 400/700, 0.78–1.5rem, lining tabular figures): ledger cells, scores in lists, records, glosses under ribbons, keys and counts.

### Named Rules
**The Real Small Caps Rule.** Labels get the Alegreya SC cut, not `text-transform: uppercase` with letter-spacing. The build has no tracked uppercase anywhere.

**The Two Figure Styles Rule.** Prose uses old-style figures; anything that is counted, compared or aligned uses lining tabular figures in Alegreya Sans.

## Layout

The viewport is a desk. The book is centred at max 1540px wide with 8–40px of desk either side and 140px below, and it renders as a two-column spread (verso and recto, 1fr 1fr) split by a 90px gutter shade. Pages are padded by the page measure (clamp(22px, 3.6vw, 60px)) plus 26px on the gutter side, 34px top and 64px bottom; a full-width "across" band spans both pages for folio openings and the scoreboard. A vine border runs down each outer margin at 55% opacity.

The masthead is sticky at the top: seven silk ribbons hang centred over the binding, and the Turn the Page tab hangs at the top right beside them. (This is a deliberate departure from the brief's bottom-corner placement, which shipped and was kept.) Inside the book, a headband carries the wordmark, a 26-week calendar strip and the running head with Year and Round.

Rhythm: rows are ruled at 7px vertical padding; stories at 14px; rules and block gaps at 26px; sections at 34–40px. Ledgers sit flush with faint red rules, not in boxes.

Responsive: at 1250px recto pairs and the bracket collapse to one or two columns; at 1100px the headband wraps the calendar onto its own row and the scoreboard stacks the score above the houses; at 900px the spread becomes a single page (gutter, vines and the second page's left edge give way to a dashed red rule), ribbons scroll horizontally and fact ledgers become one column; at 600px the turn tab sheds its subtitle and illuminations shrink.

## Elevation & Depth

Depth is physical, not interface-layered: the book has real weight on the desk, and things on the page are either written into it (flat, ruled) or laid on it (miniatures, seals, slips) with a soft warm shadow. The page itself is flat and ruled; shadows are brown-black, warm and diffuse.

### Shadow Vocabulary
- **Book on the desk** (`box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 12px 24px rgba(0,0,0,0.45)` plus inset leather lips): the codex only.
- **Laid-on object** (`box-shadow: 0 2px 4px rgba(50,30,10,0.3)`): miniatures, rating seals; lifts to `0 10px 18px rgba(50,30,10,0.38)` on hover.
- **Illumination** (`box-shadow: 0 10px 22px rgba(30,20,10,0.35)` with a 1–1.5px ink keyline): pigment fields (arch, scoreboard, Grand Rift, lead miniature).
- **Hanging silk** (`filter: drop-shadow(0 4px 3px rgba(0,0,0,0.45))`): ribbons; the turn tab uses `drop-shadow(0 8px 12px rgba(0,0,0,0.5))`.
- **Loose slip** (`box-shadow: 0 14px 30px rgba(0,0,0,0.5)` to `0 30px 60px rgba(0,0,0,0.6)`): marginal notes, the turn menu, the scriptorium modal.

### Named Rules
**The Written Or Laid Rule.** Text, ledgers and rules written on the vellum carry no shadow (lettering on silk and leaf may take a soft 1px emboss). Only objects that would physically sit on a page (miniatures, seals, slips, illuminations) cast one.

## Shapes

Corners are nearly square: 2px on choices and selects, 3px on buttons, the page and slips, 10px/14px only on the leather binding, 18px on the arena field, full circles only for seals, form pips, save marks and medal faces. Silhouettes come from the manuscript instead of radius: swallow-tailed ribbons (`clip-path` notch at 80%), a dog-eared turn tab with a folded corner, a round-topped arch for the contest to come, a banner with forked tails for the scoreboard, a gilt tooled border (border-image) around the binding, brass L-shaped corner bosses, deckled page edges. Frames are concentric keylines (ink, gold, vellum rings via stacked box-shadows) rather than thick borders.

## Components

### Buttons
Character: gilt for the one next action, ink outline for everything else.
- **Shape:** gently squared (3px).
- **Gilt (primary):** burnished leaf with a highlight band, Gold Shadow edge (#5a3e0c), dark brown rubric text, 46px tall, 10px 26px. Hover lifts 1px and brightens 6%; active presses 1px; disabled greys to 70%.
- **Ink (secondary):** translucent vellum with a 1.5px Faded Ink border, rubric small caps, 42px. Hover fills solid ink with vellum text. Danger variant is rubric-bordered and fills rubric on hover.
- **Focus:** 2.5px lapis outline, 3px offset, everywhere.

### Chips (choices)
- **Style:** a row of 38px rubric buttons with a hairline ink border at 35% on translucent vellum, labelled by a rubric-red choice label above.
- **State:** selected fills solid ink with vellum text; compact variant at 34px.

### Cards / Containers
- **Corner Style:** square to 3px.
- **Background:** no white cards. Containers are pigment washes (verdigris trait, murex spark, lapis spotlight, rubric injury) at 8–10% with a 1px edge at 40–50%, or full pigment fields for illuminations.
- **Shadow Strategy:** washes are written (no shadow); illuminations cast the Illumination shadow.
- **Internal Padding:** 16–18px.

### Inputs / Fields
- **Search:** an underline only (2px Faded Ink), italic Alegreya at 1.2rem, rubric caret; focus turns the underline rubric.
- **Select:** 40px, hairline ink border, translucent vellum, a rubric chevron.

### Navigation
- **Ribbons:** seven silk bookmarks (vermilion, lapis, verdigris, gold-shadow, murex, oxblood, sable), 78px long with a swallowtail, a ribbed silk sheen, Rubric Paper small-caps name over a Data gloss. Hover lowers to 88px; the open section hangs to 104px with a gold-hi bar under its name. On narrow screens they scroll horizontally.
- **Turn the Page:** a vellum tab with a folded corner hanging from the masthead's top right, headline "Turn the page" in rubric with an hourglass and the week to be played; a leather "Further" tab beside it unrolls a vellum menu of longer jumps.

### Ledgers
Tables are ruled, not gridded: rubric small-caps headers over a 1.5px rubric rule, Alegreya Sans lining tabular cells with 1px rubric rules at 22%, rows at 7px. Linkable rows warm to gold at 16% on hover. Fact sets are two-column ruled ledgers (name in small caps left, figure right), never stat tiles.

### Miniatures
Square portrait frames with a 2px ink border on a Vellum Edge ground. Rarity sets the frame pigment: verdigris, lapis with an inner gold ring, murex with inner gold, a 3px gold frame for legendary, gold-hi with rubric and gold-deep rings for generational. Legendary and generational carry a slow gold glint (5.5s).

### Illuminated Fields
The scoreboard (oxblood banner with gold borders and forked tails), the contest-to-come arch and the Grand Rift (lapis with a gold dot diaper and a gilt border) are the system's signature fields: houses' shields, blackletter scores in Leaf White, rubric small caps in Gold Highlight.

### Wax Seal
Results stay sealed. The seal halves crack apart (600ms, translate and rotate outward, fading) when the reader breaks it.

## Do's and Don'ts

### Do:
- **Do** put every section inside the same book: desk, binding, vellum spread, ribbons, turn tab.
- **Do** fill whole regions with a pigment (lapis, oxblood, verdigris, murex) and set Leaf White or Gold Highlight on top.
- **Do** keep burnished leaf for the current week, the next action and honours.
- **Do** set labels in Alegreya SC 700 rubric red, and figures in Alegreya Sans with lining tabular numerals.
- **Do** rule ledgers with faint red lines (1px at 20–25%, header 1.5px solid rubric).
- **Do** move like objects: leaf turns (880ms, cubic-bezier(0.45, 0.05, 0.25, 1)), ink writing on (blur-to-sharp, 760ms), ribbons lowering (420ms), seals cracking (600ms), all collapsing under reduced motion.

### Don't:
- **Don't** build a dark sidebar dashboard, framed panels or grids of bordered cards.
- **Don't** use `text-transform: uppercase` with letter-spacing for labels; use the real small caps cut.
- **Don't** put burnished leaf on decoration, ordinary buttons or headings.
- **Don't** use white or grey surfaces, cool greys or blue-black shadows; every surface is vellum, leather, oak or pigment.
- **Don't** round corners past 3px on page objects; shape comes from silhouettes (swallowtails, dog-ears, arches, banners).
- **Don't** cast shadows from text, rules or ledgers written on the vellum; only laid-on objects cast.
