import {Router} from "express";
import accRoutes from "./AccountRoutes.js";
import gameRoutes from "./gameRoutes.js";
import revRoutes from "./ReviewRoutes.js";

const router: Router = Router();

// Game routes
router.use('/games', gameRoutes);

// User routes
router.use('/users', accRoutes);

// Review routes (single review resource)
router.use('/reviews', revRoutes);

export default router;
