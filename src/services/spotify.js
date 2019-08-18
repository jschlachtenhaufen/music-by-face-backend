import dotenv from 'dotenv';
import rp from 'request-promise';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SEARCH_URL = 'https://api.spotify.com/v1/recommendations';
dotenv.config({ silent: true });

const spotify = {
    token: {
        value: '',
        expiration: '',
    },

    _isTokenValid: () => {
        if (!spotify.token.value) return false;
        if (Date.now() / 1000 >= spotify.token.expiration - 300) return false;
        return true;
    },

    // middleware function to pass on oauth token
    getToken: (req, res, next) => {
        if (spotify._isTokenValid()) {
            next(spotify.token.value);
        } else {
            const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
            const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

            const options = {
                method: 'POST',
                uri: TOKEN_URL,
                form: { grant_type: 'client_credentials' },
                headers: { Authorization: `Basic ${auth}` },
                json: true,
            };

            rp(options).then((token) => {
                spotify.token.value = token.access_token;
                const currentTime = new Date();
                spotify.token.expiration = currentTime / 1000 + token.expires_in;
                next(spotify.token.value);
            }).catch((err) => {
                res.send(err);
            });
        }
    },

    getGenres: (token, req, res, next) => {
        const options = {
            method: 'GET',
            uri: `${SEARCH_URL}/available-genre-seeds`,
            headers: { Authorization: `Bearer ${token}` },
            json: true,
        };

        rp(options).then((genres) => {
            res.send(genres);
        }).catch((err) => {
            res.send(err);
        });
    },

    getRecommendation: (token, req, res, next) => {
        const options = {
            method: 'GET',
            uri: `${SEARCH_URL}`,
            headers: { Authorization: `Bearer ${token}` },
            json: true,
            qs: req.query,
        };

        rp(options).then((tracks) => {
            res.send(tracks.tracks);
        }).catch((err) => {
            res.send(err);
        });
    },
};

export default spotify;
