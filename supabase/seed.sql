-- Optional seed data. Run AFTER signing up your admin user (so a profiles row exists).
-- Replace <ADMIN_UUID> with the id from `select id from auth.users where email = 'obi.anyanwu@yahoo.com';`

insert into properties (slug, title, description, price, listing_type, property_type, status, bedrooms, bathrooms, area, address, latitude, longitude, amenities, featured, created_by)
values
('4-bed-detached-banana-island',
 '4-Bedroom Detached Duplex, Banana Island',
 'A rare fully-detached duplex sitting on 900sqm in the heart of Banana Island. Fitted kitchen, boys quarters, 24-hour serviced estate.',
 950000000, 'sale', 'detached_house', 'available',
 4, 5, 'Banana Island', '11 Ocean Parade, Banana Island, Ikoyi', 6.4413, 3.4499,
 array['Fitted kitchen','BQ','Swimming pool','24hr power','Serviced estate','CCTV'], true,
 (select id from auth.users where email = (select value from public.app_settings where key = 'admin_email') limit 1)),

('3-bed-penthouse-vi',
 '3-Bedroom Penthouse, Victoria Island',
 'Ocean-view penthouse with private terrace, gym, and pool access. Serviced apartment on Ahmadu Bello Way.',
 45000000, 'rent', 'penthouse', 'available',
 3, 4, 'Victoria Island', 'Ahmadu Bello Way, VI', 6.4281, 3.4219,
 array['Ocean view','Gym','Pool','24hr power','Elevator'], true,
 (select id from auth.users where email = (select value from public.app_settings where key = 'admin_email') limit 1)),

('900sqm-land-ikoyi',
 '900sqm Bare Land, Old Ikoyi',
 'Prime residential plot in Old Ikoyi. C of O available. Suitable for private residence or boutique development.',
 750000000, 'sale', 'land', 'available',
 null, null, 'Ikoyi', 'Bourdillon Road, Old Ikoyi', 6.4531, 3.4381,
 array['C of O','Dry land','Fenced'], false,
 (select id from auth.users where email = (select value from public.app_settings where key = 'admin_email') limit 1)),

('filling-station-lekki',
 'Filling Station on Lekki-Epe Expressway',
 'Operational filling station with 4 pumps, mini-mart, and quarters. Fully licensed with DPR.',
 1200000000, 'sale', 'filling_station', 'available',
 null, null, 'Lekki', 'Lekki-Epe Expressway, Ajah', 6.4667, 3.5833,
 array['DPR licensed','4 pumps','Mini-mart','Attendant quarters'], false,
 (select id from auth.users where email = (select value from public.app_settings where key = 'admin_email') limit 1)),

('office-space-ikoyi',
 '1,200sqm Commercial Office, Ikoyi',
 'Grade-A office space on Awolowo Road with dedicated parking, generator, and lift access.',
 180000000, 'rent', 'commercial', 'available',
 null, 6, 'Ikoyi', 'Awolowo Road, Ikoyi', 6.4489, 3.4322,
 array['Lift','Parking','24hr power','Conference rooms'], false,
 (select id from auth.users where email = (select value from public.app_settings where key = 'admin_email') limit 1)),

('2-bed-serviced-lekki',
 '2-Bedroom Serviced Apartment, Lekki Phase 1',
 'Newly built serviced apartment with gym, pool, and 24-hour concierge. Perfect for young professionals.',
 15000000, 'rent', 'serviced_apartment', 'available',
 2, 3, 'Lekki', 'Freedom Way, Lekki Phase 1', 6.4396, 3.4696,
 array['Gym','Pool','Concierge','24hr power','Fitted kitchen'], true,
 (select id from auth.users where email = (select value from public.app_settings where key = 'admin_email') limit 1));
