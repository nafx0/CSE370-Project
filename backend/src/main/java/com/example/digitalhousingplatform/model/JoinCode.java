package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "joincode")
public class JoinCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_id")
    private int codeId;

    @Column(name = "property_id")
    private int propertyId;

    @Column(name = "used_by_tenant_id")
    private Integer usedByTenantId;

    @Column(name = "code_value")
    private String codeValue;

    @Column(name = "generated_date")
    private LocalDate generatedDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    private String status;

    public int getCodeId() { return codeId; }
    public void setCodeId(int codeId) { this.codeId = codeId; }
    public int getPropertyId() { return propertyId; }
    public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
    public Integer getUsedByTenantId() { return usedByTenantId; }
    public void setUsedByTenantId(Integer usedByTenantId) { this.usedByTenantId = usedByTenantId; }
    public String getCodeValue() { return codeValue; }
    public void setCodeValue(String codeValue) { this.codeValue = codeValue; }
    public LocalDate getGeneratedDate() { return generatedDate; }
    public void setGeneratedDate(LocalDate generatedDate) { this.generatedDate = generatedDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}