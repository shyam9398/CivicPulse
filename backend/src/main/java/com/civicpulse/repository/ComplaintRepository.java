package com.civicpulse.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.civicpulse.entity.Complaint;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    List<Complaint> findByUserIdOrderByCreatedTimeDesc(Long userId);
    List<Complaint> findAllByOrderByCreatedTimeDesc();
    
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
    
    long countByStatus(String status);

    Optional<Complaint> findFirstByOrderByIdDesc();
}
