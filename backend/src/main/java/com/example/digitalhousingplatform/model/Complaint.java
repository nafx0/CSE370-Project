package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "complaint")
@IdClass(Complaint.ComplaintId.class)
public class Complaint {
    @Id
    @Column(name = "property_id")
    private int propertyId;

    @Id
    @Column(name = "complaint_id")
    private int complaintId;

    @Column(name = "tenant_id")
    private int tenantId;

    private String message;
    private String status;
    private LocalDate date;

    public int getPropertyId() { return propertyId; }
    public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
    public int getComplaintId() { return complaintId; }
    public void setComplaintId(int complaintId) { this.complaintId = complaintId; }
    public int getTenantId() { return tenantId; }
    public void setTenantId(int tenantId) { this.tenantId = tenantId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public static class ComplaintId implements Serializable {
        private int propertyId;
        private int complaintId;

        public ComplaintId() {}

        public int getPropertyId() { return propertyId; }
        public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
        public int getComplaintId() { return complaintId; }
        public void setComplaintId(int complaintId) { this.complaintId = complaintId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ComplaintId)) return false;
            ComplaintId that = (ComplaintId) o;
            return propertyId == that.propertyId && complaintId == that.complaintId;
        }

        @Override
        public int hashCode() { return Objects.hash(propertyId, complaintId); }
    }
}