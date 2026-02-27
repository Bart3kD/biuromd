## Zod 4 encode vs decode (tl;dr)

- Every Zod schema now supports bidirectional processing:  
  `decode/parse` turns **Input → Output**, `encode` turns **Output → Input**.
- Codecs (`z.codec()`) are the main reason to care: they define custom transforms for each direction, so you **must** call `.encode()` when persisting data that was previously decoded (e.g., Date ↔ string round-trips).
- `.parse()` is just a loose wrapper around `.decode()` that accepts `unknown`; prefer `.decode()`/`.encode()` when you want compile-time validation of the exact input/output types.
- Encoding still runs refinements/guards both ways, but defaults/prefaults/catch only run during decode; encoding expects already-valid output data.
- For storage boundaries (JSON, network, etc.), use shared codecs plus `.encode()` before writing and `.decode()` after reading to keep domain types (Dates, branded IDs, discriminated unions) intact without manual conversion.
