# Lista de verificación de calidad y de la demostración

Se completa a mano en cada teléfono antes de entregar. Lo automático (contraste, nombres accesibles, movimiento reducido, temporizadores, diccionarios) ya lo vigilan las pruebas: `npm run test`.

Marca `[x]` al cumplirse y anota el dispositivo, el navegador y la fecha.

## 0. Antes de empezar

- [ ] `npm run build` termina sin errores ni avisos.
- [ ] `npm run lint`, `npm run format:check`, `npm run typecheck` y `npm run test` en verde.
- [ ] La URL de Vercel abre por **HTTPS** (los sensores no funcionan sin él).
- [ ] Se borran los datos del sitio para probar la primera ejecución.

## 1. Android · Chrome

Dispositivo: ******\_\_\_\_****** · Chrome ****\_\_**** · Fecha: ****\_\_****

- [ ] Intro → idioma → sensor. «Activar sensor» concede el permiso sin pedir nada más.
- [ ] Medir rango: con el brazo abajo, «Calibrar» deja 0° y el número sigue al brazo.
- [ ] El ángulo coincide con un transportador o una app de nivel dentro de ±3° (0°, 45°, 90°, 135°).
- [ ] Sesión: aproximación con pulsos cada vez más rápidos, acorde verde en el objetivo, zumbido rojo al pasarse.
- [ ] **Vibración:** doble vibración en el objetivo; nada al estar lejos.
- [ ] **Audio:** suena tras el primer toque; Ajustes → Sonido lo apaga al instante.
- [ ] La pantalla no se apaga durante una sesión (wake lock).
- [ ] Con la pantalla bloqueada o la pestaña oculta, la sesión se pausa y no suena.
- [ ] Girar el teléfono: el reloj sigue siendo un círculo centrado, sin cortes.
- [ ] 60 fps en el goniómetro: moviendo el brazo sin saltos (Chrome → `chrome://inspect` → Performance si hay dudas).

## 2. iPhone · Safari

Dispositivo: ******\_\_\_\_****** · iOS ****\_\_**** · Fecha: ****\_\_****

- [ ] «Activar sensor» muestra el permiso de movimiento de iOS y, al concederlo, el ángulo sigue al brazo.
- [ ] Si se deniega el permiso, el reloj lo explica y ofrece volver a intentarlo (Ajustes de Safari).
- [ ] Calibrar «brazo abajo» y medir igual que en Android.
- [ ] **Vibración:** iPhone no la ofrece; no aparece ningún error y se mantiene lo visual y sonoro.
- [ ] **Audio:** suena tras el primer toque, también con el interruptor de silencio en modo timbre.
- [ ] La barra de Safari no tapa el reloj; con el teléfono girado todo sigue visible.

## 3. Accesibilidad

- [ ] Con teclado: Tab recorre los controles de cada pantalla y se ve el foco (anillo bronce); Escape vuelve.
- [ ] Con lector de pantalla (TalkBack o VoiceOver): cada botón tiene nombre, el chip de zona se anuncia al cambiar y los interruptores dicen «Activado» o «Desactivado».
- [ ] Con «Reducir movimiento» activado: la intro es un solo fundido y ni la banda de dolor ni el marcador pulsan ni tiemblan.
- [ ] El estado nunca depende solo del color: el chip y el signo (+/−) llevan texto.
- [ ] Todos los controles se pueden tocar sin fallar (mínimo 48 px).

## 4. Idiomas

- [ ] Ajustes → Idioma cambia todo a English al instante y vuelve a Español.
- [ ] Recorrer las 18 pantallas en cada idioma: sin claves sin traducir y sin textos fuera del círculo.
- [ ] Al recargar, el idioma elegido se conserva.

## 5. Guion de la demostración (3 minutos)

1. [ ] Abrir la URL en el teléfono: intro y cara del reloj.
2. [ ] Ajustes → idioma: mostrar español e inglés.
3. [ ] Medir rango → permitir sensores → **brazo abajo** → calibrar (0°).
4. [ ] Sesión → Abducción → rueda de ángulo → objetivo 90°.
5. [ ] Subir el brazo despacio: el número y el anillo siguen el ángulo en vivo.
6. [ ] Aproximación con pulsos cada vez más rápidos → **90°: verde y acorde** → pasarse: **rojo y zumbido**.
7. [ ] Dolor → marcar un arco 70°–110° → en la sesión, aviso al entrar.
8. [ ] Terminar → Resumen con el rango máximo y la comparación con signo.
9. [ ] Recargar la página: los datos siguen ahí.

## 6. Entrega

- [ ] `git rev-list --count develop` es mayor que 100.
- [ ] `git log --format=%B | grep -ci "co-authored-by"` da `0`.
- [ ] `develop` está etiquetada `v1.0.0`.
- [ ] El merge a `main` y el despliegue en Vercel los hace el usuario.
