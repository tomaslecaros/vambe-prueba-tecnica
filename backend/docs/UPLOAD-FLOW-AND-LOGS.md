# Flujo de upload y logs

## Qué ocurre al subir un archivo

### 1. **Request POST /uploads** (síncrono)
- **Controller:** Valida extensión (.xlsx, .csv), crea `Upload` en BD (status: `pending`).
- **Service `processFile`:**
  - Lee el Excel con XLSX.
  - Valida columnas obligatorias.
  - Actualiza upload a `processing`.
  - **Batch de duplicados:** Una sola pasada por el archivo para construir `(email, phone)`. Consultas a BD en lotes de 50 para saber qué pares ya existen.
  - **Batch de inserts:** Agrupa filas válidas (no duplicados, con email/teléfono) en lotes de 50 y usa `createMany` con `skipDuplicates: true`. Si un lote falla, hace insert uno a uno.
  - Actualiza upload a `completed` (o `failed` si todo falló).
  - Si hay clientes nuevos → **encola categorización** (Bull) y retorna.
  - Responde al cliente con `totalRows`, `newClients`, `duplicates`, `errors`, etc.

### 2. **Categorización** (asíncrona, Bull + Redis)
- **`CategorizationService.queueCategorizationForUpload`:**
  - Busca clientes del upload sin categorización.
  - Añade un job por cliente a la cola `categorization` (concurrency 50).
- **`CategorizationProcessor`:** Por cada job:
  - Lee el cliente de BD.
  - Llama al LLM (OpenAI) para extraer categorías de la transcripción.
  - Guarda `Categorization` en BD.
  - Comprueba si **todos** los clientes del upload están categorizados (2× `COUNT`). Si es así → **dispara entrenamiento del modelo de predicción**.

### 3. **Entrenamiento del modelo** (asíncrono, si aplica)
- **`PredictionService.startTraining`:** Entrena el modelo (logistic regression) con las categorizaciones y lo persiste en BD. Si ya hay un entrenamiento en curso o hay &lt; 50 muestras, no hace nada.

---

## Logs que verás (orden aproximado)

### En el upload (durante el request)
Solo **uno** de estos:

```
[UploadsService] Upload {id} complete: X new, Y duplicates, Z errors
```
- Si hay **solo duplicados** (0 nuevos):
  ```
  [UploadsService] Upload {id} complete: 0 new, N duplicates (no categorization).
  ```
- Si hay **0 nuevos** pero mezcla de duplicados + errores:
  ```
  [UploadsService] Upload {id} complete: 0 new, X duplicates, Y errors.
  ```

### Tras encolar categorización
```
[CategorizationService] Categorization queued: N clients for upload {id}
```

### Durante la categorización
- **Por cada cliente:** ya no se hace log. Antes se logueaba “Processing job…” y “Categorized …” por cada uno (2×N líneas).
- **Errores:** si falla un cliente:
  ```
  [CategorizationProcessor] Failed to categorize client {clientId}: {message}
  ```

### Cuando terminan todos los clientes del upload
- Si se dispara entrenamiento:
  ```
  [CategorizationProcessor] Upload {id}: all N categorized. Triggering model training.
  [CategorizationProcessor] Model training started (M samples).
  ```
- Si el entrenamiento se omite (ya entrenando o &lt; 50 muestras):
  ```
  [CategorizationProcessor] Upload {id}: all N categorized. Triggering model training.
  [CategorizationProcessor] Model training skipped: {reason}
  ```

### Errores
- Fallo al encolar categorización:
  ```
  [UploadsService] Categorization queue error: {error}
  ```
- Fallo en un batch de inserts (luego se hace insert uno a uno):
  ```
  [UploadsService] Batch save error: {message}
  ```

---

## ¿Es óptimo?

- **Upload:** Sí. Se usa `createMany` por lotes, una sola pasada para duplicados y otra para inserts. Todo en la misma request.
- **Categorización:** Los jobs corren en paralelo (concurrency 50). Cada job hace 1 LLM + 1 guardado. La comprobación “¿todos categorizados?” se hace **tras cada job** (2 `COUNT` por ejecución). Es redundante pero sencillo; solo el último “encuentra” que ya están todos y lanza el entrenamiento.
- **Logs:** Se redujeron los avisos por cliente. Quedan un log de resumen por upload, uno al encolar categorización y unos pocos al terminar categorización y al iniciar/omitir entrenamiento.
