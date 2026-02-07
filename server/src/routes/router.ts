import {Router, Request, Response} from "express"
import {create_user, get_user, alter_user, delete_user, add_follower, delete_follower, get_game, get_reviews_for, both_users_exist, create_review, alter_review, delete_review} from "./db.js"

// Locations
const ep_account = '/account'
const ep_follow = '/follower'
const ep_game = '/game'
const ep_review = '/review'

// Acceptance messages
const ok_acc_add = "Account created"
const ok_acc_del = "Account deleted"
const ok_fol_add = "Follower added"
const ok_fol_del = "Follower removed"
const ok_rev_add = "Review added"
const ok_rev_del = "Review removed"

// Error messages
const err_acc_missing_name = "No user name provided"
const err_acc_new_missing_disp = "Display name is required before creating an account"
const err_acc_new_missing_pass = "Password is required before creating an account"
const err_acc_new_missing_email = "Email is required before creating an account"
const err_acc_new_duplicate_name = "Name is already used"
const err_acc_nonexistent = "Name doesn't exist"
const err_fol_alr = "User already follows user"
const err_fol_yet = "User doesn't follow user yet"
const err_game_missing_name = "No game name provided"
const err_game_nonexistent = "Game doesn't exist"
const err_rev_missing_text = "No critique provided"
const err_rev_missing_score = "No score provided"
const err_rev_invalid_score = "Invalid score"
const err_rev_duplicate = "User already has reviewed the game"

function harvest_username(json: any): string {
    const {username} = json
    return username
}

function harvest_gamename(json: any): string {
    const {gamename} = json
    return gamename
}

// Router object
const router = Router()


// Endpoint for functional requirement #1
// Account registry
router.post(ep_account, async (req: Request, res: Response) => {
    const {username, display_name, password, email} = req.body
    if (!username)
        return res.status(400).json({err: err_acc_missing_name})
    if (!display_name)
        return res.status(400).json({err: err_acc_new_missing_disp})
    if (!password)
        return res.status(400).json({err: err_acc_new_missing_pass})
    if (!email)
        return res.status(400).json({err: err_acc_new_missing_email})
    try {
        if (!harvest_username(await create_user(username, display_name, password, email)))
            return res.status(400).json({err: err_acc_new_duplicate_name})
        return res.status(201).json({message: ok_acc_add, username, display_name, password, email})
    } catch (err) {
        return res.status(500).json({err})
    }
})


// Endpoints for functional requirement #3
// Account view
router.get(ep_account, async (req: Request, res: Response) => {
    const username = harvest_username(req.body)
    if (!username)
        return res.status(400).json({err: err_acc_missing_name})
    try {
        const result = await get_user(username)
        if (!harvest_username(result))
            return res.status(404).json({err: err_acc_nonexistent})
        return res.status(200).json(result)
    } catch (err) {
        return res.status(500).json({err})
    }
})
// Account alteration
router.put(ep_account, async (req: Request, res: Response) => {
    const username = harvest_username(req.body)
    if (!username)
        return res.status(400).json({err: err_acc_missing_name})
    try {
        if (await alter_user(req.body))
            return res.status(404).json({err: err_acc_nonexistent})
        return res.status(202).json(req.body)
    } catch (err) {
        return res.status(500).json({err})
    }
})


// Endpoint for functional requirement #4
// Account deletion
router.delete(ep_account, async (req: Request, res: Response) => {
    const username = harvest_username(req.body)
    if (!username)
        return res.status(400).json({err: err_acc_missing_name})
    try {
        if (await delete_user(username))
            return res.status(404).json({err: err_acc_nonexistent})
        return res.status(204).json({message: ok_acc_del, username})
    } catch (err) {
        return res.status(500).json({err})
    }
})


// Endpoint for functional requirement #6
// Follower addition
router.post(ep_follow, async (req: Request, res: Response) => {
    const {username1, username2} = req.body
    if (!username1 || !username2)
        return res.status(400).json({err: err_acc_missing_name})
    try {
        if (!(await both_users_exist(username1, username2)))
            return res.status(404).json({err: err_acc_nonexistent})
        if (await add_follower(username1, username2))
            return res.status(400).json({err: err_fol_alr})
        return res.status(201).json({message: ok_fol_add, username1, username2})
    } catch (err) {
        return res.status(500).json({err})
    }
})

