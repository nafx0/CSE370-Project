package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.Landlord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LandlordRepository extends JpaRepository<Landlord, Integer> {
}