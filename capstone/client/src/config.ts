// Once application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'bf27xrghud';
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`;

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map
  domain: 'dev-m8inevff.auth0.com', // Auth0 domain
  clientId: 'aFdJ4o5UMPClaUAciATK0SQYWtD95TeC', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
};
