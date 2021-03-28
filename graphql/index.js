const { ApolloServer } = require('apollo-server');
const fs = require('fs')
const path = require('path')

const resolvers = require('./resolvers')

// chargement du schéma
const typeDefs = fs.readFileSync(path.join(__dirname, 'model.graphql'),{encoding:'utf-8'})

// définition du serveur
const server = new ApolloServer({ typeDefs, resolvers, playground: false });

// lancement du serveur
server.listen().then(({ url }) => {
  console.log(`🚀  GraphQL Server ready at ${url}`);
});
