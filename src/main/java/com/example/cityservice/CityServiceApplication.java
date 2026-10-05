package com.example.cityservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CityServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CityServiceApplication.class, args);
    }
}