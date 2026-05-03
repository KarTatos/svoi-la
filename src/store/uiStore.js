import { create } from "zustand";

export const useUiStore = create((set) => ({
  tipsSearchInput: "",
  tipsSearchApplied: "",
  housingBedsFilter: "all",
  housingSortByFavorites: false,
  placeSortField: "likes",
  placeSortDir: "desc",
  photoViewer: null,
  photoZoom: 1,
  favorites: {},

  setTipsSearchInput: (value) => set({ tipsSearchInput: value }),
  setTipsSearchApplied: (value) => set({ tipsSearchApplied: value }),
  setHousingBedsFilter: (value) => set({ housingBedsFilter: value }),
  setHousingSortByFavorites: (value) => set({ housingSortByFavorites: value }),
  setPlaceSortField: (value) => set({ placeSortField: value }),
  setPlaceSortDir: (value) => set({ placeSortDir: value }),
  setPhotoViewer: (value) => set((state) => ({
    photoViewer: typeof value === "function" ? value(state.photoViewer) : value,
  })),
  setPhotoZoom: (value) => set({ photoZoom: value }),
  setFavorites: (value) => set((state) => ({ favorites: typeof value === "function" ? value(state.favorites) : value })),
  resetUi: () => set({
    tipsSearchInput: "",
    tipsSearchApplied: "",
    housingBedsFilter: "all",
    housingSortByFavorites: false,
    placeSortField: "likes",
    placeSortDir: "desc",
    photoViewer: null,
    photoZoom: 1,
  }),
}));
