import axios from "axios";

export function createApiClient(baseURL: string) {
  return axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000
  });
}