package com.civicpulse.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.civicpulse.entity.ComplaintStatus;

@Repository
public interface ComplaintStatusRepository extends JpaRepository<ComplaintStatus, Long> {
    List<ComplaintStatus> findByComplaintIdOrderByUpdatedTimeAsc(String complaintId);
}
