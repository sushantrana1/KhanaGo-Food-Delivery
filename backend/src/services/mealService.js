import axios from "axios";
import { config } from "../config/env.js";

const client = axios.create({
  baseURL: config.themealdbUrl,
  timeout: 15000,
});

export const fetchFromThemealdb = async (endpoint, params = {}) => {
  const response = await client.get(endpoint, { params });
  return response.data;
};
