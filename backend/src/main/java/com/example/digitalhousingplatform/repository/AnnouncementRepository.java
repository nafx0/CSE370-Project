package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Announcement.AnnouncementId> {
}