package com.locationalarm.backend.controller;

import com.locationalarm.backend.dto.AlarmRequest;
import com.locationalarm.backend.entity.Alarm;
import com.locationalarm.backend.entity.User;
import com.locationalarm.backend.repository.AlarmRepository;
import com.locationalarm.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alarms")
public class AlarmController {

    private final AlarmRepository alarmRepository;
    private final UserRepository userRepository;

    public AlarmController(AlarmRepository alarmRepository, UserRepository userRepository) {
        this.alarmRepository = alarmRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createAlarm(@RequestBody AlarmRequest request, Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Alarm alarm = new Alarm();
        alarm.setTitle(request.getTitle());
        alarm.setLatitude(request.getLatitude());
        alarm.setLongitude(request.getLongitude());
        alarm.setRadius(request.getRadius());
        alarm.setActive(request.getActive() != null ? request.getActive() : true);
        alarm.setUser(user);
        alarm.setAddress(request.getAddress());

        alarmRepository.save(alarm);

        return ResponseEntity.ok("Alarm created successfully");
    }

    @GetMapping
    public ResponseEntity<?> getMyAlarms(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<Alarm> alarms = alarmRepository.findByUser(user);
        return ResponseEntity.ok(alarms);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAlarm(@PathVariable Long id,
                                         @RequestBody AlarmRequest request,
                                         Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Alarm alarm = alarmRepository.findByIdAndUser(id, user).orElse(null);
        if (alarm == null) {
            return ResponseEntity.status(404).body("Alarm not found or does not belong to user");
        }

        alarm.setTitle(request.getTitle());
        alarm.setLatitude(request.getLatitude());
        alarm.setLongitude(request.getLongitude());
        alarm.setRadius(request.getRadius());
        alarm.setActive(request.getActive() != null ? request.getActive() : alarm.getActive());
        alarm.setAddress(request.getAddress());

        alarmRepository.save(alarm);

        return ResponseEntity.ok("Alarm updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAlarm(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Alarm alarm = alarmRepository.findByIdAndUser(id, user).orElse(null);
        if (alarm == null) {
            return ResponseEntity.status(404).body("Alarm not found or does not belong to user");
        }

        alarmRepository.delete(alarm);

        return ResponseEntity.ok("Alarm deleted successfully");
    }
}