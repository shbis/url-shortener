import redis from 'redis';
import { promisify } from 'util';

const redisClient = redis.createClient(
    13036,
    'redis-13036.c1.asia-northeast1-1.gce.cloud.redislabs.com',
    { no_ready_check: true }
);
redisClient.auth('FfFAvmYauVIzXKOFQIJRROcSWyFDQKbv', (err) => {
    if (err) throw err;
});
redisClient.on('connect', async () => {
    console.log('Connected to Redis..');
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

export { SET_ASYNC, GET_ASYNC }
