export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  NONE = 'NONE'
}

export interface MedicalRecord {
  id: string;
  date: string;
  hospital: string;
  diagnosis: string;
  details: string;
  type: 'Checkup' | 'Surgery' | 'Lab' | 'Rehab' | 'Prescription' | 'Scan';
  verified?: boolean;
  ocrText?: string;
}

export interface AccessLog {
  id: string;
  doctorName: string;
  timestamp: number;
  action: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  genotype?: string;
  conditions: string[];
  allergies: string[];
  records: MedicalRecord[];
}

export interface DoctorProfile {
    id: string;
    name: string;
    specialty: string;
    hospital: string;
    patientsToday: number;
    licenseNumber?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetReps: number;
  durationStr: string;
  condition: string;
  videoColor: string; // Used for thumbnail background
  referenceVideoUrl: string; // URL for the Gold Standard video
  perfectFormCue: string; // Detailed biomechanical description for the AI
  repDefinition: string; // Explicit definition of one repetition
}

export const MOCK_PATIENT: PatientProfile = {
  id: "P-12345",
  name: "Tayo Eze",
  age: 34,
  gender: "Female",
  bloodGroup: "O+",
  genotype: "AA",
  conditions: ["Mild Hypertension", "Vitamin D Deficiency"],
  allergies: ["Penicillin", "Peanuts"],
  records: [
    {
      id: "R-201",
      date: "2024-02-14",
      hospital: "Lagos City Diagnostics",
      diagnosis: "Malaria Test (Rapid)",
      details: "Presented with mild fever and headache. RDT Positive for P. falciparum. Treatment initiated.",
      type: "Lab",
      verified: true
    },
    {
      id: "R-202",
      date: "2024-01-10",
      hospital: "Mainland General Hospital",
      diagnosis: "Annual Physical",
      details: "Routine checkup. BP 120/80. BMI 24.5. General health is good. Advised to reduce salt intake.",
      type: "Checkup",
      verified: true
    },
    {
      id: "R-203",
      date: "2023-11-05",
      hospital: "Smile 360 Dental",
      diagnosis: "Dental Cleaning",
      details: "Routine scaling and polishing. No cavities found. Gum health improved.",
      type: "Checkup",
      verified: true
    },
    {
      id: "R-204",
      date: "2023-09-20",
      hospital: "Mainland General Hospital",
      diagnosis: "Typhoid Vaccination",
      details: "Typhoid conjugate vaccine administered. No immediate adverse reactions.",
      type: "Prescription", // Using Prescription category for vaccine administration record
      verified: true
    }
  ]
};

export const MOCK_DOCTOR: DoctorProfile = {
    id: "DR-5501",
    name: "Dr. David Adeyinka",
    specialty: "General Practitioner",
    hospital: "Metro General",
    patientsToday: 12,
    licenseNumber: "MD-CN-88921"
};

export const REHAB_EXERCISES: Exercise[] = [
  {
    id: "e2",
    name: "High Knees",
    description: "Stand in place. Lift your knees high towards your chest, alternating legs at a steady pace.",
    targetReps: 20,
    durationStr: "1 Min",
    condition: "ACL Rehab",
    videoColor: "bg-teal-600",
    referenceVideoUrl: "https://ak.picdn.net/shutterstock/videos/1104312917/preview/stock-footage-high-knees-fitness-exercise-workout-animation-male.mp4",
    perfectFormCue: "Torso upright, do not lean back. Knees must rise above hip level. Land softly on balls of feet. Maintain rhythmic breathing.",
    repDefinition: "One rep is ONE knee raise ABOVE hip level. Count every single knee lift. 1, 2, 3..."
  },
  {
    id: "e3",
    name: "Squats",
    description: "Stand with feet shoulder-width apart. Lower your hips as if sitting in a chair. Keep back straight. Rise back up.",
    targetReps: 15,
    durationStr: "3 Sets",
    condition: "ACL Rehab",
    videoColor: "bg-indigo-600",
    referenceVideoUrl: "https://ak.picdn.net/shutterstock/videos/1042909138/preview/stock-footage-barbell-low-bar-squat-3d.mp4",
    perfectFormCue: "Feet shoulder-width apart. Knees must track over toes, do not let them cave inward (valgus). Lumbar spine neutral, do not round the back. Depth should be thighs parallel to floor.",
    repDefinition: "Start standing. Descend until thighs are parallel to floor. Ascend back to standing position. This entire cycle is ONE rep."
  }
];

export const REHAB_SYSTEM_INSTRUCTION = `You are AlIve, a dedicated Rep Counter AI.
Your ONLY goal is to count valid repetitions.

**PROTOCOL:**
1. **LOOK FOR**: The "Peak Action" of the exercise (e.g., knee up, squat down).
2. **ACTION**: When you see the Peak Action, IMMEDIATELY call 'update_exercise_stats' with (reps + 1).
3. **FEEDBACK**: Keep spoken audio extremely brief (e.g., "1", "2", "Good", "Lower").
4. **NO HALLUCINATIONS**: Do not count if the user is still.

**CRITICAL**: You are a machine. Minimize latency. Count fast.`;