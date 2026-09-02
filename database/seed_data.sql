

INSERT INTO `user` (name, email, phone, role, NID) VALUES
('Kamal Hossain', 'kamal.hossain@gmail.com', '01711000001', 'landlord', '1990010100001'),
('Nasrin Akter', 'nasrin.akter@gmail.com', '01711000002', 'landlord', '1988020200002'),
('Rafiqul Islam', 'rafiqul.islam@gmail.com', '01711000003', 'landlord', '1985030300003'),
('Shirin Sultana', 'shirin.sultana@gmail.com', '01711000004', 'landlord', '1992040400004'),
('Habibur Rahman', 'habibur.rahman@gmail.com', '01711000005', 'landlord', '1980050500005'),
('Tanvir Ahmed', 'tanvir.ahmed@gmail.com', '01811000006', 'tenant', '1998060600006'),
('Mim Sultana', 'mim.sultana@gmail.com', '01811000007', 'tenant', '1999070700007'),
('Arif Chowdhury', 'arif.chowdhury@gmail.com', '01811000008', 'tenant', '1997080800008'),
('Farhana Yasmin', 'farhana.yasmin@gmail.com', '01811000009', 'tenant', '2000090900009'),
('Shakil Ahmed', 'shakil.ahmed@gmail.com', '01811000010', 'tenant', '1996101000010'),
('Nusrat Jahan', 'nusrat.jahan@gmail.com', '01811000011', 'tenant', '1998111100011'),
('Imran Kabir', 'imran.kabir@gmail.com', '01811000012', 'tenant', '1995121200012'),
('Rima Akter', 'rima.akter@gmail.com', '01811000013', 'tenant', '1999010100013'),
('Sabbir Hossain', 'sabbir.hossain@gmail.com', '01811000014', 'tenant', '1997020200014'),
('Tasnim Ara', 'tasnim.ara@gmail.com', '01811000015', 'tenant', '2001030300015');

INSERT INTO `landlord` (user_id) VALUES (1), (2), (3), (4), (5);

INSERT INTO `tenant` (user_id) VALUES (6), (7), (8), (9), (10), (11), (12), (13), (14), (15);

INSERT INTO `property` (landlord_id, address, area, rent, status, posted_date, expiry_date) VALUES
(1, 'House 12, Road 5, Mohammadpur', 'Mohammadpur', 12000, 'available', '2026-06-01', '2026-09-01'),
(1, 'House 3, Road 2, Mirpur 10', 'Mirpur', 9500, 'occupied', '2026-05-15', '2026-08-15'),
(2, 'House 45, Road 11, Dhanmondi', 'Dhanmondi', 18000, 'available', '2026-07-01', '2026-10-01'),
(3, 'House 7, Lane 3, Bashundhara', 'Bashundhara', 22000, 'occupied', '2026-04-10', '2026-07-10'),
(3, 'House 21, Road 9, Uttara Sector 7', 'Uttara', 15000, 'available', '2026-07-10', '2026-10-10'),
(4, 'House 5, Road 1, Banasree', 'Banasree', 11000, 'occupied', '2026-03-20', '2026-06-20'),
(5, 'House 30, Road 14, Khilgaon', 'Khilgaon', 10500, 'available', '2026-08-01', '2026-11-01'),
(5, 'House 8, Road 4, Rampura', 'Rampura', 13000, 'occupied', '2026-02-05', '2026-05-05');

