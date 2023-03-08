import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import resolvers from "./resolvers.js";
import prisma from "./datasources/client.js";

async function startApolloServer() {
  const typeDefs = gql(readFileSync("./schema.gql", { encoding: "utf-8" }));

  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers,
    }),
  });

  try {
    await prisma.$connect();
    const { url } = await startStandaloneServer(server, {
      context: async () => {
        return {
          prisma,
        };
      },
      listen: {
        port: process.env.PORT || 4000,
      },
    });

    console.log(`🚀 Subgraph fix-request ready at ${url}`);
  } catch (err) {
    console.log(err);
  }
}

await startApolloServer();
await prisma.$disconnect();
