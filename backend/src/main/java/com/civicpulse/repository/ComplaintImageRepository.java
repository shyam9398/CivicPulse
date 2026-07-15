package com.civicpulse.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.civicpulse.entity.ComplaintImage;

@Repository
public interface ComplaintImageRepository extends JpaRepository<ComplaintImage, Long> {
    List<ComplaintImage> findByComplaintId(String complaintId);
}
