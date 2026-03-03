# Game Design Document

> Status: Early draft — living document
> All team members contribute here

---

## Concept

_[Fill in the game's core concept, setting, and tone here]_

**Genre:** Strategy + Action (Turn-based world map + Real-time missions)
**Platform:** TBD
**Target audience:** TBD

---

## Core Game Loop

```
World Map (Turn-Based)
  │
  ├── Move units on map
  ├── Manage resources / decisions
  ├── Encounter trigger (enemy, event, mission)
  │         │
  │         ▼
  │    Mission (Real-Time)
  │         │
  │         ├── Complete objectives
  │         ├── Combat / exploration
  │         └── Mission result (success/fail + loot)
  │                   │
  └───────────────────┘
       Apply result to World Map state
```

---

## World Map

### Overview
The world map is a strategic layer where the player makes high-level decisions. Play is turn-based — each turn, the player moves units, manages resources, and responds to events.

### Key Features
- [ ] Map grid / region system (TBD: hex grid, square grid, or freeform nodes)
- [ ] Unit movement and action points
- [ ] Fog of war / exploration
- [ ] Resource management (TBD: what resources?)
- [ ] Events / encounters on the map
- [ ] Persistent state between missions

### Open Design Questions
- What is the scale of the map? (small region, continent, world?)
- How many units can the player control?
- What triggers a mission vs. a simple map event?

---

## Missions (Real-Time)

### Overview
Missions are self-contained real-time scenarios triggered from the world map. The player controls units directly in a 2D environment.

### Key Features
- [ ] Real-time movement and combat
- [ ] Mission objectives (eliminate, escort, defend, collect)
- [ ] Unit abilities
- [ ] Enemy AI
- [ ] Mission result feeds back to world map

### Open Design Questions
- Perspective: top-down? side-scrolling? isometric?
- Simultaneous control of multiple units or one at a time?
- What happens when units die — permadeath?

---

## Units & Entities

_[Architecture owner to define the data model; this section covers design intent]_

### Planned Unit Types
- [ ] TBD

### Progression
- [ ] Units gain XP from missions
- [ ] Upgrades / ability unlocks (TBD)

---

## Art Direction

_[Art owner to fill this section]_

- **Visual style:** TBD (pixel art? hand-drawn? vector?)
- **Color palette:** TBD
- **Reference inspirations:** TBD

See [Art Style Guide](ART_STYLE_GUIDE.md) once created.

---

## Audio Direction

_[Audio owner to fill this section]_

- **Music style:** TBD
- **World Map feel:** TBD
- **Mission feel:** TBD
- **Key audio events:** TBD

See `game/audio/EVENTS.md` for the event name registry.

---

## Feature Roadmap

### Milestone 0 — Foundation
- [ ] Engine selected and project running
- [ ] Core architecture scaffolded
- [ ] World map renders (placeholder art)
- [ ] One mission playable end-to-end (placeholder art + audio)
- [ ] World map ↔ mission handoff working

### Milestone 1 — Vertical Slice
- [ ] One full game loop: map → mission → result → map
- [ ] 3+ mission types
- [ ] Real art and audio pass
- [ ] Basic unit progression

### Milestone 2+ — TBD

---

## Glossary

| Term | Definition |
|---|---|
| World Map | The turn-based strategic layer |
| Mission | A real-time gameplay scenario |
| Unit | A controllable character entity |
| MissionContext | Data passed from World Map to Mission |
| MissionResult | Data returned from Mission to World Map |
| Encounter | An event on the World Map that may trigger a Mission |
