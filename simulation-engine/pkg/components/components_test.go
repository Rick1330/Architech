package components

import (
	"context"
	"testing"
	
	"simulation-engine/pkg/model"
)

func TestGenericServiceCreation(t *testing.T) {
	service := NewGenericService("test-service")
	
	if service.GetID() != "test-service" {
		t.Errorf("Expected service ID to be 'test-service', got %s", service.GetID())
	}
	
	if service.GetType() != model.TypeGenericService {
		t.Errorf("Expected service type to be %s, got %s", model.TypeGenericService, service.GetType())
	}
	
	if service.ProcessingTime != 1.0 {
		t.Errorf("Expected default processing time to be 1.0, got %f", service.ProcessingTime)
	}
}

func TestGenericServiceInitialization(t *testing.T) {
	service := NewGenericService("test-service")
	
	properties := map[string]interface{}{
		"processing_time": 2.5,
		"failure_rate":    0.05,
		"max_concurrency": 20.0,
	}
	
	err := service.Initialize(properties)
	if err != nil {
		t.Fatalf("Failed to initialize service: %v", err)
	}
	
	if service.ProcessingTime != 2.5 {
		t.Errorf("Expected processing time to be 2.5, got %f", service.ProcessingTime)
	}
	
	if service.FailureRate != 0.05 {
		t.Errorf("Expected failure rate to be 0.05, got %f", service.FailureRate)
	}
	
	if service.MaxConcurrency != 20 {
		t.Errorf("Expected max concurrency to be 20, got %d", service.MaxConcurrency)
	}
}

func TestGenericServiceValidation(t *testing.T) {
	service := NewGenericService("test-service")
	
	// Test valid configuration
	err := service.Validate()
	if err != nil {
		t.Errorf("Valid service configuration should not return error: %v", err)
	}
	
	// Test invalid processing time
	service.ProcessingTime = -1.0
	err = service.Validate()
	if err == nil {
		t.Error("Expected error for negative processing time")
	}
	
	// Reset and test invalid failure rate
	service.ProcessingTime = 1.0
	service.FailureRate = 1.5
	err = service.Validate()
	if err == nil {
		t.Error("Expected error for failure rate > 1")
	}
}

func TestDatabaseCreation(t *testing.T) {
	db := NewDatabase("test-db")
	
	if db.GetID() != "test-db" {
		t.Errorf("Expected database ID to be 'test-db', got %s", db.GetID())
	}
	
	if db.GetType() != model.TypeDatabase {
		t.Errorf("Expected database type to be %s, got %s", model.TypeDatabase, db.GetType())
	}
	
	if db.ReadLatency != 0.1 {
		t.Errorf("Expected default read latency to be 0.1, got %f", db.ReadLatency)
	}
}

func TestMessageQueueCreation(t *testing.T) {
	mq := NewMessageQueue("test-queue")
	
	if mq.GetID() != "test-queue" {
		t.Errorf("Expected queue ID to be 'test-queue', got %s", mq.GetID())
	}
	
	if mq.GetType() != model.TypeMessageQueue {
		t.Errorf("Expected queue type to be %s, got %s", model.TypeMessageQueue, mq.GetType())
	}
	
	if mq.MaxQueueSize != 1000 {
		t.Errorf("Expected default max queue size to be 1000, got %d", mq.MaxQueueSize)
	}
}

func TestLoadBalancerCreation(t *testing.T) {
	lb := NewLoadBalancer("test-lb")
	
	if lb.GetID() != "test-lb" {
		t.Errorf("Expected load balancer ID to be 'test-lb', got %s", lb.GetID())
	}
	
	if lb.GetType() != model.TypeLoadBalancer {
		t.Errorf("Expected load balancer type to be %s, got %s", model.TypeLoadBalancer, lb.GetType())
	}
	
	if lb.Algorithm != RoundRobin {
		t.Errorf("Expected default algorithm to be %s, got %s", RoundRobin, lb.Algorithm)
	}
}

