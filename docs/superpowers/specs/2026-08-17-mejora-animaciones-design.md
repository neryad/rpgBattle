# Mejora de animaciones de personajes

Fecha: 2026-08-17
Rama: `feature/animations-improvement`

## Objetivo

Mejorar la calidad, fluidez y sensación de las animaciones del juego Dungeons & Code. El alcance abarca: corregir animaciones existentes (hoy mal cicladas, con frames incorrectos y nombres de keyframes equivocados), añadir movimiento en los ataques (híbrido: avance + efectos) y efectos visuales de impacto (combo completo), manteniendo la lógica de combate sin cambios.

## Decisiones acordadas

1. **Base técnica:** controlador de animación en JavaScript + CSS para renderizar los frames del spritesheet.
2. **Movimiento:** híbrido — el atacante se desliza hacia el rival mientras golpea y el impacto tiene efectos.
3. **Estilo de impacto:** combo completo — slash + destello + número de daño flotante + sacudida.
4. **Organización:** controlador JS + CSS (no motor JS puro, no todo en CSS).

## Estado actual (problemas detectados)

- Keyframes manuales por porcentaje: frágiles y erróneos (varias animaciones usan keyframes de otro personaje, por ejemplo `.attackSkeleton` usa `mushroomAttack`; `.attackHunter` usa `playHunter` en vez de `attackHunter`).
- Muchas animaciones no usan todos los frames del spritesheet (idle del warrior solo muestra 5 de 10 frames).
- Los ataques usan `animation: ... infinite` (bucle) en lugar de reproducirse una sola vez.
- Las escalas (`scale(4)` del héroe, `scaleX(-1.5)` del enemigo) están en estilos inline desde JS.
- El daño se aplica con `sleep()` desincronizado respecto al frame del golpe.
- Sprites sin usar: Run/Jump del héroe, Run/Walk del enemigo (se reservan para mejoras futuras; ver "Fuera de alcance").

## Arquitectura

### Archivos nuevos

**`sprites.js`** — Configuración por personaje/enemigo. Única fuente de verdad de frames, ancho de hoja y duraciones:

```js
export const SPRITES = {
  warrior: {
    sheetW: { idle: 1350, attack: 540, hit: 405, death: 1215 },
    frames: { idle: 10, attack: 4, hit: 3, death: 9 },
    dur:    { idle: 800, attack: 600, hit: 450, death: 1000 },
  },
  // ... mage, hunter, worm, flyingeye, goblin, mushroom, skeleton
};
```

Datos medidos de los spritesheets (celdas):

| Personaje | Animación | Hoja (px) | Celdas | Frames |
|---|---|---|---|---|
| Warrior | Idle | 1350x135 | 135 | 10 |
| Warrior | Attack1 | 540x135 | 135 | 4 |
| Warrior | GetHit | 405x135 | 135 | 3 |
| Warrior | Death | 1215x135 | 135 | 9 |
| Mage | Idle | 1386x190 | 231 | 6 |
| Mage | Attack1 | 1848x190 | 231 | 8 |
| Mage | Hit | 924x190 | 231 | 4 |
| Mage | Death | 1617x190 | 231 | 7 |
| Hunter | Idle | 1000x100 | 100 | 10 |
| Hunter | Attack | 600x100 | 100 | 6 |
| Hunter | GetHit | 300x100 | 100 | 3 |
| Hunter | Death | 1000x100 | 100 | 10 |
| Worm | Idle | 810x90 | 90 | 9 |
| Worm | Attack | 1440x90 | 90 | 16 |
| Worm | GetHit | 270x90 | 90 | 3 |
| Worm | Death | 720x90 | 90 | 8 |
| Flying eye | Flight (idle) | 1200x150 | 150 | 8 |
| Flying eye | Attack | 1200x150 | 150 | 8 |
| Flying eye | Take Hit | 600x150 | 150 | 4 |
| Flying eye | Death | 600x150 | 150 | 4 |
| Goblin | Idle | 600x150 | 150 | 4 |
| Goblin | Attack | 1200x150 | 150 | 8 |
| Goblin | Take Hit | 600x150 | 150 | 4 |
| Goblin | Death | 600x150 | 150 | 4 |
| Mushroom | Idle | 600x150 | 150 | 4 |
| Mushroom | Attack | 1200x150 | 150 | 8 |
| Mushroom | Take Hit | 600x150 | 150 | 4 |
| Mushroom | Death | 600x150 | 150 | 4 |
| Skeleton | Idle | 600x150 | 150 | 4 |
| Skeleton | Attack | 1200x150 | 150 | 8 |
| Skeleton | Take Hit | 600x150 | 150 | 4 |
| Skeleton | Death | 600x150 | 150 | 4 |

**`animation.js`** — Controlador. API:

- `play(entity, { anim, dur, moveX, hitAt, onHit }) → Promise`
  - `entity`: `'player' | 'enemy'`.
  - Aplica la clase CSS `prefix + anim`, gestiona el movimiento `moveX` (deslizar hacia el rival y volver) mediante `transform` con `transition`.
  - A `hitAt * dur` ms dispara `onHit` (impacto), luego resuelve la Promise al terminar y revierte posición/clases.
- `playScript(entity, pasos) → Promise` — reproduce pasos en secuencia.
- `setIdle(entity, config)` — aplica idle permanente.
- `setIdentity(spriteEl, nombre, tipo)` — limpia clases anteriores, aplica escala/fondo según personaje.
- Previene ejecución concurrente por entidad (cola por entidad).

