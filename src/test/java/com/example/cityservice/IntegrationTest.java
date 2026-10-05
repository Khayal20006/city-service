package com.example.cityservice;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base class for tests that need the full application context. The {@code test} profile
 * points at a separate database so production data is never touched.
 */
@SpringBootTest
@ActiveProfiles("test")
abstract class IntegrationTest {
}