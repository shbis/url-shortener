import express from 'express';
const router = express.Router();
import { createUrl, getUrl } from '../controllers/urlController.js';

router.post('/url/shorten', createUrl)
router.get('/:urlCode', getUrl)

export default router;