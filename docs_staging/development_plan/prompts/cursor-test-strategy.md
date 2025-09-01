# Cursor Test Strategy and Development Guidance

## 1. Introduction

This document provides comprehensive guidance for working with Cursor to implement robust testing strategies and detailed code development for the Architech project. Cursor excels at writing comprehensive tests, implementing complex business logic, and refactoring code for better maintainability. This guidance ensures that Cursor's capabilities are leveraged effectively to build a reliable, well-tested, and maintainable codebase.

## 2. Core Principles for Cursor Interaction

*   **Test-Driven Development (TDD):** Encourage Cursor to write tests before implementing functionality when appropriate.
*   **Comprehensive Coverage:** Aim for high test coverage while focusing on meaningful tests rather than just coverage metrics.
*   **Code Quality:** Emphasize clean, readable, and maintainable code with proper documentation.
*   **Error Handling:** Implement robust error handling and edge case management.
*   **Performance Awareness:** Consider performance implications in all implementations.

## 3. Testing Strategy Framework

### 3.1. Unit Testing Approach

**Template for Unit Test Requests:**
```
Write comprehensive unit tests for [function/class/module] that:
- Test all public methods and their expected behaviors
- Cover edge cases and error conditions
- Mock external dependencies appropriately
- Achieve >90% code coverage for critical paths
- Include performance assertions where relevant
- Follow AAA pattern (Arrange, Act, Assert)
```

**Example:**
```
Write comprehensive unit tests for the SimulationEngine class that:
- Test event queue operations (add, remove, peek)
- Verify correct simulation clock advancement
- Test component event dispatching with various event types
- Cover error scenarios like invalid events or component failures
- Mock the event publisher to verify event emission
- Include performance tests ensuring >1000 events/second processing
- Test concurrent event processing if applicable
```

### 3.2. Integration Testing Approach

**Template for Integration Test Requests:**
```
Create integration tests for [service/module] that:
- Test interactions with [specific dependencies]
- Verify data flow between components
- Test error propagation and handling
- Include database transactions and rollbacks
- Test API endpoints with realistic payloads
- Verify authentication and authorization flows
```

**Example:**
```
Create integration tests for the Design Service that:
- Test complete CRUD operations with PostgreSQL database
- Verify design versioning functionality with multiple versions
- Test component and connection relationship integrity
- Include error scenarios like database connection failures
- Test API endpoints with authentication headers
- Verify proper JSON serialization/deserialization of complex designs
```

### 3.3. End-to-End Testing Approach

**Template for E2E Test Requests:**
```
Implement end-to-end tests for [user workflow] that:
- Simulate realistic user interactions
- Test the complete flow from frontend to backend
- Include error scenarios and recovery
- Verify data persistence across the workflow
- Test performance under realistic conditions
```

**Example:**
```
Implement end-to-end tests for the simulation workflow that:
- Create a user account and authenticate
- Create a new project and design with multiple components
- Start a simulation and verify real-time updates via WebSocket
- Monitor simulation progress and verify metrics accuracy
- Stop the simulation and verify final results
- Test error scenarios like network interruptions during simulation
```

## 4. Code Implementation Guidance

### 4.1. Backend Service Development

**Template for Service Implementation:**
```
Implement [service name] with the following requirements:
- Follow FastAPI best practices with proper dependency injection
- Implement comprehensive error handling with custom exceptions
- Use Pydantic models for request/response validation
- Include proper logging with structured log messages
- Implement database operations with proper transaction management
- Add authentication and authorization middleware
- Include rate limiting and input validation
- Follow the repository pattern for data access
```

**Example:**
```
Implement the Observability Data Service with the following requirements:
- Create FastAPI endpoints for querying logs, metrics, and traces
- Implement Kafka consumer for ingesting simulation events
- Use SQLAlchemy with async support for database operations
- Create Pydantic schemas for log entries, metrics, and trace spans
- Implement time-based partitioning for efficient data retrieval
- Add filtering and pagination for large datasets
- Include proper error handling for Kafka connection issues
- Implement caching for frequently accessed data
```

### 4.2. Database Schema and Operations

