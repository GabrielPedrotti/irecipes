import axios from "axios";

interface IApi {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  headers?: any;
}

export const api = ({ method, url, data = null, headers = null }: IApi) => {
  return axios({
    method,
    url: process.env.EXPO_PUBLIC_API_URL + url,
    data,
    headers,
  });
};
