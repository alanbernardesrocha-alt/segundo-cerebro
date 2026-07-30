import { PrismaClient } from "../generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// No Workers, o binding do D1 só existe dentro do contexto de cada requisição —
// por isso o client é criado sob demanda em vez de uma instância global no módulo.
export async function getPrisma(): Promise<PrismaClient> {
  const { env } = await getCloudflareContext({ async: true });
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}
