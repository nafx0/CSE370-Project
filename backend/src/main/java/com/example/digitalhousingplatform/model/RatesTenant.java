package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ratestenant")
public class RatesTenant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    private int ratingId;

    @Column(name = "landlord_id")
    private int landlordId;

    @Column(name = "tenant_id")
    private int tenantId;

    @Column(name = "rentTiming")
    private String rentTiming;

    @Column(name = "flatCondition")
    private String flatCondition;

    private String comment;

    public int getRatingId() { return ratingId; }
    public void setRatingId(int ratingId) { this.ratingId = ratingId; }
    public int getLandlordId() { return landlordId; }
    public void setLandlordId(int landlordId) { this.landlordId = landlordId; }
    public int getTenantId() { return tenantId; }
    public void setTenantId(int tenantId) { this.tenantId = tenantId; }
    public String getRentTiming() { return rentTiming; }
    public void setRentTiming(String rentTiming) { this.rentTiming = rentTiming; }
    public String getFlatCondition() { return flatCondition; }
    public void setFlatCondition(String flatCondition) { this.flatCondition = flatCondition; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}