-- Human-readable, monotonically increasing complaint reference numbers (CS-<year>-<number>).
-- A sequence is used instead of the row id so the number can be assigned in the same
-- INSERT that creates the complaint, before the id exists.
CREATE SEQUENCE IF NOT EXISTS complaint_reference_seq START WITH 1 INCREMENT BY 1;

-- Keep already-inserted rows consistent with the sequence starting point.
SELECT setval('complaint_reference_seq',
              GREATEST(COALESCE((SELECT MAX(id) FROM complaints), 0) + 1, 1),
              false);