# Versionado de la aplicación

Este directorio contiene las instrucciones oficiales para crear nuevas versiones de la aplicación. Sigue el proceso descrito abajo: estas instrucciones son la referencia para el control de versiones del proyecto.

## Convención de versiones
Usamos Semantic Versioning: `MAJOR.MINOR.PATCH`.
- MAJOR: cambios incompatibles.
- MINOR: nuevas funcionalidades compatibles.
- PATCH: correcciones y pequeños ajustes.

## Flujo recomendado para crear una nueva versión
1. Decide la nueva versión (ej. `1.2.0`).
2. Actualiza el campo `version` en `package.json` al nuevo número.
3. (Opcional) Actualiza `metadata.json` si existe un campo `version` o periodo.
4. Agrega una entrada en el changelog:
   - Si usas un `CHANGELOG.md` en la raíz, añade la sección para la nueva versión.
   - Alternativamente, mantén un archivo `versions/CHANGELOG.md` y añade la entrada allí.

Ejemplo de comandos:

```bash
# actualizar package.json manualmente, luego:
git checkout -b release/v1.2.0
git add package.json metadata.json CHANGELOG.md
git commit -m "chore(release): v1.2.0"
# crear tag anotado
git tag -a v1.2.0 -m "Release v1.2.0"
# push branch y tags
git push origin release/v1.2.0
git push origin v1.2.0
```

5. Abre pull request hacia la rama principal (`main` o `master`) para revisión.
6. Una vez mergeado, asegúrate que el tag `vX.Y.Z` esté en el repositorio remoto (esto activa pipelines/CI que usen tags).
7. Crea el Release en la plataforma (GitHub/GitLab) si corresponde.

## Branching y nombre de ramas
- Para releases: usar `release/vX.Y.Z`.
- Para hotfixes: `hotfix/vX.Y.Z`.

## Automatización (recomendado)
- Configura el pipeline CI para construir y publicar artefactos cuando detecte un tag con el prefijo `v`.
- Para consistencia, puedes usar un archivo `versions/VERSION` que contenga la versión actual y hacer que los scripts CI lo lean para publicar artefactos.

## Reversión de un release
Si necesitas revertir:
```bash
# eliminar tag remoto
git push --delete origin v1.2.0
# crear commit de revert en main si es necesario
```

## Consideraciones
- El `package.json` debe ser la fuente de la versión para la app en tiempo de ejecución.
- Mantén el `CHANGELOG.md` actualizado para auditoría.
- Evita editar `package.json` directamente en la rama `main` sin PR.

## Archivo de referencia (opcional)
Si decides usar `versions/VERSION` como fuente canónica, añade y actualiza ese archivo siguiendo los mismos pasos anteriores; ajusta tu CI para que lo lea y publique según su contenido.

---
Mantén estas instrucciones actualizadas. Si implementas automatizaciones (scripts o workflows), documenta en este README cómo interactúan con el proceso manual.
