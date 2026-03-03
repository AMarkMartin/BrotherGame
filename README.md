# BrotherGame

A collaborative video game featuring a turn-based strategic world map and real-time mission gameplay.

## Overview

BrotherGame is built across two core gameplay modes:
- **World Map** — Turn-based strategic layer (movement, decisions, resource management)
- **Missions** — Real-time action gameplay (combat, exploration, objectives)

## Team & Ownership

| Domain | Branch | Owns |
|---|---|---|
| Architecture | `arch/core` | Core systems, game loop, entity framework, data models, autoloads |
| Levels | `levels/design` | World map layout, mission design, templates, scene composition |
| Art & Assets | `art/assets` | Sprites, UI, backgrounds, animations, style guide |
| Music & Audio | `audio/music` | Music tracks, sound effects, ambience |

## Repository Structure

```
BrotherGame/
├── .github/                  # PR templates, issue templates, CI workflows
├── docs/                     # Design docs, architecture notes, style guides
├── game/
│   ├── core/                 # [ARCH] Engine systems and shared logic
│   │   ├── systems/
│   │   │   ├── turn_based/   # Turn-based map system
│   │   │   └── real_time/    # Real-time mission system
│   │   ├── entities/         # Shared entity definitions
│   │   ├── data/             # Game data / configuration
│   │   └── autoloads/        # Global singletons / service locators
│   ├── levels/               # [LEVELS] World map and mission content
│   │   ├── world_map/
│   │   ├── missions/
│   │   └── templates/
│   ├── assets/               # [ART] All visual assets
│   │   ├── sprites/
│   │   ├── ui/
│   │   ├── backgrounds/
│   │   └── animations/
│   └── audio/                # [AUDIO] All audio assets
│       ├── music/
│       ├── sfx/
│       └── ambience/
└── tools/                    # Build helpers, asset pipeline scripts
```

## Branching Model

```
main          ← stable releases only
  └── develop ← integration (all features merge here first)
        ├── arch/core        ← Architecture owner
        ├── levels/design    ← Levels owner
        ├── art/assets       ← Art owner
        └── audio/music      ← Audio owner
```

Feature sub-branches (for AI agents or experimental work):
```
arch/core-feature-xyz
levels/design-mission-01
art/assets-character-sprites
audio/music-overworld-theme
```

## Workflow

1. Work on your domain branch (or a sub-branch off it)
2. Open a PR → `develop` when work is ready for integration
3. At least one other team member reviews
4. Merge to `develop`; integration testing happens here
5. `develop` → `main` at stable milestones only

See [CONTRIBUTING.md](CONTRIBUTING.md) for full workflow details.

## Getting Started

1. Clone the repo
2. Check out the [Architecture doc](docs/ARCHITECTURE.md) to understand the system design
3. Check out the [Game Design doc](docs/GAME_DESIGN.md) for feature intentions
4. Pull your domain branch and start working

## Engine

> **TBD** — Engine choice to be finalized by the architecture owner. Top candidates: Godot 4, Unity. The folder structure supports either.
