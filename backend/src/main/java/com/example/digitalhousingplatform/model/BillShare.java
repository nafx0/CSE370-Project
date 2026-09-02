package com.example.digitalhousingplatform.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "billshare")
public class BillShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "share_id")
    private int shareId;

    @Column(name = "bill_id")
    private int billId;

    @Column(name = "tenant_id")
    private int tenantId;

    @Column(name = "share_amount")
    private BigDecimal shareAmount;

    @Column(name = "paid_status")
    private String paidStatus;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "transaction_id")
    private String transactionId;

    public int getShareId() { return shareId; }
    public void setShareId(int shareId) { this.shareId = shareId; }
    public int getBillId() { return billId; }
    public void setBillId(int billId) { this.billId = billId; }
    public int getTenantId() { return tenantId; }
    public void setTenantId(int tenantId) { this.tenantId = tenantId; }
    public BigDecimal getShareAmount() { return shareAmount; }
    public void setShareAmount(BigDecimal shareAmount) { this.shareAmount = shareAmount; }
    public String getPaidStatus() { return paidStatus; }
    public void setPaidStatus(String paidStatus) { this.paidStatus = paidStatus; }
    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}