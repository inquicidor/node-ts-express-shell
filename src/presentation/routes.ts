import { Router } from 'express';
import { Authroutes } from './auth/routes';
import { CategoryRoutes } from './category/router';
import { ProductRoutes } from './products/router';
import { FileUploadRoutes } from './file-upload/router';
import { ImageRoutes } from './Images/routes';




export class AppRoutes {


  static get routes(): Router {

    const router = Router();
    
    // Definir las rutas
    router.use('/api/auth', Authroutes.routes);
    router.use('/api/categories', CategoryRoutes.routes);
    router.use('/api/products', ProductRoutes.routes);
    router.use('/api/upload', FileUploadRoutes.routes);
    router.use('/api/images', ImageRoutes.routes);

    


    return router;
  }


}

