import { OnSiteEvent } from "../domain/OnSiteEvent.js";
import { CreateEvent, EventRepository } from "./CreateEvent.js";

describe("create Event", () => {
  class EventRepositoryInMemory implements EventRepository {
    events: OnSiteEvent[] = [];

    async getByDateLatAndLong(params: {
      date: Date;
      latitude: number;
      longitude: number;
    }): Promise<OnSiteEvent | null> {
      const event = this.events.find(
        (event) =>
          event.date.getTime() === params.date.getTime() &&
          event.latitude === params.latitude &&
          event.longitude === params.longitude,
      );

      return event ?? null;
    }

    async create(event: OnSiteEvent): Promise<OnSiteEvent> {
      this.events.push(event);
      return event;
    }
  }

  test("Deve criar um evento com sucesso", async () => {
    const eventRepository = new EventRepositoryInMemory();
    const createEvent = new CreateEvent(eventRepository);

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    };

    const output = await createEvent.execute(input);

    expect(output.name).toBe(input.name);
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents);
    expect(output.latitude).toBe(input.latitude);
    expect(output.longitude).toBe(input.longitude);
    expect(new Date(output.date)).toEqual(input.date);
    expect(output.ownerId).toBe(input.ownerId);
  });

  test("Deve lançar um erro se o ownerId nao for UUID", async () => {
    const eventRepository = new EventRepositoryInMemory();
    const createEvent = new CreateEvent(eventRepository);

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: "invalid-uuid",
    };

    await expect(createEvent.execute(input)).rejects.toThrow("Invalid ownerId");
  });

  test("Deve lançar um erro se o ticket price in cents for negativo", async () => {
    const eventRepository = new EventRepositoryInMemory();
    const createEvent = new CreateEvent(eventRepository);

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: -1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    };

    await expect(createEvent.execute(input)).rejects.toThrow(
      "ticketPriceInCents must be a positive integer",
    );
  });

  test("Deve lançar um erro se a latitude for inválida", async () => {
    const eventRepository = new EventRepositoryInMemory();
    const createEvent = new CreateEvent(eventRepository);

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -100,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    };

    await expect(createEvent.execute(input)).rejects.toThrow(
      "invalid latitude",
    );
  });

  test("Deve lançar um erro se a longitude for inválida", async () => {
    const eventRepository = new EventRepositoryInMemory();
    const createEvent = new CreateEvent(eventRepository);

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -200,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    };

    await expect(createEvent.execute(input)).rejects.toThrow(
      "invalid longitude",
    );
  });

  test("Deve lançar um erro se a data for no passado", async () => {
    const eventRepository = new EventRepositoryInMemory();
    const createEvent = new CreateEvent(eventRepository);

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -100,
      date: new Date(new Date().setHours(new Date().getHours() - 2)),
      ownerId: crypto.randomUUID(),
    };

    await expect(createEvent.execute(input)).rejects.toThrow(
      "Date must be in the future",
    );
  });

  test("Deve lançar um erro se ja existir um evento para a mesma data, latitude e longitude", async () => {
    const date = new Date(new Date().setHours(new Date().getHours() + 2));
    const eventRepository = new EventRepositoryInMemory();
    const createEvent = new CreateEvent(eventRepository);

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -100,
      date,
      ownerId: crypto.randomUUID(),
    };

    const output = await createEvent.execute(input);

    expect(output.name).toBe(input.name);
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents);

    await expect(createEvent.execute(input)).rejects.toThrow(
      "Já existe um evento para a mesma data, latitude e longitude",
    );
  });
});
