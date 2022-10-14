import shortId from 'shortid';
import validUrl from 'valid-url';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import urlModel from '../model/urlModel.js';
import { isUrlValid } from '../util/urlValidator.js';
import { SET_ASYNC, GET_ASYNC } from '../caching/cache.js';

//=============================================createUrl==============================================>
const createUrl = async (req, res) => {
    try {
        const reqBody = req.body
        const { longUrl } = reqBody

        if (!longUrl)
            return res.status(400).send({ status: false, message: 'Please enter longUrl for shorting' });

        if (Object.keys(reqBody).length > 1)
            return res.status(400).send({ status: false, message: 'You can not add extra fields' })

        if (!isUrlValid(longUrl))
            return res.status(400).send({ status: false, message: 'Please enter valid url1' });

        if (!validUrl.isUri(longUrl))
            return res.status(400).send({ status: false, message: 'Please enter valid url2' });

        // checking in cached data
        let cache = await GET_ASYNC(`${longUrl}`);
        cache = JSON.parse(cache)
        if (cache)
            return res.status(201).send({ status: true, message: 'Already exists...', data: cache });

        //checking in db
        let existUrl = await urlModel.findOne({ longUrl }).select({ urlCode: 1, longUrl: 1, shortUrl: 1, _id: 0 })
        if (existUrl)
            return res.status(201).send({ status: true, message: 'Already exists...', data: existUrl });

        //axios call 
        let liveLink = false
        await axios.get(longUrl)
            .then((res) => {
                if (res.status == 200 || res.status == 201) liveLink = true;
            })
            .catch((err) => liveLink = false)

        if (liveLink == false)
            return res.status(400).send({ status: false, message: `'${longUrl}' this longUrl does not exist` });

        // create url code
        let urlCode = shortId.generate().toLowerCase();
        const shortUrl = process.env.baseUrl + urlCode;

        const savedData = {
            urlCode: urlCode,
            longUrl: longUrl,
            shortUrl: shortUrl,
        };

        //generating short url
        const newUrl = await urlModel.create(savedData);
        return res.status(201).send({ status: true, message: 'Saving new record...', data: newUrl });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//==============================================getUrl===========================================>
const getUrl = async (req, res) => {
    try {
        const urlCode = req.params.urlCode;

        if (!shortId.isValid(urlCode))
            return res.status(400).send({ status: false, message: `'${urlCode}' this shortUrl is invalid` })

        //finding data from cache
        let cache = await GET_ASYNC(`${urlCode}`)
        cache = JSON.parse(cache)
        if (cache)
            return res.status(302).redirect(cache.longUrl)

        //finding data from DB
        const existUrl = await urlModel.findOne({ urlCode })
        if (!existUrl)
            return res.status(404).json({ message: 'No url found' });

        await SET_ASYNC(`${urlCode}`, JSON.stringify(existUrl))
        return res.status(302).redirect(existUrl.longUrl)

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


export { createUrl, getUrl };
