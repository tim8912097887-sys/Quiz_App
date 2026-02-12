import { CorsOptions } from "cors";

const allowedOrigin = ["http://localhost:5173"]

export const corsOptions: CorsOptions = {
      origin: (origin,callback) => {
          if(origin && allowedOrigin.indexOf(origin) !== -1) {
             callback(null,true);
          } else {
             callback(new Error('Not allowed by CORS'));
          }
      },
      methods: ['GET','POST','PUT','DELETE'],
      allowedHeaders: ['Content-Type', 'authorization'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204
}