import { Patient, ScoringResult } from './types';

function isMissing(val: any): boolean {
    return val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val));
}

function calculateAgeScore(age: any): { score: number; isValid: boolean } {
    if (isMissing(age)) return { score: 0, isValid: false };

    let numericAge: number;
    if (typeof age === 'number') {
        numericAge = age;
    } else if (typeof age === 'string') {
        const parsed = parseFloat(age);
        if (isNaN(parsed) || !isFinite(parsed)) return { score: 0, isValid: false };
        numericAge = parsed;
    } else {
        return { score: 0, isValid: false };
    }

    if (numericAge < 0) return { score: 0, isValid: false };

    if (numericAge < 40) return { score: 1, isValid: true };
    if (numericAge >= 40 && numericAge <= 65) return { score: 1, isValid: true };
    if (numericAge > 65) return { score: 2, isValid: true };

    return { score: 0, isValid: false };
}

function calculateTempScore(temp: any): { score: number; isValid: boolean, isFever: boolean } {
    if (isMissing(temp)) return { score: 0, isValid: false, isFever: false };

    let numericTemp: number;
    if (typeof temp === 'number') {
        numericTemp = temp;
    } else if (typeof temp === 'string') {
        const parsed = parseFloat(temp);
        if (isNaN(parsed) || !isFinite(parsed)) return { score: 0, isValid: false, isFever: false };
        numericTemp = parsed;
    } else {
        return { score: 0, isValid: false, isFever: false };
    }

    const isFever = numericTemp >= 99.6;

    if (numericTemp >= 101.0) return { score: 2, isValid: true, isFever };
    if (numericTemp >= 99.6) return { score: 1, isValid: true, isFever };
    return { score: 0, isValid: true, isFever };
}

function calculateBPScore(bp: any): { score: number; isValid: boolean } {
    if (isMissing(bp)) return { score: 0, isValid: false };
    if (typeof bp !== 'string') return { score: 0, isValid: false };

    const parts = bp.split('/');
    if (parts.length !== 2) return { score: 0, isValid: false };

    const sysStr = parts[0].trim();
    const diaStr = parts[1].trim();

    if (sysStr === '' || diaStr === '') return { score: 0, isValid: false };

    const sys = parseFloat(sysStr);
    const dia = parseFloat(diaStr);

    if (isNaN(sys) || isNaN(dia)) return { score: 0, isValid: false };

    if (sys >= 140 || dia >= 90) return { score: 4, isValid: true };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { score: 3, isValid: true };
    if ((sys >= 120 && sys <= 129) && (dia < 80)) return { score: 2, isValid: true };
    if (sys < 120 && dia < 80) return { score: 1, isValid: true };

    return { score: 0, isValid: true };
}

export function calculateRisk(patient: Patient): ScoringResult {
    const ageResult = calculateAgeScore(patient.age);
    const tempResult = calculateTempScore(patient.temperature);
    const bpResult = calculateBPScore(patient.blood_pressure);

    const hasDataQualityIssues = !ageResult.isValid || !tempResult.isValid || !bpResult.isValid;
    const totalRisk = ageResult.score + tempResult.score + bpResult.score;

    return {
        patient_id: patient.patient_id,
        risk_score: totalRisk,
        is_high_risk: totalRisk > 4,
        has_fever: tempResult.isFever,
        has_data_quality_issues: hasDataQualityIssues
    };
}
