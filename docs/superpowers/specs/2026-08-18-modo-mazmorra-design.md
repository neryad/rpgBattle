# Modo mazmorra (roguelite) — Dungeons & Code

Fecha: 2026-08-18
Rama: `feature/animations-improvement`

## Objetivo

Convertir el juego de **1 pelea aislada** en una **run de mazmorra de 5 pisos** con rejugabilidad: el jugador elige un héroe y baja por pisos de dificultad creciente, ganando recompensas entre combates, hasta vencer a un boss final (o morir en el intento). Se mantiene toda la lógica de combate de `combat.js` intacta; se añade un módulo de estado de run, 2 enemigos nuevos + 1 boss, escalado por piso, pantalla de recompensas y pantallas de victoria/game over.

## Decisiones acordadas

1. **Formato:** carrera de mazmorra (roguelite) de **5 pisos**; 1 pelea por piso; boss en el piso 5.
2. **Longitud:** partida completa de 5–10 minutos.
3. **Recompensas:** tras cada victoria en pisos 1–4, elegir 1 de 3 recompensas (siempre disponible).
4. **Persistencia:** sin meta-progresión entre partidas; cada run es independiente.
5. **Persistencia dentro de la run:** todo persiste entre pisos (HP actual, stats ganados, medidor de Special). No hay cura automática entre pisos (la cura viene de la recompensa).
6. **Dificultad:** escalado por piso aplicado a HP/STR/DEF (no a SPD/evasión/crit).
7. **Muerte:** Game Over con resumen (piso alcanzado, enemigos derrotados) + botón reiniciar run.
8. **Contenido nuevo:** 2 enemigos nuevos + 1 boss, con sprites que el usuario aportará (packs gratuitos de LuizMelo, https://luizmelo.itch.io/). Se dejará la infraestructura lista (CSS de sprites con rutas) para insertar el arte cuando esté disponible.
9. **Escala de sprites:** corregir el tamaño visual de los enemigos actuales (hoy pequeños frente al héroe).
10. **Arquitectura:** módulo `dungeon.js` (estado de run puro y testeable) + orquestación en `app.js`; `combat.js` casi intacto (solo se añaden datos de enemigos).

## Estado actual (relevante)

- El juego carga una sola pelea: `app.js` elige un enemigo al azar de `ENEMIES` y, al ganar/perder, solo ofrece reiniciar.
- `combat.js` exporta `HEROES`, `ENEMIES`, `createCombatant`, `buildHit`, `commitHit`, `tickStatuses`, `SPECIAL_HITS` (5), constantes de balance.
- `sprites.js` tiene `SPRITES` y `CELLS` por personaje; `animation.js` (contrato) aplica clases `{key}-{anim}`, `sprite-anim-base/loop/one`, vars `--frames/--steps/--cell-w/--cell-h/--sheet-w/--dur`.
- CSS de sprites: `css/heros/*.css` y `css/enemines/*.css` definen `--player-base`/`--enemy-base` (escala) y `background-image` por animación. **No los usa JS para la escala** → se pueden editar libremente.
- Escalas actuales (medidas): héroe Warrior 540px, Mage 462×380px, Hunter 400px. Enemigos FlyingEye/Goblin/Mushroom/Skeleton 240px, Worm 135px. **Los enemigos se ven pequeños.**
- `app.js` es un módulo ES → hay que servir el juego por HTTP (Chrome bloquea módulos desde `file://`).
- Tests: `npm test` (node --test) con `tests/combat.test.js` (21 tests) y simulador `npm run sim` (`tests/balance-sim.js`).

## Arquitectura

### Archivos nuevos

**`dungeon.js`** — Estado de la run y lógica pura (sin DOM):

```js
// API prevista
createRun(heroClass)            // → { floor:1, kills:0, rewards:[], hero: createCombatant(HEROES[heroClass]) }
getFloorEnemy(run, rng)         // → createCombatant(enemyDef escalado según piso)
nextFloor(run)                  // → run.floor += 1
generateRewards(run, rng)       // → [ {type:'heal'}, {type:'stat'}, {type:'special'} ] (3 opciones, 1 de cada tipo)
applyReward(run, reward)        // → muta el héroe según la recompensa elegida
isBossFloor(run)                // → run.floor === 5
```

- `getFloorEnemy` aplica el escalado por piso a HP/STR/DEF según la tabla de la sección "Escalado".
- `generateRewards` devuelve siempre las 3 opciones: **Poción** (cura 40% HP máx), **Entrenamiento** (+2 a un stat al azar entre STR/DEF/SPD/INT), **Enfoque** (Special listo: `specialUnlocked = true`, `hits = 0`).
- `applyReward` actualiza `run.rewards` (historial) y el héroe.

**`tests/dungeon.test.js`** — Tests puros (node --test):
- escalado por piso aplica multiplicador a HP/STR/DEF y no a SPD/evasión.
- piso 1 usa ×1.0; boss floor (5) no escala (stats fijas).
- enemigos válidos por piso (roster).
- `generateRewards` devuelve exactamente 3 opciones (una de cada tipo) y `applyReward` cura / sube stat / activa special correctamente.
- `nextFloor` incrementa y `isBossFloor` correcto.

**`docs/` (este spec)** — plan de implementación.

### Archivos modificados

**`combat.js`** — Solo se añaden datos a `ENEMIES` (2 nuevos) y un nuevo `ENEMIES.boss` (o una exportación `BOSSES`). Las fórmulas y funciones no cambian.

**`app.js`** — Orquestación:
- Reemplazar el flujo "1 pelea" por: `createRun` → `getFloorEnemy` → `heroTurn/playerSpecial/characterDefense/enemyAttack` (sin cambios de combate) → al ganar: si `isBossFloor` → `victoryScreen()`, si no → `showRewardScreen()` → `nextFloor` → siguiente pelea.
- `enemyAttack`/`victory`/`defeat` actualizan el banner de piso y contadores (`kills`).
- Al morir: `showGameOverScreen(run)` en vez del `defeat` actual.
- Mostrar banner `#floor-banner` y actualizar en `startGame`.

**`index.html`** — Añadir:
- Banner de piso `#floor-banner` en el área de batalla.
- Overlay de recompensa `#reward-screen`: título, 3 cartas-botón (`.reward-card`, con id/classes para los 3 tipos) y botón continuar.
- Overlay de victoria `#victory-screen`: resumen (pisos completados, enemigos derrotados) + botón reiniciar.
- Overlay de game over `#gameover-screen`: resumen (piso alcanzado, enemigos derrotados) + botón reiniciar.

**`main.css`** — Estilos de los overlays (dark fantasy, coherente con el diseño actual), banner de piso y recompensas.

**`css/enemines/*.css`** — Ajuste de escala (`--enemy-base`) para los 5 enemigos actuales. Archivos nuevos para los 2 enemigos + boss (con rutas de arte esperadas, p. ej. `../../assets/characters/enemies/<Name>/...`).

**`sprites.js`** — Añadir entradas `CELLS`/`SPRITES` para los 2 enemigos y el boss (con el frame/sheetW/dur reales cuando el arte esté disponible; mientras tanto, valores placeholder coherentes para que el juego no falle).

## Flujo de una partida

1. Pantalla de selección de héroe (igual que hoy).
2. `createRun` → piso 1 → `getFloorEnemy` → combate normal con banner "PISO 1".
3. Al ganar en pisos 1–4 → overlay de recompensa (elegir 1 de 3) → `nextFloor` → siguiente combate.
4. Piso 5 (boss) → al ganar, overlay de **Victoria** con resumen.
5. Al morir en cualquier piso → overlay de **Game Over** con resumen.

## Escalado por piso

Multiplicadores sobre las stats base del enemigo (HP, STR, DEF):

| Piso | Multiplicador |
|------|---------------|
| 1    | ×1.00         |
| 2    | ×1.15         |
| 3    | ×1.30         |
| 4    | ×1.50         |
| 5    | Boss (stats fijas, sin escalado) |

El redondeo será `Math.round`; HP nunca baja de 1. SPD, evasión, inteligencia y crit no se escalan (no romper el orden de velocidad).

## Roster por piso

| Piso | Enemigos posibles |
|------|-------------------|
| 1    | Worn, Goblin, Mushroom |
| 2    | Mushroom, Flying Eye, Enemigo Nuevo 1 |
| 3    | Flying Eye, Skeleton, Goblin |
| 4    | Skeleton, Enemigo Nuevo 2, Enemigo Nuevo 1 |
| 5    | BOSS (fijo) |

## Enemigos nuevos (stats iniciales a calibrar con el simulador)

> Los valores son punto de partida; se ajustarán con `npm run sim` (extender `balance-sim.js` para pisos si hace falta).

| Enemigo | Rol | HP | STR | DEF | SPD | INT | Crit | Eva | Habilidad |
|---------|-----|----|-----|-----|-----|-----|------|-----|-----------|
| Enemigo 1 (corruptor) | veneno/quemadura | 95 | 18 | 10 | 11 | 10 | 0 | 8 | básico + 20% aplicar Burn o Poison |
| Enemigo 2 (bestia) | rápida/escurridiza | 80 | 17 | 9 | 20 | 6 | 5 | 18 | básico (SPD alta + evasión) |
| Boss (piso 5) | tank/asesino | 210 | 24 | 14 | 12 | 8 | 10 | 6 | básico + 15% aplicar Bleed |

Los nombres/roles definitivos se definen al integrar el arte (LuizMelo).

## Escala de sprites (corrección)

Cambiar `--enemy-base` en los CSS de enemigos actuales:

| Enemigo | Celda | Actual | Nuevo | Render |
|---------|-------|--------|-------|--------|
| FlyingEye/Goblin/Mushroom/Skeleton | 150×150 | `scale(-1.6,1.6)` → 240px | `scale(-2.6,2.6)` | **390px** |
| Worm | 90×90 | fallback `scaleX(-1.5)` → 135px | `scale(-2.8,2.8)` | **252px** |
| Boss | según arte | — | `scale(-3.2,3.2)` | **480px** |

- En `main.css` existen overrides responsive por media query (móvil baja la escala); actualizar esos factores para que sigan el nuevo tamaño (p. ej. móvil `~2.0`).
- Mantener el contrato de `animation.js` (las vars `--enemy-base`/`--player-base` se siguen usando igual).

## UI nueva (detalle)

**Banner de piso** `#floor-banner`: texto tipo "PISO 2/5" + nombre del enemigo, ubicado en el centro de la arena (junto al turn indicator). Actualizado por `app.js`.

**Overlay de recompensa** `#reward-screen`:
- Fondo oscuro translúcido sobre la arena (estilo modal).
- Título "Recompensa" + subtítulo "Elige una mejora".
- 3 cartas: `Poción (+40% HP)`, `Entrenamiento (+2 stat aleatorio)`, `Enfoque (Special listo)`.
- Cada carta: icono simple (CSS/SVG/texto), descripción, hover/glow según el acento de la clase del héroe.
- Botón CONTINUAR deshabilitado hasta elegir; al elegir se marca la carta y se habilita.

**Overlay de victoria** `#victory-screen`: "¡Has conquistado la mazmorra!", resumen (pisos completados = 5, enemigos derrotados), botón "Jugar de nuevo".

**Overlay de game over** `#gameover-screen`: "Has muerto en la mazmorra", resumen (piso alcanzado, enemigos derrotados), botón "Intentar de nuevo".

## Testing

- `tests/dungeon.test.js`: lógica pura de `dungeon.js` (escalado, rewards, aplicar reward, boss floor, roster).
- `npm test` debe quedar verde (21 existentes + nuevos).
- Extender `tests/balance-sim.js` (opcional, fase 2): simular una run completa (pisos 1–5) para validar winrate por héroe y calibrar stats de enemigos nuevos y boss.
- Verificación manual en navegador sirviendo por HTTP (`python3 -m http.server`).

## Fases de implementación

**Fase 1 — Motor de run (dungeon.js + tests):**
1. Crear `dungeon.js` con `createRun`, `getFloorEnemy`, `nextFloor`, `generateRewards`, `applyReward`, `isBossFloor`.
2. Crear `tests/dungeon.test.js` y dejarlos verdes.
3. Añadir datos de los 2 enemigos nuevos + boss a `combat.js` (stats iniciales).
4. Extender `sprites.js` con `CELLS`/`SPRITES` de los nuevos (placeholders).

**Fase 2 — Integración en app.js:**
5. Reemplazar el flujo de 1 pelea por el flujo de run (banner de piso, recompensa, victoria, game over).
6. Actualizar `victory`/`defeat` para usar overlays con resumen.

**Fase 3 — UI (index.html + main.css):**
7. Añadir `#floor-banner`, `#reward-screen`, `#victory-screen`, `#gameover-screen`.
8. Estilos coherentes con el diseño actual (dark fantasy).

**Fase 4 — Escala de sprites:**
9. Actualizar `--enemy-base` en `css/enemines/*.css` y overrides responsive de `main.css`.
10. Crear CSS de sprites para los 2 enemigos + boss (rutas de arte).

**Fase 5 — Balance y cierre:**
11. Extender `balance-sim.js` para simular runs; calibrar stats.
12. `npm test` verde + verificación manual.

## Fuera de alcance (para más adelante)

- Meta-progresión persistente entre runs (monedas/desbloqueos).
- Más de 3 recompensas por piso o recompensas raras.
- Héroes nuevos.
- Más pisos (8/10) u oleadas.
- Retry del piso al morir.

## Pendiente del usuario

- Conseguir el arte de los 2 enemigos + boss (packs gratuitos LuizMelo).
- Confirmar si se prefiere que el boss use sprite existente recoloreado mientras llega el arte definitivo.
