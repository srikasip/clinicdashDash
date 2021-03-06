SELECT 
  p.id, p.name, p.clinicdate, p.isdirect, p.wasscreened, p.screendate, p.issurgical, p.appscore, 
  p.complscore, p.valuescore, p.location, 
  diag.name as Diagnosis, 
  d.name as Referring_Doc, 
  pr.name as Practice, 
  ins.name as Insurance, ins.is_Medicaid as is_Medicaid
FROM 
  patients as p 
  LEFT JOIN refDocs as d 
    ON p.refdoc_id = d.id
  LEFT JOIN practicesDocsPivot as piv 
    ON piv.refdoc_id = p.refdoc_id
  LEFT JOIN practices as pr 
    ON piv.practice_id = pr.id
  LEFT JOIN diagnoses as diag 
    ON p.diagnosis_id = diag.id
  LEFT JOIN insurances as ins 
    ON p.insurance_id = ins.id
WHERE p.user_id = '||user_id||'
Order By p.clinicdate desc;