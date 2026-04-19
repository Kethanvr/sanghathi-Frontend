# 2026-04-19-042 IAT 6th Semester CSV Ingest Execution and Verification

## 1. Update Summary
Executed actual database ingestion of the provided local CSV file (`iat sanghathi.csv`) for semester 6 using the new script workflow. Ingest apply completed successfully, rollback manifest was generated, and post-ingest verification confirmed semester-6 IAT data is present and queryable for mentees.

## 2. What Was Wrong
- The IAT data existed in a local wide-format CSV and was not yet loaded into the live MongoDB dataset for application consumption.
- Without ingestion, semester-6 mentee scorecard views would not reflect this bulk dataset.

## 3. What Was Fixed
- Ran dry-run ingest with semester filter 6.
- Ran apply ingest for the same file.
- Ingest result:
  - Planned writes: 216
  - Applied writes: 216
  - Failed writes: 0
  - Validation errors: 0
  - Unmatched USNs: 1 (`1CR24IS406` not found in `studentprofiles`)
- Verified post-ingest database state:
  - `iats` docs containing semester 6: 384
  - Sample check for USN `1CR23IS001`: semester 6 found with 4 subjects
  - Aggregate check: 216 semester-6 docs with exactly 4 subjects from this ingest structure
- Rollback safety available via generated manifest.

## 4. File Change Statistics
- Runtime script/report artifacts generated: 3
- Documentation files changed: 2
- Total files changed in this update: 5

## 5. Files Changed
### Runtime Artifacts
- sanghathi-Backend/logs/iat-ingest/iat-ingest-report-2026-04-19T03-03-21-842Z.json
- sanghathi-Backend/logs/iat-ingest/iat-ingest-manifest-2026-04-19T03-03-41-223Z.json
- sanghathi-Backend/logs/iat-ingest/iat-ingest-report-2026-04-19T03-03-41-223Z.json

### Documentation
- sanghathi-Frontend/docs/kethan/2026-04-19-042-iat6-csv-ingest-execution-and-verification.md
- sanghathi-Frontend/docs/kethan/README.md

## 6. Verification and Test Results
- Dry-run command executed successfully.
- Apply command executed successfully (`applied writes: 216`, `failed writes: 0`).
- Database verification queries executed successfully for semester-6 availability and sample user data presence.

## 7. Risks or Follow-up Items
- One USN (`1CR24IS406`) could not be ingested because no matching student profile exists in DB.
- If this student should exist, create/fix `studentprofiles` entry and re-run ingest for that USN row.
- Keep the generated ingest manifest until business validation is complete, so rollback can be applied instantly if needed.

## Further Improvements
- Add a small re-ingest mode to target specific unmatched USNs only.
- Add a post-apply API smoke-check command to auto-verify scorecard endpoint payload for sample mentees.
- Add a normalized USN cleanup utility for import pipelines to reduce unmatched rows caused by source inconsistencies.
