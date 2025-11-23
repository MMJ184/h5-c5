// src/services/PatientService.ts
import ApiClient from '../api/ApiClient';

export type Patient = {
  id: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  doctor?: string;
  lastVisit?: string;
  status?: 'active' | 'inactive' | 'discharged';
  avatarUrl?: string;
};

/**
 * Query params we support from UI (page, pageSize, search, gender, startDate, endDate, sortBy, sortOrder)
 */
export type PatientQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  gender?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const BASE = '/patients';

export const PatientService = {
  // list (server-side paged)
  async list(params?: PatientQuery) {
    // callers expect { data: Patient[], total: number, page, pageSize }
    const res = await ApiClient.get(BASE, { params });
    // res.data should be the JSON payload (see public/mock/patients.json)
    return res.data;
  },

  // get single
  async get(id: string) {
    const res = await ApiClient.get(`${BASE}/${id}`);
    return res.data;
  },

  // create
  async create(payload: Partial<Patient>) {
    const res = await ApiClient.post(BASE, payload);
    return res.data;
  },

  // update
  async update(id: string, payload: Partial<Patient>) {
    const res = await ApiClient.put(`${BASE}/${id}`, payload);
    return res.data;
  },

  // delete
  async remove(id: string) {
    const res = await ApiClient.delete(`${BASE}/${id}`);
    return res.data;
  },

  // bulk delete example
  async bulkDelete(ids: string[]) {
    const res = await ApiClient.post(`${BASE}/bulk-delete`, { ids });
    return res.data;
  },
};
