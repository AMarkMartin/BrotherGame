# Audio Event Registry

> Owner: Audio domain
> Purpose: Canonical list of audio event names. Architecture uses these to trigger sounds; Audio implements them.

## Convention

Event names: `snake_case` strings
Format: `context_action` or `context_state`

---

## World Map Events

| Event Name | When It Fires | Status |
|---|---|---|
| `map_turn_start` | Player's turn begins | planned |
| `map_turn_end` | Player ends their turn | planned |
| `map_unit_move` | Unit moves on map | planned |
| `map_encounter_trigger` | An encounter is triggered | planned |

## Mission Events

| Event Name | When It Fires | Status |
|---|---|---|
| `mission_start` | Mission begins | planned |
| `mission_complete_success` | Mission won | planned |
| `mission_complete_fail` | Mission lost | planned |
| `unit_attack` | Unit performs attack | planned |
| `unit_death` | Unit is defeated | planned |
| `objective_complete` | An objective is finished | planned |

## UI Events

| Event Name | When It Fires | Status |
|---|---|---|
| `ui_button_click` | Any button pressed | planned |
| `ui_menu_open` | Menu opens | planned |
| `ui_menu_close` | Menu closes | planned |

## Music Tracks

| Track ID | Context | Status |
|---|---|---|
| `music_world_map` | World map background | planned |
| `music_mission_standard` | Standard mission | planned |
| `music_mission_intense` | High-tension mission | planned |
| `music_victory` | Mission victory sting | planned |
| `music_defeat` | Mission defeat sting | planned |
