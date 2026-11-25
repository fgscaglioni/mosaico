import type { StoredEvent } from "../src/lib/db";

// Checagem de tipo pura: roda no `npm run check`, não no vitest.
// Se um campo novo entrar no evento gravado, o build de tipos quebra até alguém
// declarar aqui que o campo não carrega dado pessoal.
type AllowedEventKey =
  | "event_id"
  | "device_id"
  | "type"
  | "card_id"
  | "theme"
  | "correct"
  | "attempt"
  | "xp"
  | "local_day"
  | "client_ts"
  | "catalog_version";

type AssertTrue<T extends true> = T;

type CamposProibidosAusentes = AssertTrue<
  Exclude<keyof StoredEvent, AllowedEventKey> extends never ? true : false
>;

export type { CamposProibidosAusentes };