// Follower removal
router.delete(ep_follow, async (req: Request, res: Response) => {
    const {username1, username2} = req.body
    if (!username1 || !username2)
        return res.status(400).json({err: err_acc_missing_name})
    try {
        if (!(await both_users_exist(username1, username2)))
            return res.status(404).json({err: err_acc_nonexistent})
        if (await delete_follower(username1, username2))
            return res.status(400).json({err: err_fol_yet})
        return res.status(202).json({message: ok_fol_del, username1, username2})
    } catch (err) {
        return res.status(500).json({err})
    }
})


// Endpoint for functional requirement #7
// Game view
router.get(ep_game, async (req: Request, res: Response) => {
    const gamename = harvest_gamename(req.body)
    if (!gamename)
        return res.status(400).json({err: err_game_missing_name})
    try {
        const result = await get_game(gamename)
        if (!harvest_gamename(result))
            return res.status(404).json({err: err_game_nonexistent})
        return res.status(200).json(result)
    } catch (err) {
        return res.status(500).json({err})
    }
})


// Endpoint for functional requirement #9
// Review find
router.get(ep_review, async (req: Request, res: Response) => {
    const gamename = harvest_gamename(req.body)
    if (!gamename)
        return res.status(400).json({err: err_game_missing_name})
    try {
        if (!harvest_gamename(await get_game(gamename)))
            return res.status(404).json({err: err_game_nonexistent})
        return res.status(200).json(await get_reviews_for(gamename))
    } catch (err) {
        return res.status(500).json({err})
    }
})


// Endpoint for functional requirement #10
// Review creation
router.post(ep_review, async (req: Request, res: Response) => {
    const {username, gamename, text, score} = req.body
    if (!username)
        return res.status(400).json({err: err_acc_missing_name})
    if (!gamename)
        return res.status(400).json({err: err_game_missing_name})
    if (!text)
        return res.status(400).json({err: err_rev_missing_text})
    if (!score)
        return res.status(400).json({err: err_rev_missing_score})
    if (typeof score !== 'number' || score < 0 || score > 10)
        return res.status(400).json({err: err_rev_invalid_score})
    try {
        if (!harvest_username(await get_user(username)))
            return res.status(404).json({err: err_acc_nonexistent})
        if (!harvest_gamename(await get_game(gamename)))
            return res.status(404).json({err: err_game_nonexistent})
        if (await create_review(username, gamename, text, score))
            return res.status(400).json({err: err_rev_duplicate})
        return res.status(201).json({message: ok_rev_add, username, gamename, text, score})
    } catch (err) {
        return res.status(500).json({err})
    }
})

// Review alteration
router.put(ep_review, async (req: Request, res: Response) => {
    const {username, gamename, score} = req.body
    if (!username)
        return res.status(400).json({err: err_acc_missing_name})
    if (!gamename)
        return res.status(400).json({err: err_game_missing_name})
    if (score! && (typeof score != 'number' || score < 0 || score > 10))
        return res.status(400).json({err: err_rev_invalid_score})
    try {
        if (!harvest_username(await get_user(username)))
            return res.status(404).json({err: err_acc_nonexistent})
        if (!harvest_gamename(await get_game(gamename)))
            return res.status(404).json({err: err_game_nonexistent})
        await alter_review(req.body)
        return res.status(202).json(req.body)
    } catch (err) {
        return res.status(500).json({err})
    }
})

// Review deletion
router.delete(ep_review, async (req: Request, res: Response) => {
    const {username, gamename} = req.body
    if (!username)
        return res.status(400).json({err: err_acc_missing_name})
    if (!gamename)
        return res.status(400).json({err: err_game_missing_name})
    try {
        if (!harvest_username(await get_user(username)))
            return res.status(404).json({err: err_acc_nonexistent})
        if (!harvest_gamename(await get_game(gamename)))
            return res.status(404).json({err: err_game_nonexistent})
        await delete_review(username, gamename)
        return res.status(202).json({message: ok_rev_del, username, gamename})
    } catch (err) {
        return res.status(500).json({err})
    }
})

export default router