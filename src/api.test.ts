import axios from "axios";

axios.defaults.validateStatus = () => true;

describe("it should sum", async () => {
  test("Deve criar um evento com sucesso", async () => {
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date().setHours(new Date().getHours() + 1), // 1 hora no futuro
      ownerId: crypto.randomUUID(),
    };
    const response = await axios.post(
      "http://localhost:3000/api/events",
      input,
    );
    expect(response.status).toBe(201);
  });

  test("Deve retornar 400 se createevent lançar uma exceção", async () => {
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date().setHours(new Date().getHours() + 1), // 1 hora no futuro
      ownerId: "invalid-uuid",
    };
    const response = await axios.post(
      "http://localhost:3000/api/events",
      input,
    );
    expect(response.status).toBe(400);
  });
});
