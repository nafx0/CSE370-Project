package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "announcement")
@IdClass(Announcement.AnnouncementId.class)
public class Announcement {
    @Id
    @Column(name = "property_id")
    private int propertyId;

    @Id
    @Column(name = "announcement_id")
    private int announcementId;

    @Column(name = "landlord_id")
    private int landlordId;

    private String message;
    private LocalDate date;

    public int getPropertyId() { return propertyId; }
    public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
    public int getAnnouncementId() { return announcementId; }
    public void setAnnouncementId(int announcementId) { this.announcementId = announcementId; }
    public int getLandlordId() { return landlordId; }
    public void setLandlordId(int landlordId) { this.landlordId = landlordId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public static class AnnouncementId implements Serializable {
        private int propertyId;
        private int announcementId;

        public AnnouncementId() {}

        public int getPropertyId() { return propertyId; }
        public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
        public int getAnnouncementId() { return announcementId; }
        public void setAnnouncementId(int announcementId) { this.announcementId = announcementId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof AnnouncementId)) return false;
            AnnouncementId that = (AnnouncementId) o;
            return propertyId == that.propertyId && announcementId == that.announcementId;
        }

        @Override
        public int hashCode() { return Objects.hash(propertyId, announcementId); }
    }
}