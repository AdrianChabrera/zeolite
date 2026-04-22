import axios from 'axios';

const API = 'http://localhost:8000/api';

export const createCharacter = (data: object) => axios.post(`${API}/characters`, data);
export const createLocation  = (data: object) => axios.post(`${API}/locations`, data);
export const createGroup     = (data: object) => axios.post(`${API}/groups`, data);
export const createObject    = (data: object) => axios.post(`${API}/objects`, data);
export const createEvent     = (data: object) => axios.post(`${API}/events`, data);

export const getCharacter = (id: string) => axios.get(`${API}/characters/${id}`);
export const getLocation  = (id: string) => axios.get(`${API}/locations/${id}`);
export const getGroup     = (id: string) => axios.get(`${API}/groups/${id}`);
export const getObject    = (id: string) => axios.get(`${API}/objects/${id}`);
export const getEvent     = (id: string) => axios.get(`${API}/events/${id}`);

export const updateCharacter = (id: string, data: object) => axios.put(`${API}/characters/${id}`, data);
export const updateLocation  = (id: string, data: object) => axios.put(`${API}/locations/${id}`, data);
export const updateGroup     = (id: string, data: object) => axios.put(`${API}/groups/${id}`, data);
export const updateObject    = (id: string, data: object) => axios.put(`${API}/objects/${id}`, data);
export const updateEvent     = (id: string, data: object) => axios.put(`${API}/events/${id}`, data);

export const deleteCharacter = (id: string) => axios.delete(`${API}/characters/${id}`);
export const deleteLocation  = (id: string) => axios.delete(`${API}/locations/${id}`);
export const deleteGroup     = (id: string) => axios.delete(`${API}/groups/${id}`);
export const deleteObject    = (id: string) => axios.delete(`${API}/objects/${id}`);
export const deleteEvent     = (id: string) => axios.delete(`${API}/events/${id}`);

export const getCharacterFullContext = (id: string) => axios.get(`${API}/dashboard/basic/character-full-context/${id}`);