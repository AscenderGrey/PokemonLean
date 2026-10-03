/**
 * The whole persistence layer: one table, the card and the message, keyed by the gift token.
 * Same Postgres production already uses, so nothing new to run.
 */
import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;

function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    // production Postgres uses a self-signed cert
    client = postgres(url, {ssl: {rejectUnauthorized: false}, prepare: false, max: 2});
  }
  return client;
}

let ready: Promise<void> | null = null;
export function migrate() {
  ready ??= (async () => {
    await db()`create table if not exists lean_cards (
      token text primary key,
      recipient text not null,
      sender text,
      greeting text,
      card jsonb not null,
      card_png text not null,
      created_at timestamptz not null default now(),
      opened_at timestamptz
    )`;
  })();
  return ready;
}

export interface StoredCard {
  token: string; recipient: string; sender: string; greeting: string;
  card: Record<string, unknown>; card_png: string;
}

export async function saveCard(row: StoredCard) {
  await migrate();
  await db()`insert into lean_cards ${db()(row as never)}
    on conflict (token) do update set recipient = excluded.recipient, sender = excluded.sender,
      greeting = excluded.greeting, card = excluded.card, card_png = excluded.card_png`;
}

export async function getCard(token: string): Promise<StoredCard | null> {
  await migrate();
  const rows = await db()`select token, recipient, sender, greeting, card, card_png
    from lean_cards where token = ${token} limit 1`;
  return (rows[0] as StoredCard | undefined) ?? null;
}

export async function markOpened(token: string) {
  await migrate();
  await db()`update lean_cards set opened_at = now() where token = ${token} and opened_at is null`;
}
