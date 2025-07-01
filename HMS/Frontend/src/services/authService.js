import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

export const loginUser = (data) => axios.post(API_ENDPOINTS.LOGIN, data);
export const signupBaseUser = (data) => axios.post(API_ENDPOINTS.SIGNUP_USER, data);

export const signupByRole = (role, data) => {
  const roleMap = {
    Doctor: API_ENDPOINTS.SIGNUP_DOCTOR,
    Patient: API_ENDPOINTS.SIGNUP_PATIENT,
    Pharmacist: API_ENDPOINTS.SIGNUP_PHARMACIST,
    Admin: API_ENDPOINTS.SIGNUP_ADMIN
  };
  return axios.post(roleMap[role], data);
};
