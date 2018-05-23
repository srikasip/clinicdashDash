ALTER TABLE addresses 
  ADD COLUMN zip1 varchar(5),
  ADD COLUMN zip2 varchar(5);


UPDATE addresses
  SET zip1 = LEFT(zip, 5),
      zip2 = RIGHT(zip, 4);

ALTER TABLE addresses
  ADD COLUMN lat numeric,
  ADD COLUMN long numeric;

UPDATE addresses
  SET lat = CASE WHEN z.lat = '' THEN 0 ELSE cast(z.lat as NUMERIC) END,
       long = CASE WHEN z.long = '' THEN 0 ELSE cast(z.long as NUMERIC) END
  FROM zipcodes as z where z.zip = zip1 and z.loc_type='PRIMARY';


--update the ones with some reasonable lat-longs from the same city.
UPDATE addresses
  SET lat = CASE WHEN z.lat = '' THEN 0 ELSE cast(z.lat as NUMERIC) END,
      long = CASE WHEN z.long = '' THEN 0 ELSE cast(z.long as NUMERIC) END
  FROM zipcodes as z 
  WHERE z.state = addresses.state 
  and z.city = addresses.city 
  and z.loc_type='PRIMARY'
  and z.lat <> '' and z.long <> ''
  and addresses.lat = 0 and addresses.long = 0;