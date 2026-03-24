import express from "express";

import { CreateEvent } from "./application/CreateEvent.js";
import { EventRepositoryDrizzle } from "./resources/EventRepository.js";

const app = express();

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello, World!" });
});
/**
 * ADAPTER DE ENTRADA
 *
 * O Express funciona como um adapter de entrada.
 * Ele recebe HTTP, transforma em dados para a aplicação
 * e chama o caso de uso.
 *
 * Fluxo:
 * HTTP Request -> Express Route -> CreateEvent -> EventRepository -> Banco
 */
app.post("/api/events", async (req, res) => {
  const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
    req.body;

  try {
    /**
     * AQUI ACONTECE A COMPOSIÇÃO DAS DEPENDÊNCIAS
     *
     * Estamos criando a implementação concreta do repositório
     * e injetando no caso de uso.
     *
     * Isso é INJEÇÃO DE DEPENDÊNCIA na prática.
     */
    const eventRepositoryDrizzle = new EventRepositoryDrizzle();
    const createEvent = new CreateEvent(eventRepositoryDrizzle);
    const event = await createEvent.execute({
      name,
      date: new Date(date),
      ticketPriceInCents,
      latitude,
      longitude,
      ownerId,
    });

    console.log("event:", event);

    return res.status(201).json(event);
  } catch (error: unknown) {
    console.log("error:", error);

    const message = error instanceof Error ? error.message : "Unexpected error";

    return res.status(400).json({ message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