**Template for Database Implementation:**
```
Design and implement database schema for [entity] that:
- Follows normalization principles while optimizing for query performance
- Includes proper indexes for common query patterns
- Implements foreign key constraints and cascading deletes
- Uses appropriate data types for all fields
- Includes audit fields (created_at, updated_at, created_by)
- Supports soft deletes where appropriate
- Includes database migration scripts
```

**Example:**
```
Design and implement database schema for simulation observability data that:
- Creates tables for logs, metrics, and traces with proper relationships
- Implements time-based partitioning for efficient data management
- Includes indexes on timestamp, component_id, and simulation_id fields
- Uses JSONB for flexible metadata storage in PostgreSQL
- Implements proper foreign key relationships to simulations table
- Includes retention policies for automatic data cleanup
- Creates views for common query patterns
```

### 4.3. API Client Development

**Template for API Client Implementation:**
```
Create an API client for [service] that:
- Implements all CRUD operations with proper error handling
- Uses async/await for non-blocking operations
- Includes retry logic with exponential backoff
- Implements request/response logging for debugging
- Handles authentication token management
- Includes proper timeout configurations
- Provides typed responses using Pydantic models
```

**Example:**
```
Create an API client for the Design Service that:
- Implements methods for design CRUD operations
- Handles component and connection management within designs
- Includes design versioning operations
- Uses httpx for async HTTP requests with connection pooling
- Implements JWT token refresh logic
- Includes comprehensive error handling for network issues
- Provides strongly typed responses for all operations
```

## 5. Performance Optimization Guidance

### 5.1. Database Performance

**Template for Database Optimization:**
```
Optimize database performance for [specific use case] by:
- Analyzing query execution plans and identifying bottlenecks
- Creating appropriate indexes for common query patterns
- Implementing database connection pooling
- Using prepared statements to prevent SQL injection
- Implementing query result caching where appropriate
- Optimizing N+1 query problems with eager loading
```

**Example:**
```
Optimize database performance for simulation data queries by:
- Creating composite indexes on (simulation_id, timestamp) for time-series data
- Implementing connection pooling with SQLAlchemy async engine
- Using bulk insert operations for high-volume event ingestion
- Creating materialized views for common aggregation queries
- Implementing query result caching with Redis for frequently accessed data
- Optimizing JOIN operations between simulations and observability tables
```

### 5.2. API Performance

**Template for API Optimization:**
```
Optimize API performance for [endpoint/service] by:
- Implementing response caching with appropriate cache headers
- Using pagination for large result sets
- Implementing request/response compression
- Optimizing serialization/deserialization operations
- Adding performance monitoring and alerting
- Implementing rate limiting to prevent abuse
```

**Example:**
```
Optimize API performance for design retrieval endpoints by:
- Implementing Redis caching for frequently accessed designs
- Using pagination with cursor-based navigation for large lists
- Implementing gzip compression for large design payloads
- Optimizing JSON serialization with orjson for better performance
- Adding response time monitoring with Prometheus metrics
- Implementing rate limiting based on user authentication level
```

## 6. Error Handling and Resilience

### 6.1. Exception Handling Strategy

**Template for Error Handling:**
```
Implement comprehensive error handling that:
- Creates custom exception classes for different error types
- Implements proper error logging with context information
- Provides user-friendly error messages for client applications
- Includes error recovery mechanisms where possible
- Implements circuit breaker patterns for external dependencies
- Adds proper HTTP status codes for different error scenarios
```

**Example:**
```
Implement comprehensive error handling for the Simulation Engine that:
- Creates custom exceptions for SimulationError, ComponentError, ConfigurationError
- Logs errors with simulation context (simulation_id, component_id, timestamp)
- Implements graceful degradation when components fail during simulation
- Includes retry logic for transient failures in event processing
- Implements circuit breaker for external service dependencies
- Provides detailed error responses for debugging while hiding sensitive information
```

### 6.2. Resilience Patterns

**Template for Resilience Implementation:**
```
Implement resilience patterns for [service/component] that:
- Add retry logic with exponential backoff for transient failures
- Implement circuit breaker pattern for external dependencies
- Add timeout configurations for all external calls
- Implement graceful degradation when dependencies are unavailable
- Include health check endpoints for monitoring
- Add bulkhead pattern to isolate critical resources
```

