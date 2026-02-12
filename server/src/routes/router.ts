import {Router} from "express"
import accRoutes from "./accRoutes.js"
import folRoutes from "./folRoutes.js"
import gameRoutes from "./gameRoutes.js"
import revRoutes from "./revRoutes.js"

// Router object
const router = Router()

router.use('/account', accRoutes)
router.use('/folowers', folRoutes)
router.use('/game', gameRoutes)
router.use('/review', revRoutes)

export default router