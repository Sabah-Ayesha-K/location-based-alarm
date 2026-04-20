package com.locationalarm.backend.repository;

import com.locationalarm.backend.entity.LocationHistory;
import com.locationalarm.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationHistoryRepository extends JpaRepository<LocationHistory, Long> {
    List<LocationHistory> findByUser(User user);
}