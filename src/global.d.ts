// This was written to extend the request parameter with current user already in, so that middleware authentication performs quickly, but it was perfectly working in javascript but ni typescripts it gives an error which  persists even after 2 horus of debugging so I left that optiona dn will auth the current user based onthe datda stored in cookeies. this is just kept as for reference now

import {Role} from '@prisma/client'

declare global {
   namespace Express {
      interface Request {
         users?:{
            id:string,
            role:Role
         };
      }
   }
}


export{}