// Generic names are drawn from the WHO Model Lists of Essential Medicines.
// https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02
// https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.03
const suggestionsBySpecialty = {
  'General Physician': [
    'Paracetamol',
    'Cetirizine',
    'Oral rehydration salts',
    'Omeprazole',
    'Metformin',
  ],
  Cardiologist: ['Amlodipine', 'Enalapril', 'Furosemide', 'Atorvastatin', 'Aspirin'],
  Dermatologist: ['Cetirizine', 'Clotrimazole', 'Hydrocortisone', 'Permethrin'],
  Pediatrician: [
    'Paracetamol',
    'Oral rehydration salts',
    'Zinc sulfate',
    'Ferrous sulfate',
    'Folic acid',
  ],
  Gynecologist: ['Ferrous sulfate', 'Folic acid', 'Calcium carbonate'],
  Orthopedic: ['Paracetamol', 'Ibuprofen', 'Diclofenac', 'Alendronic acid', 'Calcium carbonate'],
  'ENT Specialist': ['Paracetamol', 'Cetirizine'],
  Dentist: ['Paracetamol', 'Ibuprofen', 'Chlorhexidine', 'Lidocaine'],
  Ophthalmologist: ['Timolol', 'Latanoprost', 'Acetazolamide', 'Atropine'],
};

const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();

export const getMedicineSuggestions = (specialty, query = '') => {
  const normalizedSpecialty = normalize(specialty);
  const normalizedQuery = normalize(query);
  const entry = Object.entries(suggestionsBySpecialty).find(
    ([name]) => normalize(name) === normalizedSpecialty
  );

  if (!entry || !Array.isArray(entry[1])) return [];

  const seen = new Set();
  return entry[1].filter((medicine) => {
    if (typeof medicine !== 'string' || !medicine.trim()) return false;
    const normalizedMedicine = normalize(medicine);
    if (seen.has(normalizedMedicine) || !normalizedMedicine.includes(normalizedQuery)) {
      return false;
    }
    seen.add(normalizedMedicine);
    return true;
  }).slice(0, 6);
};
