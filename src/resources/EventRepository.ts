import { and, eq } from "drizzle-orm";

import { EventRepository } from "../application/CreateEvent.js";
import { db } from "../db/client.js";
import * as schema from "../db/schema.js";
import { OnSiteEvent } from "../domain/OnSiteEvent.js";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}
// Adapter (Infra → implementa porta da aplicação)
export class EventRepositoryDrizzle implements EventRepository {
  constructor() {}
  async getByDateLatAndLong(params: {
    date: Date;
    latitude: number;
    longitude: number;
  }): Promise<OnSiteEvent | null> {
    const output = await db.query.eventsTable.findFirst({
      where: and(
        eq(schema.eventsTable.date, params.date),
        eq(schema.eventsTable.latitude, params.latitude.toString()),
        eq(schema.eventsTable.longitude, params.longitude.toString()),
      ),
    });

    if (!output) return null;

    return {
      id: output.id,
      date: output.date,
      latitude: Number(output.latitude),
      longitude: Number(output.longitude),
      name: output.name,
      ownerId: output.owner_id,
      ticketPriceInCents: output.ticket_price_in_cents,
    };
  }

  async create(input: OnSiteEvent): Promise<OnSiteEvent> {
    const [output] = await db
      .insert(schema.eventsTable)
      .values({
        id: input.id,
        date: input.date,
        latitude: input.latitude,
        longitude: input.longitude,
        name: input.name,
        owner_id: input.ownerId,
        ticket_price_in_cents: input.ticketPriceInCents,
      })
      .returning();

    return {
      id: output.id,
      date: output.date,
      latitude: Number(output.latitude),
      longitude: Number(output.longitude),
      name: output.name,
      ownerId: output.owner_id,
      ticketPriceInCents: output.ticket_price_in_cents,
    };
  }
}
