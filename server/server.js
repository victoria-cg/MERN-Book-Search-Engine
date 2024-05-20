//create express server
const express = require('express');
const path = require('path');
//db connection opens Mongodb
const db = require('./config/connection');
const routes = require('./routes');
//import apollo server and its express middleware
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
//import auth JWT information as authMiddleware
const { authMiddleware } = require('./utils/auth');
//import required graphql schema files
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;
//create new Apollo graphql server using the typedefs and resolvers files from the schema directory
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

//make an instance of the Apollo server with the Graphql schema
const startApolloServer = async () => {
  await server.start();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//use graphql apollo server as middleware on express server
app.use('/graphql', expressMiddleware(server, {
  context: authMiddleware
}));

// if we're in production, serve client/build for static assets: does that need to change to ..client/dist for node?
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
//added the following line: route that says any request not for a static file will go to index.html, this allows for different front end views loaded by react
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
});

};

//call function to start apollo server
startApolloServer();