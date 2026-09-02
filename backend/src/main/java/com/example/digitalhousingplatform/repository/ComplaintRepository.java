package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Complaint.ComplaintId> {
}