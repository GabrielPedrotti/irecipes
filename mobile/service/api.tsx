import axios from "axios";

interface IApi {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export const api = ({ method, url, data = null }: IApi) => {
  const apiUrl = process.env.API_URL;
  console.log("API URL:", apiUrl);
  return axios({
    method,
    url: `https://1288-45-163-75-72.ngrok-free.app/api/v1/${url}`,
    data,
  });
};
