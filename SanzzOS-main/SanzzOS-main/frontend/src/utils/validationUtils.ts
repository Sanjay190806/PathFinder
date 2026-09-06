// Modular validators placeholder. Zod compilation verify in build check.
export const validateNoteInput = (text: string): boolean => {
  return text.length <= 1500;
};
export const validateUsername = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};
