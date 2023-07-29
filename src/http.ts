import Axios from 'axios';
import { AxiosCacheInstance, setupCache } from 'axios-cache-interceptor';

let axios: AxiosCacheInstance | null = null;

const getAxios = () => {
  if (!axios) {
    axios = setupCache(Axios); 
  }
  return axios;
}

const options = { cache: { ttl: 1000 * 30 } }

export {
  getAxios,
  options
}
