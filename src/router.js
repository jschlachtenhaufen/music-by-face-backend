import { Router } from 'express';
import spotify from './services/spotify';

const router = Router();

router.get('/spotify/genres', spotify.getToken, spotify.getGenres);
router.get('/spotify/recommendation', spotify.getToken, spotify.getRecommendation);

export default router;
