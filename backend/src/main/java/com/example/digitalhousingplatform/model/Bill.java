package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bill")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private int billId;

    @Column(name = "property_id")
    private int propertyId;

    private String type;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    private String month;

    @Column(name = "due_date")
    private LocalDate dueDate;

    public int getBillId() { return billId; }
    public void setBillId(int billId) { this.billId = billId; }
    public int getPropertyId() { return propertyId; }
    public void setPropertyId(int propertyId) { this.propertyId = propertyId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}