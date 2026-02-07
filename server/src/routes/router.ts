import {Router, Request, Response} from "express";

const router = Router()

router.get('/', async (_: Request, res: Response) => {
    res.json({message: "GET"})
})

router.post('/', async (_: Request, res: Response) => {
    res.status(201).send({message: "POST"})
})

router.put('/', async (_: Request, res: Response) => {
    res.status(202).send({message: "PUT"})
})

router.delete('/', async (_: Request, res: Response) => {
    res.status(201).send({message: "DELETE"})
})

export default router