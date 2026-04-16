package com.locationalarm.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AlarmController {

    @GetMapping("/api/alarms")
    public String getAlarms() {
        return "Protected alarms data";
    }
}