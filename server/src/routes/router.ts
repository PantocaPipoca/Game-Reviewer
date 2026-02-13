import {Router} from "express"
import accRoutes from "./AccountRoutes.js"
import folRoutes from "./FollowerRoutes.js"
import gameRoutes from "./gameRoutes.js"
import revRoutes from "./ReviewRoutes.js"

// Router object
const router: Router = Router()

router.use('/account', accRoutes)
router.use('/followers', folRoutes)
router.use('/game', gameRoutes)
router.use('/review', revRoutes)

export default router
