import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../../../middleware/auth.middleware";

const router = Router();

const authController = new AuthController();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/refresh", authController.refresh);

//router.post("/logout", authenticate, authController.logout); there is a problem with this line, it is causing a type error because the authenticate middleware expects the request to have a user property, but the AuthRequest interface in auth.controller.ts does not have the user property defined. To fix this, we can either add the user property to the AuthRequest interface in auth.controller.ts or we can change the type of req in the logout method to Request instead of AuthRequest. I will go with the second option for now.

export default router;