func TestCacheCreation(t *testing.T) {
	cache := NewCache("test-cache")
	
	if cache.GetID() != "test-cache" {
		t.Errorf("Expected cache ID to be 'test-cache', got %s", cache.GetID())
	}
	
	if cache.GetType() != model.TypeCache {
		t.Errorf("Expected cache type to be %s, got %s", model.TypeCache, cache.GetType())
	}
	
	if cache.HitRatio != 0.8 {
		t.Errorf("Expected default hit ratio to be 0.8, got %f", cache.HitRatio)
	}
}

func TestAPIGatewayCreation(t *testing.T) {
	gw := NewAPIGateway("test-gateway")
	
	if gw.GetID() != "test-gateway" {
		t.Errorf("Expected gateway ID to be 'test-gateway', got %s", gw.GetID())
	}
	
	if gw.GetType() != model.TypeAPIGateway {
		t.Errorf("Expected gateway type to be %s, got %s", model.TypeAPIGateway, gw.GetType())
	}
	
	if gw.MaxConcurrency != 1000 {
		t.Errorf("Expected default max concurrency to be 1000, got %d", gw.MaxConcurrency)
	}
}

func TestComponentFactory(t *testing.T) {
	factory := NewDefaultComponentFactory()
	
	// Test creating a generic service
	component, err := factory.CreateComponent(model.TypeGenericService, "test-service", nil)
	if err != nil {
		t.Fatalf("Failed to create generic service: %v", err)
	}
	
	if component.GetID() != "test-service" {
		t.Errorf("Expected component ID to be 'test-service', got %s", component.GetID())
	}
	
	// Test creating with properties
	properties := map[string]interface{}{
		"processing_time": 2.0,
		"failure_rate":    0.01,
		"max_concurrency": 50.0,
	}
	
	component, err = factory.CreateComponent(model.TypeGenericService, "test-service-2", properties)
	if err != nil {
		t.Fatalf("Failed to create generic service with properties: %v", err)
	}
	
	service, ok := component.(*GenericService)
	if !ok {
		t.Fatal("Expected component to be a GenericService")
	}
	
	if service.ProcessingTime != 2.0 {
		t.Errorf("Expected processing time to be 2.0, got %f", service.ProcessingTime)
	}
}

func TestGenericServiceEventHandling(t *testing.T) {
	service := NewGenericService("test-service")
	ctx := context.Background()
	
	// Start the service
	err := service.Start(ctx)
	if err != nil {
		t.Fatalf("Failed to start service: %v", err)
	}
	
	// Create a request arrival event
	event := model.NewEvent(
		"test-event",
		1.0,
		model.RequestArrival,
		"test-service",
		map[string]interface{}{
			"request_id": "req-123",
		},
	)
	
	// Handle the event
	resultEvents, err := service.HandleEvent(ctx, event)
	if err != nil {
		t.Fatalf("Failed to handle event: %v", err)
	}
	
	// Should generate at least one result event
	if len(resultEvents) == 0 {
		t.Error("Expected at least one result event")
	}
	
	// Check that current load increased
	if service.CurrentLoad != 1 {
		t.Errorf("Expected current load to be 1, got %d", service.CurrentLoad)
	}
}

func TestMessageQueueOperations(t *testing.T) {
	mq := NewMessageQueue("test-queue")
	ctx := context.Background()
	
	// Start the queue
	err := mq.Start(ctx)
	if err != nil {
		t.Fatalf("Failed to start message queue: %v", err)
	}
	
	// Test enqueue operation
	enqueueEvent := model.NewEvent(
		"enqueue-event",
		1.0,
		model.MessageEnqueued,
		"test-queue",
		map[string]interface{}{
			"message_id": "msg-123",
		},
	)
	
	resultEvents, err := mq.HandleEvent(ctx, enqueueEvent)
	if err != nil {
		t.Fatalf("Failed to handle enqueue event: %v", err)
	}
	
	if len(resultEvents) == 0 {
		t.Error("Expected at least one result event from enqueue")
	}
	
	// Check queue size
	if mq.CurrentQueueSize != 1 {
		t.Errorf("Expected queue size to be 1, got %d", mq.CurrentQueueSize)
	}
}

