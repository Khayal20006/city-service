package com.example.cityservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/** Serves uploaded complaint photos straight from the configured storage directory. */
@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    private final String location;

    public UploadResourceConfig(UploadStorageProperties properties) {
        this.location = Paths.get(properties.uploadDir()).toAbsolutePath().normalize().toUri().toString();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}