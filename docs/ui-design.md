# UI & Atmospheric Design Specification

This specification defines the generic visual architecture, legibility invariants, and declarative **Atmospheric Profile** tokens for `inc-engine`.

The UI shell (`index.html` and `src/ui/app.js`) is strictly theme-agnostic: it contains zero game-specific branches or hardcoded theme rules. Every visual behavior, from readable controls over arbitrary artwork to deep genre immersion (claustrophobic cosmic dread, warm arcane sanctums, or clinical orbital telemetry), is expressed through generic CSS custom properties in `GameConfig.palette`.

---

## 1. Core Principles

1. **Artwork-Agnostic Legibility**: Any `GameConfig` may supply full-bleed procedural or illustrated artwork of arbitrary brightness, saturation, and focal composition. Interactive controls and card typography must remain effortlessly readable regardless of whether the underlying pixel is pitch black or blinding white.
2. **Low-Glare Multi-Hour Comfort**: Incremental games are observed over extended sessions. High-contrast neon blocks and 100%-saturated text against pure black cause visual fatigue and flatten the sense of atmosphere. Contrast is governed by a strict luminance hierarchy.
3. **Declarative Immersion ("Extra Everything" via Tokens)**: Genre atmosphere is not achieved by writing custom HTML/JS per game; it is achieved by giving `GameConfig.palette` expressive atmospheric levers (vignettes, surface textures, eerie text glows, border styles, and color temperature) that the generic UI shell renders automatically.
4. **Fidelity-Aware Rendering**: All atmospheric effects and ambient glows respect the player's **Fidelity Mode** (`Full`, `Eco`, `Minimal`, and individual effect toggles) so low-power devices can disable GPU blurs or ambient animations cleanly.

---

## 2. Smoked-Glass Scrim & Button Architecture

### Problem
- **Translucent tinted buttons over full-bleed art** lose contrast whenever bright artwork (glowing orbs, golden highlights, starlight) passes behind the button text.
- **Solid-fill primary buttons** (`background: var(--primary)` with dark text) create harsh, high-glare neon rectangles that overpower the surrounding dark card surface and break immersion.

### Invariant: The Smoked-Glass Scrim
All interactive action buttons (`.btn.primary`, `.btn.secondary`, `.btn-upgrade`, `.btn-buy-1`, `.btn-buy-max`) use a unified **Smoked-Glass Scrim**:

| State | Background | Text Color | Border & Luminance Cue |
| :--- | :--- | :--- | :--- |
| **Primary Affordable** (`Buy 1`, `Upgrade`) | `rgba(0, 0, 0, 0.60)` | `#ffffff` (crisp white) | `1px solid var(--btn-primary-border, var(--primary))` + subtle inset/outer theme glow (`var(--btn-primary-glow)`) |
| **Primary Hover** | `rgba(0, 0, 0, 0.75)` | `#ffffff` | Brightened `var(--primary)` border + elevated theme glow |
| **Secondary Affordable** (`Buy Max`, utility) | `rgba(0, 0, 0, 0.60)` | `var(--btn-sec-color, rgba(255, 255, 255, 0.90))` | `1px solid var(--btn-sec-border, rgba(255, 255, 255, 0.22))` |
| **Disabled / Unaffordable** | `rgba(0, 0, 0, 0.45)` | `rgba(255, 255, 255, 0.40)` | `1px solid rgba(255, 255, 255, 0.08)` (no glow) |
| **Danger / Prestige Reset** | `rgba(0, 0, 0, 0.65)` | `#ffffff` | `1px solid var(--danger)` + subtle crimson inset glow |

### Full-Bleed Card Typography Protection (`.card.upg-card`)
When a card uses full-bleed background artwork:
1. **Directional Scrim**: `.card.upg-card::before` applies `--upg-card-scrim` (defaulting to a multi-stop dark gradient `rgba(4, 6, 12, 0.90)` on the text/action side tapering to `rgba(4, 6, 12, 0.68)` on the art reveal side).
2. **Text Haloing**: Card headings, lore quotes, and mechanical descriptions over artwork apply `text-shadow: 0 1px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(0, 0, 0, 0.75)` so letterforms remain crisp over bright highlights.

---

## 3. Surface Luminance & Contrast Hierarchy

To prevent the UI from looking overly bright, flat, or clinical, `GameConfig.palette` colors should follow a bounded luminance ladder:

