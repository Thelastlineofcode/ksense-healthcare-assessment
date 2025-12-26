export interface Patient {
    patient_id: string;
    name: string;
    age: number | string; // Can be invalid string
    gender: string;
    blood_pressure: string;
    temperature: number | string; // Can be invalid string
    visit_date: string;
    diagnosis: string;
    medications: string;
}

export interface PatientResponse {
    data: Patient[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
    metadata: {
        timestamp: string;
        version: string;
        requestId: string;
    };
}

export interface ScoringResult {
    patient_id: string;
    risk_score: number;
    is_high_risk: boolean;
    has_fever: boolean;
    has_data_quality_issues: boolean;
}

export interface AssessmentSubmission {
    high_risk_patients: string[];
    fever_patients: string[];
    data_quality_issues: string[];
}
