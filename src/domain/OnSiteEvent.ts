/**
 * ENTIDADE DE DOMÍNIO
 *
 * Esta interface representa o "evento presencial" no coração do sistema.
 * Ela descreve os dados que fazem parte do negócio, sem depender de framework,
 * banco de dados, Express, Drizzle ou qualquer tecnologia externa.
 *
 * Na arquitetura hexagonal, o domínio deve ser a parte mais estável da aplicação.
 * Ele representa o que o sistema "é", e não "como" ele persiste ou expõe dados.
 */
export interface OnSiteEvent {
  id: string;
  name: string;
  ticketPriceInCents: number;
  latitude: number;
  longitude: number;
  date: Date;
  ownerId: string;
}
