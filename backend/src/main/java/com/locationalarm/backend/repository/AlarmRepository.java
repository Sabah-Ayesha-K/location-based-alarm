package com.locationalarm.backend.repository;

import com.locationalarm.backend.entity.Alarm;
import com.locationalarm.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    List<Alarm> findByUser(User user);
    Optional<Alarm> findByIdAndUser(Long id, User user);
}