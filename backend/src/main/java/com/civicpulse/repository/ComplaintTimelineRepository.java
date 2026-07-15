package com.civicpulse.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.civicpulse.entity.ComplaintTimeline;

@Repository
public interface ComplaintTimelineRepository extends JpaRepository<ComplaintTimeline, Long> {
    List<ComplaintTimeline> findByComplaintIdOrderByUpdatedTimeAsc(String complaintId);
}
