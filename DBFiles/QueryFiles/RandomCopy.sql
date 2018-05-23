\COPY (SELECT p.id as PatientID, p.clinicdate, p.isdirect, p.wasscreened, p.screendate, p.issurgical, p.appscore, p.complscore, p.valuescore, p.location, diag.name as Diagnosis, d.name as Referring_Doc, pr.name as Practice, ins.name as Insurance FROM patients as p LEFT JOIN refDocs as d  ON p.refdoc_id = d.id LEFT JOIN practiceDocPivot as piv  ON piv.refdoc_id = p.refdoc_id LEFT JOIN practices as pr  ON piv.practice_id = pr.id LEFT JOIN diagnoses as diag  ON p.diagnosis_id = diag.id LEFT JOIN insurances as ins  ON p.insurance_id = ins.id Order By p.clinicdate desc) to 'patientData.csv' WITH CSV HEADER DELIMITER ',' QUOTE '"';

-- select count(p.*) as NumPatients, prac.name as Practice
-- from patients as p 
-- join refdocs as d 
--   on p.refdoc_id = d.id 
-- join practicesdocspivot as pd 
--   on d.id = pd.refdoc_id
-- join practices as prac 
--   on pd.practice_id = prac.id
-- group by prac.name
-- order by numPatients desc 
-- limit(10);