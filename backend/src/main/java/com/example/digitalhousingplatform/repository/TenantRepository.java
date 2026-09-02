package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, Integer> {
}