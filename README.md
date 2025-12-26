# Ksense Healthcare Assessment

A patient risk scoring system that analyzes healthcare data and categorizes patients based on vital signs.

## Features

- **Risk Scoring**: Calculates patient risk scores based on age, blood pressure, and temperature
- **Data Quality Detection**: Identifies and flags patients with invalid or missing data
- **Alert Lists**: Categorizes patients into high-risk, fever, and data quality issue groups
- **Robust API Integration**: Handles rate limiting, pagination, and intermittent failures with retry logic

## Assessment Results

**Score: 95%** (2nd attempt)
- ✅ Fever patients: 9/9 (100%)
- ✅ Data quality issues: 8/8 (100%)
- 🔄 High-risk patients: 20/20 correct (2 false positives)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your API key:

```
API_KEY=your-api-key-here
BASE_URL=https://assessment.ksensetech.com/api
```

## Usage

Run the assessment:
```bash
npm start
```

Run in dry-run mode (no API submission):
```bash
npm start -- --dry-run
```

Run unit tests:
```bash
npm test
```

## Project Structure

```
src/
├── types.ts        # TypeScript interfaces
├── api.ts          # API client with retry logic
├── scoring.ts      # Risk scoring algorithm
├── test_scoring.ts # Unit tests
└── index.ts        # Main application
```

## Scoring Algorithm

### Blood Pressure Risk
- Normal (sys <120 AND dia <80): 1 point
- Elevated (sys 120-129 AND dia <80): 2 points
- Stage 1 (sys 130-139 OR dia 80-89): 3 points
- Stage 2 (sys ≥140 OR dia ≥90): 4 points
- Invalid/Missing: 0 points + quality flag

### Temperature Risk
- Normal (≤99.5°F): 0 points
- Low Fever (99.6-100.9°F): 1 point
- High Fever (≥101.0°F): 2 points
- Invalid/Missing: 0 points + quality flag

### Age Risk
- Under 40: 1 point
- 40-65 (inclusive): 1 point
- Over 65: 2 points
- Invalid/Missing: 0 points + quality flag

### Alert Thresholds
- **High-Risk**: Total score > 4
- **Fever**: Temperature ≥ 99.6°F
- **Data Quality Issues**: Any invalid/missing vital signs

## Technical Highlights

- TypeScript for type safety
- Axios with automatic retry logic for API failures
- Exponential backoff for rate limiting (429 errors)
- Comprehensive unit test coverage (15 test cases)
- Handles edge cases: mixed BP stages, invalid data, null values
