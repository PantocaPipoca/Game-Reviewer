import { Router } from "express";
import accRoutes from "./AccountRoutes.js";
import gameRoutes from "./GameRoutes.js";
import revRoutes from "./ReviewRoutes.js";

const router: Router = Router({ mergeParams: true });

// Game routes
router.use("/games", gameRoutes);

// User routes
router.use("/users", accRoutes);

// Review routes
router.use("/reviews", revRoutes);

export default router;
