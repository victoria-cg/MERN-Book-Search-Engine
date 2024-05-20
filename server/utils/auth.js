const jwt = require('jsonwebtoken');
//import graphQL to make graphQLError constant
const { GraphQLError } = require('graphql');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  
  //make an instarnce of GraphQLError
 AuthenticationError: new GraphQLError('Could not authenticate user.', {
  extensions: {
    code: 'UNAUTHENTICATED',
  },
 });

  // function for our authenticated routes
  authMiddleware: function ({req}) {
    // allows token to be sent via  req.query or headers or req.body
    let token = req.body.token || req.query.token || req.headers.authorization;

    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
    }

    return req;

    // send to next endpoint: this is not needed for the graphql version/reformatting?
    //next();
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
