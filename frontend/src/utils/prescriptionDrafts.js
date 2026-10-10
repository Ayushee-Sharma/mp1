const drafts = new Map();

const cloneDraft = (draft) => ({
  ...draft,
  medications: Array.isArray(draft.medications)
    ? draft.medications.map((medicine) => ({ ...medicine }))
    : [],
});

export const getPrescriptionDraftKey = (doctorId, appointmentId) =>
  doctorId && appointmentId ? `${doctorId}:${appointmentId}` : null;

export const getPrescriptionDraft = (key) => {
  const draft = key ? drafts.get(key) : null;
  return draft ? cloneDraft(draft) : null;
};

export const savePrescriptionDraft = (key, draft) => {
  if (key && draft && typeof draft === 'object') {
    drafts.set(key, cloneDraft(draft));
  }
};

export const clearPrescriptionDraft = (key) => {
  if (key) drafts.delete(key);
};
