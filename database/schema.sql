CREATE TABLE `User` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `email` varchar(255),
  `phone` varchar(255),
  `role` varchar(255),
  `NID` varchar(255)
);

CREATE TABLE `Landlord` (
  `user_id` int PRIMARY KEY
);

CREATE TABLE `Tenant` (
  `user_id` int PRIMARY KEY
);

CREATE TABLE `Property` (
  `property_id` int PRIMARY KEY AUTO_INCREMENT,
  `landlord_id` int,
  `address` varchar(255),
  `area` varchar(255),
  `rent` decimal,
  `status` varchar(255),
  `posted_date` date,
  `expiry_date` date
);

CREATE TABLE `JoinCode` (
  `code_id` int PRIMARY KEY AUTO_INCREMENT,
  `property_id` int,
  `used_by_tenant_id` int,
  `code_value` varchar(255),
  `generated_date` date,
  `expiry_date` date,
  `status` varchar(255)
);

CREATE TABLE `HasTenancy` (
  `tenant_id` int,
  `property_id` int,
  `join_date` date,
  `leave_date` date,
  PRIMARY KEY (`tenant_id`, `property_id`, `join_date`)
);

CREATE TABLE `RatesTenant` (
  `rating_id` int PRIMARY KEY AUTO_INCREMENT,
  `landlord_id` int,
  `tenant_id` int,
  `rentTiming` varchar(255),
  `flatCondition` varchar(255),
  `comment` text
);

CREATE TABLE `RatesLandlord` (
  `rating_id` int PRIMARY KEY AUTO_INCREMENT,
  `tenant_id` int,
  `landlord_id` int,
  `rating` int,
  `comment` text
);

CREATE TABLE `Announcement` (
  `announcement_id` int,
  `property_id` int,
  `landlord_id` int,
  `message` text,
  `date` date,
  PRIMARY KEY (`property_id`, `announcement_id`)
);

CREATE TABLE `Complaint` (
  `complaint_id` int,
  `property_id` int,
  `tenant_id` int,
  `message` text,
  `status` varchar(255),
  `date` date,
  PRIMARY KEY (`property_id`, `complaint_id`)
);

CREATE TABLE `Bill` (
  `bill_id` int PRIMARY KEY AUTO_INCREMENT,
  `property_id` int,
  `type` varchar(255),
  `total_amount` decimal,
  `month` varchar(255),
  `due_date` date
);

CREATE TABLE `BillShare` (
  `share_id` int PRIMARY KEY AUTO_INCREMENT,
  `bill_id` int,
  `tenant_id` int,
  `share_amount` decimal,
  `paid_status` varchar(255),
  `paid_date` date
);

ALTER TABLE `Landlord` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`);
ALTER TABLE `Tenant` ADD FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`);
ALTER TABLE `Property` ADD FOREIGN KEY (`landlord_id`) REFERENCES `Landlord` (`user_id`);
ALTER TABLE `JoinCode` ADD FOREIGN KEY (`property_id`) REFERENCES `Property` (`property_id`);
ALTER TABLE `JoinCode` ADD FOREIGN KEY (`used_by_tenant_id`) REFERENCES `Tenant` (`user_id`);
ALTER TABLE `HasTenancy` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenant` (`user_id`);
ALTER TABLE `HasTenancy` ADD FOREIGN KEY (`property_id`) REFERENCES `Property` (`property_id`);
ALTER TABLE `RatesTenant` ADD FOREIGN KEY (`landlord_id`) REFERENCES `Landlord` (`user_id`);
ALTER TABLE `RatesTenant` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenant` (`user_id`);
ALTER TABLE `RatesLandlord` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenant` (`user_id`);
ALTER TABLE `RatesLandlord` ADD FOREIGN KEY (`landlord_id`) REFERENCES `Landlord` (`user_id`);
ALTER TABLE `Announcement` ADD FOREIGN KEY (`property_id`) REFERENCES `Property` (`property_id`);
ALTER TABLE `Announcement` ADD FOREIGN KEY (`landlord_id`) REFERENCES `Landlord` (`user_id`);
ALTER TABLE `Complaint` ADD FOREIGN KEY (`property_id`) REFERENCES `Property` (`property_id`);
ALTER TABLE `Complaint` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenant` (`user_id`);
ALTER TABLE `Bill` ADD FOREIGN KEY (`property_id`) REFERENCES `Property` (`property_id`);
ALTER TABLE `BillShare` ADD FOREIGN KEY (`bill_id`) REFERENCES `Bill` (`bill_id`);
ALTER TABLE `BillShare` ADD FOREIGN KEY (`tenant_id`) REFERENCES `Tenant` (`user_id`);
