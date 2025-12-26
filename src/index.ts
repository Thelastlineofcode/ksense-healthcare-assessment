import { fetchAllPatients, submitAssessment } from './api';
import { calculateRisk } from './scoring';
import { AssessmentSubmission } from './types';

async function main() {
    const isDryRun = process.argv.includes('--dry-run');

    try {
        const patients = await fetchAllPatients();

        const submission: AssessmentSubmission = {
            high_risk_patients: [],
            fever_patients: [],
            data_quality_issues: []
        };

        for (const patient of patients) {
            const result = calculateRisk(patient);

            if (result.has_data_quality_issues) {
                submission.data_quality_issues.push(result.patient_id);
            }

            if (result.is_high_risk) {
                submission.high_risk_patients.push(result.patient_id);
            }

            if (result.has_fever) {
                submission.fever_patients.push(result.patient_id);
            }
        }

        submission.high_risk_patients = [...new Set(submission.high_risk_patients)];
        submission.fever_patients = [...new Set(submission.fever_patients)];
        submission.data_quality_issues = [...new Set(submission.data_quality_issues)];

        if (isDryRun) {
            console.log('--- DRY RUN SUBMISSION PAYLOAD ---');
            console.log(JSON.stringify(submission, null, 2));
            console.log('----------------------------------');
        } else {
            await submitAssessment(submission);
        }

    } catch (error) {
        console.error('Fatal error in main process:', error);
        process.exit(1);
    }
}

main();
