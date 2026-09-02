package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.HasTenancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HasTenancyRepository
        extends JpaRepository<HasTenancy, HasTenancy.HasTenancyId> {

    @Query("""
        SELECT h
        FROM HasTenancy h
        WHERE h.tenantId = :tenantId
        AND h.leaveDate IS NULL
    """)
    Optional<HasTenancy> findActiveTenancyByTenantId(
            @Param("tenantId") int tenantId
    );

    List<HasTenancy> findByTenantId(int tenantId);

    List<HasTenancy> findByPropertyId(int propertyId);
}