func TestCacheOperations(t *testing.T) {
	cache := NewCache("test-cache")
	ctx := context.Background()
	
	// Start the cache
	err := cache.Start(ctx)
	if err != nil {
		t.Fatalf("Failed to start cache: %v", err)
	}
	
	// Test cache read operation
	readEvent := model.NewEvent(
		"read-event",
		1.0,
		model.DatabaseRead,
		"test-cache",
		map[string]interface{}{
			"key":        "test-key",
			"request_id": "req-123",
		},
	)
	
	resultEvents, err := cache.HandleEvent(ctx, readEvent)
	if err != nil {
		t.Fatalf("Failed to handle read event: %v", err)
	}
	
	if len(resultEvents) == 0 {
		t.Error("Expected at least one result event from cache read")
	}
}

func TestLoadBalancerServerSelection(t *testing.T) {
	lb := NewLoadBalancer("test-lb")
	
	// Add some backend servers
	lb.AddBackendServer("server1", 1)
	lb.AddBackendServer("server2", 1)
	lb.AddBackendServer("server3", 1)
	
	if len(lb.BackendServers) != 3 {
		t.Errorf("Expected 3 backend servers, got %d", len(lb.BackendServers))
	}
	
	// Test round-robin selection
	healthyServers := lb.getHealthyServers()
	if len(healthyServers) != 3 {
		t.Errorf("Expected 3 healthy servers, got %d", len(healthyServers))
	}
	
	// Test server selection
	server1 := lb.selectRoundRobin(healthyServers)
	server2 := lb.selectRoundRobin(healthyServers)
	
	if server1.ID == server2.ID {
		t.Error("Round-robin should select different servers")
	}
}

func TestComponentLifecycle(t *testing.T) {
	service := NewGenericService("test-service")
	ctx := context.Background()
	
	// Test initial state
	if service.GetState() != model.StateIdle {
		t.Errorf("Expected initial state to be %s, got %s", model.StateIdle, service.GetState())
	}
	
	// Test start
	err := service.Start(ctx)
	if err != nil {
		t.Fatalf("Failed to start service: %v", err)
	}
	
	if service.GetState() != model.StateIdle {
		t.Errorf("Expected state after start to be %s, got %s", model.StateIdle, service.GetState())
	}
	
	// Test stop
	err = service.Stop(ctx)
	if err != nil {
		t.Fatalf("Failed to stop service: %v", err)
	}
	
	if service.GetState() != model.StateStopped {
		t.Errorf("Expected state after stop to be %s, got %s", model.StateStopped, service.GetState())
	}
}

func TestComponentMetrics(t *testing.T) {
	service := NewGenericService("test-service")
	
	// Set a metric
	service.SetMetric("test_metric", 42)
	
	// Get the metric
	value := service.GetMetric("test_metric")
	if value != 42 {
		t.Errorf("Expected metric value to be 42, got %v", value)
	}
	
	// Test non-existent metric
	value = service.GetMetric("non_existent")
	if value != nil {
		t.Errorf("Expected nil for non-existent metric, got %v", value)
	}
}

func BenchmarkGenericServiceEventHandling(b *testing.B) {
	service := NewGenericService("bench-service")
	ctx := context.Background()
	service.Start(ctx)
	
	event := model.NewEvent(
		"bench-event",
		1.0,
		model.RequestArrival,
		"bench-service",
		map[string]interface{}{
			"request_id": "req-bench",
		},
	)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		service.HandleEvent(ctx, event)
	}
}