**Example:**
```
Implement resilience patterns for the Simulation Orchestration Service that:
- Add retry logic for Design Service API calls with exponential backoff
- Implement circuit breaker for Simulation Engine communication
- Add timeout configurations for WebSocket connections and API calls
- Implement graceful degradation when observability services are down
- Include health check endpoints that verify all dependencies
- Add bulkhead pattern to separate simulation management from real-time updates
```

## 7. Code Quality and Maintainability

### 7.1. Code Structure and Organization

**Template for Code Organization:**
```
Structure the codebase for [module/service] following these principles:
- Implement clear separation of concerns with layered architecture
- Use dependency injection for better testability
- Follow SOLID principles in class and interface design
- Implement proper abstraction layers for external dependencies
- Use consistent naming conventions throughout the codebase
- Include comprehensive docstrings and type hints
```

**Example:**
```
Structure the Simulation Engine codebase following these principles:
- Separate core engine logic from component implementations
- Use dependency injection for event publishers and configuration
- Implement abstract base classes for components and fault injectors
- Create clear interfaces for external communication (gRPC, message queues)
- Use consistent naming for events, components, and engine operations
- Include comprehensive docstrings for all public methods and classes
```

### 7.2. Refactoring and Code Improvement

**Template for Refactoring Requests:**
```
Refactor [code section/module] to improve:
- Code readability and maintainability
- Performance and memory usage
- Test coverage and testability
- Error handling and resilience
- Adherence to design patterns and best practices
- Documentation and type safety
```

**Example:**
```
Refactor the Design Service CRUD operations to improve:
- Separation of business logic from API endpoint handlers
- Database transaction management with proper rollback handling
- Input validation and error response consistency
- Query performance with optimized database operations
- Test coverage with better mock strategies
- Type safety with comprehensive Pydantic model usage
```

## 8. Testing Best Practices

### 8.1. Test Organization and Structure

**Guidelines for Test Structure:**
```
Organize tests following these principles:
- Group related tests in test classes or modules
- Use descriptive test names that explain the scenario
- Follow the AAA pattern (Arrange, Act, Assert)
- Use fixtures and factories for test data setup
- Implement proper test isolation and cleanup
- Use parameterized tests for testing multiple scenarios
```

### 8.2. Mock and Fixture Strategies

**Template for Mock Implementation:**
```
Create mocks and fixtures for [component/service] that:
- Mock external dependencies at the appropriate abstraction level
- Provide realistic test data that covers edge cases
- Implement reusable fixtures for common test scenarios
- Use dependency injection to make components easily testable
- Create test doubles that behave consistently across tests
```

**Example:**
```
Create mocks and fixtures for Simulation Engine testing that:
- Mock the event publisher to verify event emission without external dependencies
- Provide realistic component configurations for different test scenarios
- Implement fixtures for common simulation setups (simple service, database + service)
- Use dependency injection to replace real components with test doubles
- Create mock components that simulate various failure modes for resilience testing
```

## 9. Documentation and Code Comments

### 9.1. Code Documentation Standards

**Template for Documentation:**
```
Add comprehensive documentation that includes:
- Module-level docstrings explaining purpose and usage
- Class docstrings with examples and usage patterns
- Method docstrings with parameter descriptions and return values
- Inline comments for complex logic or business rules
- Type hints for all function parameters and return values
- Examples in docstrings for public APIs
```

### 9.2. API Documentation

**Template for API Documentation:**
```
Create API documentation that includes:
- OpenAPI/Swagger specifications for all endpoints
- Request/response examples with realistic data
- Error response documentation with status codes
- Authentication and authorization requirements
- Rate limiting and usage guidelines
- Integration examples for common use cases
```

## 10. Continuous Integration Support

### 10.1. CI/CD Pipeline Integration

**Template for CI/CD Support:**
```
Ensure code integrates well with CI/CD by:
- Writing tests that run reliably in containerized environments
- Using environment variables for configuration management
- Implementing proper database migration and seeding for tests
- Creating Docker health checks for services
- Adding performance benchmarks that can run in CI
- Implementing proper logging for debugging CI failures
```

By following this guidance, interactions with Cursor will result in high-quality, well-tested, and maintainable code that supports the long-term success of the Architech project.

---

**Author:** Manus AI

**Date:** 2025-07-19

