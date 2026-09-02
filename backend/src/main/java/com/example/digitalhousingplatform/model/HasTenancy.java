package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "hastenancy")
@IdClass(HasTenancy.HasTenancyId.class)
public class HasTenancy {
    @Id
    @Column(name = "tenant_id")
    private int tenantId;

    @Id
    @Column(name = "property_id")
    private int propertyId;

    @Id
    @Column(name = "join_date")
    private LocalDate joinDate;

    @Column(name = "leave_date")
    private LocalDate leaveDate;

    public int getTenantId() { return tenantId; }
    public void setTenantId(int tenantId) { this.tenantId = tenantId; }
    public int getPropertyId() { return propertyId; }
    public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }
    public LocalDate getLeaveDate() { return leaveDate; }
    public void setLeaveDate(LocalDate leaveDate) { this.leaveDate = leaveDate; }

    public static class HasTenancyId implements Serializable {
        private int tenantId;
        private int propertyId;
        private LocalDate joinDate;

        public HasTenancyId() {}

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof HasTenancyId)) return false;
            HasTenancyId that = (HasTenancyId) o;
            return tenantId == that.tenantId && propertyId == that.propertyId && Objects.equals(joinDate, that.joinDate);
        }

        @Override
        public int hashCode() { return Objects.hash(tenantId, propertyId, joinDate); }
    }
}