1. **Abyss / Canvas Background (`--bg`)**: `3% - 6%` lightness. Deep, desaturated environment tone.
2. **Panel & Card Surfaces (`--card-bg`, `--card-bg-gradient`)**: `6% - 11%` lightness with `88% - 95%` opacity, allowing subtle environmental bleed without sacrificing text contrast.
3. **Structural Borders (`--card-border`)**: Low-opacity (`18% - 35%`) desaturated theme tint. Borders frame the layout quietly rather than drawing neon boxes around every element.
4. **Body & Lore Copy (`--text`, `--text-muted`)**:
   - `--text`: Soft off-white or parchment/bone (`82% - 92%` lightness, never harsh `#ffffff` for long-form copy).
   - `--text-muted`: Desaturated atmospheric mid-tone (`55% - 68%` lightness) for lore quotes, secondary labels, and telemetry headers.
5. **Primary Accent (`--primary`)**: Reserved for active focal points (currency totals, card titles, active progress bars, affordable button borders, and rarity indicators). Avoid neon-saturated cyan/magenta (`100%` saturation); prefer rich, atmospheric hues (`45% - 75%` saturation) so the theme feels grounded in its world.

---

## 4. Declarative Atmospheric Profile Tokens (`GameConfig.palette`)

Any game config can dial up world immersion ("extra everything") by configuring the following generic CSS custom properties in `palette`:

### Core Color & Surface Tokens
- `--bg`, `--card-bg`, `--card-border`, `--card-bg-gradient`
- `--primary`, `--primary-hover`, `--secondary`, `--accent`, `--danger`, `--success`
- `--text`: Main readable foreground color (e.g., weathered bone `#c7d2ce` in horror, warm parchment `#ede4f7` in fantasy, crisp telemetry slate `#e2e8f0` in sci-fi).
- `--text-muted`: Secondary narrative and metadata color.

### Control Scrim Tokens
- `--btn-bg`: Defaults to `rgba(0, 0, 0, 0.60)`.
- `--btn-text`: Defaults to `#ffffff`.
- `--btn-primary-border`: Border color for affordable primary actions (defaults to `var(--primary)`).
- `--btn-primary-glow`: Subtle inset/outer shadow on affordable primary actions (e.g., `inset 0 0 12px rgba(192, 132, 252, 0.22), 0 2px 8px rgba(0, 0, 0, 0.5)`).
- `--upg-card-scrim`: Directional overlay gradient protecting text on full-bleed upgrade cards.

### Atmospheric & Immersive Tokens
- `--viewport-vignette`: A fixed full-viewport `radial-gradient` overlay (`body::after`) that shapes peripheral lighting. For example, a heavy abyssal vignette (`radial-gradient(circle at 50% 45%, transparent 35%, rgba(1, 4, 6, 0.78) 100%)`) creates claustrophobic dread without touching game logic.
- `--ambient-overlay`: Optional subtle texture/fog/scanline gradient layered over panels.
- `--title-text-shadow`: Optional atmospheric halo on display headers (e.g., eerie bioluminescent decay or arcane ember glow).
- `--card-border-style`: Supports `solid`, `double`, or weathered border treatments.
- `--portrait-glow`: Custom shadow/aura around the character portrait and active icons.

---

## 5. Archetype Reference Profiles

While individual games are replaceable examples, these three reference profiles illustrate how `GameConfig.palette` tokens shape distinct emotional experiences using the exact same UI shell:

1. **Industrial Megastructure (e.g., *Dyson Swarm*)**:
   - **Mood**: Deep-space telemetry, cold vacuum, precision engineering.
   - **Luminance**: Deep slate-navy surfaces (`#0a101d`), muted steel borders (`rgba(56, 189, 248, 0.22)`), smoked-glass `rgba(0, 0, 0, 0.60)` buttons with crisp `#ffffff` text and a clean cyan-steel hairline border.
2. **Arcane Sanctum (e.g., *Aetherforge*)**:
   - **Mood**: Candlelit obsidian sanctum, muted royal amethyst, warm antique gold.
   - **Luminance**: Softened plum-charcoal surfaces (`#110b1f`), muted amethyst borders (`rgba(168, 118, 224, 0.25)`), warm parchment text (`#e9dff5`), and smoked-glass `rgba(0, 0, 0, 0.60)` buttons with `#ffffff` text so full-bleed spell artwork never clashes with button labels.
3. **Abyssal / Eldritch Horror (e.g., *The Sunken Observatory*)**:
   - **Mood**: Crushing deep-sea pressure, tarnished brass/stone, eerie bioluminescent decay, creeping dread.
   - **Luminance & Atmosphere**: Desaturated verdigris/abyssal seafoam (`#4ea89a`) instead of electric neon cyan; weathered bone/ash text (`#bfc9c5`) and drowned slate-green muted copy (`#748c86`); deep abyssal edge vignette (`--viewport-vignette`) that darkens the screen periphery; murky sunken card surfaces (`rgba(5, 13, 16, 0.92)`); and dark smoked-glass `rgba(0, 0, 0, 0.65)` buttons with `#ffffff` text and a faint, unsettling bioluminescent border glow.
