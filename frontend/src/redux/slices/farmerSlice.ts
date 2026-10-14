import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Farmer, FarmVisit } from '@/types';

interface FarmerState {
  farmers: Farmer[];
  visits: FarmVisit[];
  loading: boolean;
  error: string | null;
}

const initialState: FarmerState = {
  farmers: [
    {
      id: 1,
      fullName: 'Ahmet Yılmaz',
      nationalId: '12345678901',
      phoneNumber: '05321234567',
      region: 'Ankara',
      district: 'Gölbaşı',
      createdAt: new Date().toISOString(),
    },
  ],
  visits: [],
  loading: false,
  error: null,
};

const farmerSlice = createSlice({
  name: 'farmer',
  initialState,
  reducers: {
    addFarmer: (state, action: PayloadAction<Farmer>) => {
      state.farmers.push(action.payload);
    },
    updateFarmer: (state, action: PayloadAction<Farmer>) => {
      const index = state.farmers.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.farmers[index] = action.payload;
      }
    },
    deleteFarmer: (state, action: PayloadAction<number>) => {
      // İş Kuralı 6: Bağlı ziyaret kaydı bulunan çiftçi silinemez
      const hasVisits = state.visits.some((v) => v.farmerId === action.payload);
      if (hasVisits) {
        state.error = 'Bağlı ziyaret kaydı bulunan çiftçi silinemez!';
        return;
      }
      state.farmers = state.farmers.filter((f) => f.id !== action.payload);
      state.error = null;
    },
    addVisit: (state, action: PayloadAction<FarmVisit>) => {
      state.visits.push(action.payload);
    },
    updateVisit: (state, action: PayloadAction<FarmVisit>) => {
      const index = state.visits.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.visits[index] = action.payload;
      }
    },
    deleteVisit: (state, action: PayloadAction<number>) => {
      state.visits = state.visits.filter((v) => v.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addFarmer,
  updateFarmer,
  deleteFarmer,
  addVisit,
  updateVisit,
  deleteVisit,
  clearError,
} = farmerSlice.actions;

export default farmerSlice.reducer;