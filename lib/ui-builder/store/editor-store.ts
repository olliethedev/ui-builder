import { create, StateCreator } from 'zustand';

export interface EditorStore {
    previewMode: 'mobile' | 'tablet' | 'desktop' | 'responsive';
    setPreviewMode: (mode: 'mobile' | 'tablet' | 'desktop' | 'responsive') => void;
}

const store: StateCreator<EditorStore, [], []> = (set) => ({
    previewMode: 'responsive',
    setPreviewMode: (mode) => set({ previewMode: mode }),
});

export const useEditorStore = create<EditorStore>()(store);