INSERT INTO `joincode` (property_id, used_by_tenant_id, code_value, generated_date, expiry_date, status) VALUES
(1, NULL, 'MHP-2026-A1B2', '2026-06-01', '2026-09-01', 'active'),
(2, 6, 'MPR-2026-C3D4', '2026-05-15', '2026-08-15', 'used'),
(3, NULL, 'DHM-2026-E5F6', '2026-07-01', '2026-10-01', 'active'),
(4, 7, 'BSN-2026-G7H8', '2026-04-10', '2026-07-10', 'used'),
(5, NULL, 'UTR-2026-I9J0', '2026-07-10', '2026-10-10', 'active'),
(6, 8, 'BNS-2026-K1L2', '2026-03-20', '2026-06-20', 'used'),
(7, NULL, 'KHG-2026-M3N4', '2026-08-01', '2026-11-01', 'active'),
(8, 9, 'RMP-2026-O5P6', '2026-02-05', '2026-05-05', 'used');

INSERT INTO `hastenancy` (tenant_id, property_id, join_date, leave_date) VALUES
(6, 2, '2026-05-16', NULL),
(7, 4, '2026-04-11', NULL),
(8, 6, '2026-03-21', NULL),
(9, 8, '2026-02-06', NULL),
(10, 2, '2026-01-01', '2026-04-30');

INSERT INTO `ratestenant` (landlord_id, tenant_id, rentTiming, flatCondition, comment) VALUES
(1, 6, 'always on time', 'kept clean', 'Very reliable tenant, no issues.'),
(3, 7, 'occasionally late', 'good condition', 'Pays a few days late sometimes but keeps the flat well.'),
(4, 8, 'always on time', 'excellent', 'Best tenant so far, highly recommended.'),
(5, 9, 'late frequently', 'average', 'Rent often delayed by a week.');

INSERT INTO `rateslandlord` (tenant_id, landlord_id, rating, comment) VALUES
(6, 1, 4, 'Responsive and fair landlord.'),
(7, 3, 5, 'Very helpful, fixed issues quickly.'),
(8, 4, 3, 'Slow to respond to maintenance requests.'),
(9, 5, 4, 'Good landlord overall.');

INSERT INTO `announcement` (property_id, announcement_id, landlord_id, message, date) VALUES
(2, 1, 1, 'Water supply will be off on Friday from 10am-2pm for maintenance.', '2026-08-10'),
(4, 1, 3, 'Monthly building meeting this Saturday at 6pm in the lobby.', '2026-08-12'),
(6, 1, 4, 'New security guard starting Monday, please cooperate.', '2026-08-05'),
(8, 1, 5, 'Rent due date reminder: please pay by the 5th of each month.', '2026-08-01');

INSERT INTO `complaint` (property_id, complaint_id, tenant_id, message, status, date) VALUES
(2, 1, 6, 'Kitchen faucet has been leaking for a week.', 'pending', '2026-08-08'),
(4, 1, 7, 'Neighbor upstairs is very noisy at night.', 'resolved', '2026-07-28'),
(6, 1, 8, 'Main gate lock is broken, security concern.', 'in progress', '2026-08-14'),
(8, 1, 9, 'No hot water since yesterday.', 'pending', '2026-08-15');

INSERT INTO `bill` (property_id, type, total_amount, month, due_date) VALUES
(2, 'electricity', 3200, 'July 2026', '2026-08-05'),
(2, 'water', 800, 'July 2026', '2026-08-05'),
(4, 'electricity', 4500, 'July 2026', '2026-08-05'),
(4, 'gas', 1200, 'July 2026', '2026-08-05'),
(6, 'electricity', 2800, 'July 2026', '2026-08-05'),
(8, 'electricity', 3600, 'July 2026', '2026-08-05'),
(8, 'water', 900, 'July 2026', '2026-08-05');

INSERT INTO `billshare` (bill_id, tenant_id, share_amount, paid_status, paid_date) VALUES
(1, 6, 3200, 'paid', '2026-08-03'),
(2, 6, 800, 'paid', '2026-08-03'),
(3, 7, 4500, 'unpaid', NULL),
(4, 7, 1200, 'unpaid', NULL),
(5, 8, 2800, 'paid', '2026-08-04'),
(6, 9, 3600, 'unpaid', NULL),
(7, 9, 900, 'unpaid', NULL);
