SELECT name as term, 'Practices' as category, id as value FROM practices
UNION ALL
SELECT name as term, 'Referrers' as category, id as value FROM refDocs
UNION ALL
SELECT name as term, 'Patients' as category, id as value FROM patients
UNION ALL
SELECT word as name, 'DiagTags' as category, nentry as value FROM ts_stat('SELECT to_tsvector(''simple'', name) FROM Diagnoses')
UNION ALL
SELECT name as term, 'Diagnoses' as category, id as value FROM diagnoses
UNION ALL
SELECT name as term, 'Insurances' as category, id as value FROM insurances;
