import { calculateRisk } from './scoring';
import { Patient } from './types';
import assert from 'assert';

console.log('Running scoring tests...');

const basePatient: Patient = {
    patient_id: 'test',
    name: 'Test',
    age: 30,
    gender: 'M',
    blood_pressure: '110/70',
    temperature: 98.6,
    visit_date: '2024-01-01',
    diagnosis: '',
    medications: ''
};

function test(name: string, p: Partial<Patient>, expected: { score: number, highRisk: boolean, fever: boolean, quality: boolean }) {
    const patient = { ...basePatient, ...p } as Patient;
    const res = calculateRisk(patient);

    try {
        assert.strictEqual(res.risk_score, expected.score, `Score mismatch for ${name}`);
        assert.strictEqual(res.is_high_risk, expected.highRisk, `HighRisk mismatch for ${name}`);
        assert.strictEqual(res.has_fever, expected.fever, `Fever mismatch for ${name}`);
        assert.strictEqual(res.has_data_quality_issues, expected.quality, `Quality mismatch for ${name}`);
        console.log(`✅ ${name} passed`);
    } catch (e: any) {
        console.error(`❌ ${name} failed: ${e.message}`);
        console.error('Result:', res);
        process.exit(1);
    }
}

test('Age < 40 (30)', { age: 30 }, { score: 2, highRisk: false, fever: false, quality: false });
test('Age 40-65 (50)', { age: 50 }, { score: 2, highRisk: false, fever: false, quality: false });
test('Age > 65 (70)', { age: 70 }, { score: 3, highRisk: false, fever: false, quality: false });
test('Age Invalid (string)', { age: 'invalid' }, { score: 1, highRisk: false, fever: false, quality: true });
test('Age Missing', { age: undefined }, { score: 1, highRisk: false, fever: false, quality: true });

test('Temp Normal (98.6)', { temperature: 98.6 }, { score: 2, highRisk: false, fever: false, quality: false });
test('Temp Low Fever (100.0)', { temperature: 100.0 }, { score: 3, highRisk: false, fever: true, quality: false });
test('Temp High Fever (102.0)', { temperature: 102.0 }, { score: 4, highRisk: false, fever: true, quality: false });
test('Temp Invalid', { temperature: 'bad' }, { score: 2, highRisk: false, fever: false, quality: true });

test('BP Normal', { blood_pressure: '110/70' }, { score: 2, highRisk: false, fever: false, quality: false });
test('BP Elevated (125/75)', { blood_pressure: '125/75' }, { score: 3, highRisk: false, fever: false, quality: false });
test('BP Stage 1 (135/85)', { blood_pressure: '135/85' }, { score: 4, highRisk: false, fever: false, quality: false });
test('BP Stage 2 (150/100)', { blood_pressure: '150/100' }, { score: 5, highRisk: true, fever: false, quality: false });
test('BP Mixed High (120/95)', { blood_pressure: '120/95' }, { score: 5, highRisk: true, fever: false, quality: false });
test('BP Invalid Format', { blood_pressure: '120' }, { score: 1, highRisk: false, fever: false, quality: true });

console.log('All tests passed!');
