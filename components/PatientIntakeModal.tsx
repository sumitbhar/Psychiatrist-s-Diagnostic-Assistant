import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface PatientIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formattedText: string) => void;
}

const initialFormState = {
  identifier: '',
  age: '',
  gender: '',
  chiefComplaint: '',
  medicalHistory: '',
  currentMedications: '',
  familyHistory: '',
};

type FormErrors = {
    [key in keyof typeof initialFormState]?: string;
};

export const PatientIntakeModal: React.FC<PatientIntakeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.identifier.trim()) {
        newErrors.identifier = 'Patient Identifier is required.';
    }
    if (formData.age) {
        const ageNum = Number(formData.age);
        if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum <= 0) {
            newErrors.age = 'Age must be a positive number.';
        }
    }
    if (!formData.chiefComplaint.trim()) {
        newErrors.chiefComplaint = 'Chief Complaint is required.';
    }
    return newErrors;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    
    const { identifier, age, gender, chiefComplaint, medicalHistory, currentMedications, familyHistory } = formData;

    // Build the formatted string, only including fields that have values.
    let formattedString = 'New Patient Record Analysis:\n';
    if (identifier) formattedString += `- Identifier: ${identifier}\n`;
    if (age) formattedString += `- Age: ${age}\n`;
    if (gender) formattedString += `- Gender: ${gender}\n`;
    if (chiefComplaint) formattedString += `\n**Chief Complaint:**\n${chiefComplaint}\n`;
    if (medicalHistory) formattedString += `\n**Medical History:**\n${medicalHistory}\n`;
    if (currentMedications) formattedString += `\n**Current Medications:**\n${currentMedications}\n`;
    if (familyHistory) formattedString += `\n**Family History:**\n${familyHistory}\n`;
    
    formattedString += '\nPlease analyze the provided patient information.';

    onSubmit(formattedString);
    setFormData(initialFormState); // Reset form after submission
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">New Patient Record</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700" aria-label="Close modal">
            <XIcon className="w-5 h-5" />
          </button>
        </header>
        
        <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg flex items-start space-x-3" role="alert">
            <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-200">Privacy Warning: Do Not Enter Personally Identifiable Information (PII)</h3>
              <p className="text-sm mt-1">
                To protect patient privacy, please use non-identifying information only. Avoid entering details such as names, addresses, social security numbers, or any other data that could directly identify an individual. Use a case number or initials for the "Patient Identifier" field.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-slate-300 mb-1">
                  Patient Identifier <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${errors.identifier ? 'border-red-500' : 'border-slate-600'}`}
                  placeholder="e.g., Initials, Case #"
                  required
                  aria-invalid={!!errors.identifier}
                  aria-describedby="identifier-error"
                />
                {errors.identifier && <p id="identifier-error" className="text-xs text-red-400 mt-1">{errors.identifier}</p>}
            </div>
            <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`w-full bg-slate-900 border rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${errors.age ? 'border-red-500' : 'border-slate-600'}`}
                  placeholder="e.g., 35"
                  aria-invalid={!!errors.age}
                  aria-describedby="age-error"
                />
                {errors.age && <p id="age-error" className="text-xs text-red-400 mt-1">{errors.age}</p>}
            </div>
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-1">
                  Gender
                </label>
                <select 
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="chiefComplaint" className="block text-sm font-medium text-slate-300 mb-1">
              Chief Complaint <span className="text-red-400">*</span>
            </label>
            <textarea
              id="chiefComplaint"
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              rows={3}
              className={`w-full bg-slate-900 border rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${errors.chiefComplaint ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="Describe the primary reason for the consultation..."
              required
              aria-invalid={!!errors.chiefComplaint}
              aria-describedby="chiefComplaint-error"
            />
            {errors.chiefComplaint && <p id="chiefComplaint-error" className="text-xs text-red-400 mt-1">{errors.chiefComplaint}</p>}
          </div>

          <div>
            <label htmlFor="medicalHistory" className="block text-sm font-medium text-slate-300 mb-1">
              Medical History
            </label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="e.g., Past diagnoses, surgeries, allergies..."
            />
          </div>
          
          <div>
            <label htmlFor="currentMedications" className="block text-sm font-medium text-slate-300 mb-1">
              Current Medications
            </label>
            <textarea
              id="currentMedications"
              name="currentMedications"
              value={formData.currentMedications}
              onChange={handleChange}
              rows={2}
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="List all current medications and dosages..."
            />
          </div>

          <div>
            <label htmlFor="familyHistory" className="block text-sm font-medium text-slate-300 mb-1">
              Family History
            </label>
            <textarea
              id="familyHistory"
              name="familyHistory"
              value={formData.familyHistory}
              onChange={handleChange}
              rows={2}
              className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Note any relevant psychiatric or medical history in the family..."
            />
          </div>
        </form>

        <footer className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
            <button
                type="submit"
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
                Submit for Analysis
            </button>
        </footer>
      </div>
    </div>
  );
};
