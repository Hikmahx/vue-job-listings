import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './reducers/jobSlice';
import filterReducer from './reducers/filterSlice';
import authReducer from './reducers/authSlice';
import companyReducer from './reducers/companySlice';

export const store = configureStore({
  reducer: {
    jobs: jobReducer,
    filters: filterReducer,
    auth: authReducer,
    companies: companyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
