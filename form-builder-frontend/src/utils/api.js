import { API_BASE_URL } from '../config';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('jwtToken');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

