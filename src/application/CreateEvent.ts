import { OnSiteEvent } from "../domain/OnSiteEvent.js";
/**
 * INPUT DO CASO DE USO
 *
 * Este tipo representa os dados necessários para executar o caso de uso
 * "criar evento".
 *
 * Repare que o input não recebe "id", porque o id será gerado internamente
 * pela própria aplicação.
 */
interface Input {
  name: string;
  ticketPriceInCents: number;
  latitude: number;
  longitude: number;
  date: Date;
  ownerId: string;
}
/**
 * PORTA DE SAÍDA (OUTPUT PORT)
 *
 * Esta interface é um contrato que o caso de uso precisa para salvar e consultar eventos.
 *
 * Na arquitetura hexagonal, a aplicação NÃO deve conhecer Drizzle, SQL, PostgreSQL,
 * Express ou qualquer detalhe de infraestrutura.
 *
 * Então, ao invés de CreateEvent importar diretamente o banco, ele depende de uma
 * ABSTRAÇÃO: EventRepository.
 *
 * Mais adiante, esse contrato será implementado por um adapter concreto:
 * EventRepositoryDrizzle, no arquivo de infraestrutura.
 */
export interface EventRepository {
  create(input: OnSiteEvent): Promise<OnSiteEvent>;
  getByDateLatAndLong: (params: {
    date: Date;
    latitude: number;
    longitude: number;
  }) => Promise<OnSiteEvent | null>;
}
/**
 * CASO DE USO / APPLICATION SERVICE
 *
 * Esta classe representa a regra de negócio "criar evento".
 *
 * É aqui que ficam as validações e decisões de negócio:
 * - ownerId deve ser UUID
 * - ticket não pode ser negativo
 * - latitude e longitude devem ser válidas
 * - a data deve ser futura
 * - não pode existir outro evento na mesma data/local
 *
 * IMPORTANTE:
 * Esta classe depende da PORTA EventRepository, e não da implementação concreta.
 * Isso é INVERSÃO DE DEPENDÊNCIA.
 */
export class CreateEvent {
  /**
   * INJEÇÃO DE DEPENDÊNCIA
   *
   * Aqui o repositório é recebido "de fora".
   * A classe não cria sozinha um EventRepositoryDrizzle.
   *
   * Isso deixa o caso de uso desacoplado da infraestrutura
   * e facilita muito os testes.
   *
   * Exemplo:
   * - em produção: pode receber EventRepositoryDrizzle
   * - em teste: pode receber EventRepositoryInMemory
   */
  constructor(private eventRepository: EventRepository) {}
  async execute(input: Input) {
    const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
      input;
    /**
     * REGRA DE NEGÓCIO:
     * ownerId precisa ser um UUID válido
     */
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        ownerId,
      )
    ) {
      throw new Error("Invalid ownerId");
    }

    /**
     * REGRA DE NEGÓCIO:
     * ticketPriceInCents deve ser um número positivo
     */

    if (ticketPriceInCents < 0) {
      throw new Error("ticketPriceInCents must be a positive integer");
    }

    /**
     * REGRA DE NEGÓCIO:
     * latitude deve estar entre -90 e 90
     */

    if (latitude < -90 || latitude > 90) {
      throw new Error("invalid latitude");
    }

    /**
     * REGRA DE NEGÓCIO:
     * longitude deve estar entre -180 e 180
     */
    if (longitude < -180 || longitude > 180) {
      throw new Error("invalid longitude");
    }

    /**
     * REGRA DE NEGÓCIO:
     * date deve ser no futuro
     */
    if (date < new Date()) {
      throw new Error("Date must be in the future");
    }
    /**
     * REGRA DE NEGÓCIO:
     * não pode existir outro evento na mesma data e local
     *
     * Para verificar isso, o caso de uso usa a PORTA EventRepository.
     * Ele não sabe se os dados vêm de PostgreSQL, memória, arquivo, API etc.
     */
    const existenteEvent = await this.eventRepository.getByDateLatAndLong({
      date,
      latitude,
      longitude,
    });
    if (existenteEvent) {
      throw new Error(
        "Já existe um evento para a mesma data, latitude e longitude",
      );
    }
    /**
     * AQUI A APLICAÇÃO MONTA A ENTIDADE DE DOMÍNIO
     *
     * Esse objeto segue a estrutura da entidade OnSiteEvent,
     * definida em ../domain/OnSiteEvent.js
     */
    const event = await this.eventRepository.create({
      id: crypto.randomUUID(),
      name,
      ticketPriceInCents,
      latitude,
      longitude,
      date,
      ownerId,
    });

    return event;
  }
}
