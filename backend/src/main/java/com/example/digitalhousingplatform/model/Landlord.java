package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;

@Entity
@Table(name = "landlord")
public class Landlord {
    @Id
    @Column(name = "user_id")
    private int userId;

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
}