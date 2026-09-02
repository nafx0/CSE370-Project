package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.Property;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<Property, Integer> {
}