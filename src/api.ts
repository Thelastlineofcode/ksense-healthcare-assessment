import axios from 'axios';
import axiosRetry from 'axios-retry';
import { Patient, PatientResponse } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || 'https://assessment.ksensetech.com/api';

if (!API_KEY) {
    throw new Error('API_KEY environment variable is required. Please set it in .env file.');
}

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
    },
});

axiosRetry(client, {
    retries: 5,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            error.response?.status === 429 ||
            error.response?.status === 500 ||
            error.response?.status === 503
        );
    },
});

export async function fetchAllPatients(): Promise<Patient[]> {
    let allPatients: Patient[] = [];
    let page = 1;
    let hasNext = true;

    console.log('Starting to fetch patients...');

    while (hasNext) {
        try {
            console.log(`Fetching page ${page}...`);
            const response = await client.get<PatientResponse>('/patients', {
                params: { page, limit: 20 },
            });

            const { data, pagination } = response.data;

            if (Array.isArray(data)) {
                allPatients = allPatients.concat(data);
            } else {
                console.warn(`Warning: Page ${page} returned no data array.`);
            }

            hasNext = pagination.hasNext;
            page++;
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            throw error;
        }
    }

    console.log(`Finished fetching. Total patients: ${allPatients.length}`);
    return allPatients;
}

export async function submitAssessment(payload: any) {
    console.log('Submitting assessment...');
    try {
        const response = await client.post('/submit-assessment', payload);
        console.log('Submission successful!');
        console.log(JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('Submission failed:', error.response?.data || error.message);
        throw error;
    }
}
