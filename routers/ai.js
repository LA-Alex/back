import { Router } from 'express'
import * as ai from '../controllers/ai.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/openai', ai.aiApi)
router.post('/save', auth.jwt, ai.apiSave)
router.get('/save', auth.jwt, ai.aiBooking)
router.delete('/save/:id', auth.jwt, ai.deleteRecord)

export default router