**`effects.js`** — Efectos del combo completo, todos efímeros:

- `flash(el)` — bola radial que escala y desvanece (0.6s).
- `slash(el)` — barra diagonal que barre al objetivo (0.45s).
- `particles(el)` — 8-10 cuadrados pixel con dispersión aleatoria (0.7s).
- `damageNumber(el, n, color)` — número "-N" que sube flotando (0.9s). Rojo = daño al héroe, blanco/amarillo = daño al enemigo.
- `shake(el)` — sacudida del objetivo (0.4s, keyframes con pasos).
- `screenShake()` — sacudida del `.container-battle` (0.3s).

Los efectos crean nodos en el overlay `#fx-layer` y se autodestruyen al terminar (cleanup con `setTimeout`/`animationend`).

### Archivos modificados

- **`index.html`** — agregar `<div id="fx-layer">` como overlay sobre la zona de batalla; cargar `sprites.js` y `animation.js`/`effects.js` como módulos.
- **`app.js`** — reescribir `heroTurn`, `enemyAttack`, `characterDefense`, `playerSpecial`, `setHitAnimationClass`, `setDeathAnimationClass`, `setAttackAnimationClass`, `setIdleAnimationClass*` para usar `await` sobre `play`/`playScript` en vez de `sleep()` + toggling de clases a mano. La lógica de combate (daño, críticas, defensa aleatoria) se mantiene idéntica, solo el momento de aplicación se alinea al impacto.
- **`helper.js`** — eliminar o reducir a no-op (su `action()` queda reemplazado por el controlador). Si queda alguna referencia, limpiarla.
- **`main.css` + `css/heros/*.css` + `css/enemines/*.css`** — reemplazar los `@keyframes` por porcentajes por la técnica unificada con variables CSS:

```css
@keyframes spriteStep { to { background-position: calc(-1 * var(--sheet-w)) 0; } }

.warrior-idle   { --frames:10; --sheet-w:1350px; --dur:800ms; background-image:url(...); animation: spriteStep var(--dur) steps(var(--frames), end) infinite; }
.warrior-attack { --frames:4;  --sheet-w:540px;  --dur:600ms; background-image:url(...); animation: spriteStep var(--dur) steps(var(--frames), end) forwards; }
```

- Idle: `infinite`; ataque/golpe/muerte: una sola vez (`forwards`). En muerte se queda en el último frame.
- Los prefijos de clase: `warrior-`, `mage-`, `hunter-` para héroes; `worm-`, `flyingeye-`, `goblin-`, `mushroom-`, `skeleton-` para enemigos; `-idle`, `-attack`, `-hit`, `-death`.
- La escala (`scale(4)` héroe, `scaleX(-1.5)` enemigo) y tamaños pasan de estilos inline a clases/sobrescritura en CSS.
- **`.gitignore`** — nuevo, ignorando `.superpowers/`.

## Secuencias de combate

Patrón general: `await` animación → aplicar daño/efectos en el impacto → pasar el turno. Buttones deshabilitados durante toda la secuencia (`isBusy`).

- **Attack (jugador):** `heroTurn` calcula daño y tirada de defensa enemiga antes de animar.
  1. Héroe: dash (`moveX`) + `attack`. `onHit` al 60% de la duración → daño, HP, efectos combo sobre enemigo (`slash + flash + particles + damageNumber`), `shake` + retroceso del enemigo, `screenShake`.
  2. Si el enemigo murió: `death` (una vez, último frame) + log victoria. Si no: turno del enemigo → `enemyAttack`.
  3. Vuelta a `idle` del héroe.
- **EnemyAttack:** espejo del anterior hacia el héroe.
- **Defend:** el enemigo anima ataque igual, pero el impacto muestra "bloqueo" (destello azul, número de daño reducido por `defense`, sin sacudida fuerte). Se mantiene el daño reducido actual.
- **Special:** misma secuencia que Attack. No existe sprite dedicado; se usa la animación `attack` del personaje con efectos intensificados (más partículas, sacudida mayor, número de daño mayor). Se reinicia el contador a los 7 golpes.
- **Muerte:** `death` una vez, se congela en el último frame, log de fin de partida, solo queda activo el botón Reiniciar. Nunca vuelve a idle.

## Casos borde y errores

- Clics repetidos: flag `isBusy` global; botones deshabilitados durante toda la secuencia.
- Clase/sprite inexistente: se omite el movimiento/efecto pero la lógica continúa (no se traba).
- Muertes: quedarse en último frame; solo Reiniciar activo.
- HP y log se actualizan siempre en el impacto.
- Reinicio: `location.reload()` intacto.

## Testing

- El proyecto no tiene framework de tests → checklist manual: 3 héroes × 5 enemigos × acciones (atacar, defender, especial, morir en ambos lados).
- Verificación con servidor local (`python3 -m http.server`) comprobando ausencia de errores de consola.
- Servidor de prueba ya disponible en `http://localhost:8000`.

## Fuera de alcance

- No se cambia la lógica de combate (crítica, HP, defensa aleatoria del enemigo). Nota: existen bugs de gameplay detectados (p. ej. la condición de crítico `damage === player.criticalChance`, y `enemies.health -= damage` en `enemyDefend`), se dejan intactos.
- No se añade sonido, ni intro caminando (sprites Run/Walk quedan para mejora futura), ni Canvas.