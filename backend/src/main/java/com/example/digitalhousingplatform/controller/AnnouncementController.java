package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.Announcement;
import com.example.digitalhousingplatform.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @GetMapping
    public List<Announcement> listAnnouncements() {
        return announcementRepository.findAll();
    }

    @PostMapping
    public Announcement addAnnouncement(@RequestBody Announcement announcement) {
        int nextId = announcementRepository.findAll().stream()
                .filter(a -> a.getPropertyId() == announcement.getPropertyId())
                .mapToInt(Announcement::getAnnouncementId)
                .max()
                .orElse(0) + 1;
        announcement.setAnnouncementId(nextId);
        announcement.setDate(LocalDate.now());
        return announcementRepository.save(announcement);
    }

    @PutMapping("/{propertyId}/{announcementId}")
    public ResponseEntity<Announcement> updateAnnouncement(@PathVariable int propertyId, @PathVariable int announcementId, @RequestBody Announcement announcement) {
        Announcement.AnnouncementId id = new Announcement.AnnouncementId();
        id.setPropertyId(propertyId);
        id.setAnnouncementId(announcementId);
        if (!announcementRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        announcement.setPropertyId(propertyId);
        announcement.setAnnouncementId(announcementId);
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @DeleteMapping("/{propertyId}/{announcementId}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable int propertyId, @PathVariable int announcementId) {
        Announcement.AnnouncementId id = new Announcement.AnnouncementId();
        id.setPropertyId(propertyId);
        id.setAnnouncementId(announcementId);
        announcementRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}