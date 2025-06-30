import { configureStore } from '@reduxjs/toolkit';

// Placeholder reducer (add slices as needed)
const rootReducer = {};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;