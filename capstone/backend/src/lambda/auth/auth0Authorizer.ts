import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth');

// Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings
// -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-m8inevff.auth0.com/.well-known/jwks.json';
let g_cert=null, g_algo=null;
async function getCert(){
  if(g_cert || g_algo) {
    return {
      cert: g_cert,
      algo: g_algo
    };
  }

  let res = await Axios.get(jwksUrl);
  g_cert =`-----BEGIN CERTIFICATE-----
${res.data['keys'][0].x5c[0]}
-----END CERTIFICATE-----`;
  g_algo = res.data['keys'][0].alg; //RS256
  return {
    cert: g_cert,
    algo: g_algo
  };
}

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  let {cert, algo} = await getCert();
  try {
    const jwtToken = verifyToken(event.authorizationToken, cert, algo);
    logger.info(`User ${jwtToken.sub} was authorized with JWT token`);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*' //event.methodArn. '*' is intended for reusing the same cached IAM policy
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
};

function verifyToken(authHeader: string, cert: string, algo: string): JwtPayload{
  const token = getToken(authHeader);
  // Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const jwtPayload = verify(token, cert, {algorithms: [algo]}) as JwtPayload;
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  // jwt.payload;
  return jwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}

