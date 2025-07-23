package components

import (
	"context"
	"fmt"
	"math/rand"
	"time"
	
	"simulation-engine/pkg/model"
)

// LoadBalancingAlgorithm represents different load balancing algorithms
type LoadBalancingAlgorithm string

const (
	RoundRobin       LoadBalancingAlgorithm = "round_robin"
	LeastConnections LoadBalancingAlgorithm = "least_connections"
	Weighted         LoadBalancingAlgorithm = "weighted"
)

// BackendServer represents a backend server
type BackendServer struct {
	ID          string  `json:"id"`
	Weight      int     `json:"weight"`
	IsHealthy   bool    `json:"is_healthy"`
	Connections int     `json:"connections"`
	LastCheck   float64 `json:"last_check"`
}

// LoadBalancer represents a load balancer component
type LoadBalancer struct {
	*model.BaseComponent
	Algorithm            LoadBalancingAlgorithm `json:"algorithm"`
	HealthCheckInterval  float64                `json:"health_check_interval"`
	RoutingLatency       float64                `json:"routing_latency"`
	FailureRate          float64                `json:"failure_rate"`
	BackendServers       []*BackendServer       `json:"backend_servers"`
	CurrentServerIndex   int                    `json:"current_server_index"`
	RequestsRouted       int64                  `json:"requests_routed"`
	RequestsFailed       int64                  `json:"requests_failed"`
	HealthChecksPerformed int64                 `json:"health_checks_performed"`
}

// NewLoadBalancer creates a new load balancer component
func NewLoadBalancer(id string) *LoadBalancer {
	return &LoadBalancer{
		BaseComponent:         model.NewBaseComponent(id, model.TypeLoadBalancer),
		Algorithm:             RoundRobin,
		HealthCheckInterval:   5.0,  // Default 5 time units
		RoutingLatency:        0.01, // Default 0.01 time units
		FailureRate:           0.001, // Default 0.1% failure rate
		BackendServers:        make([]*BackendServer, 0),
		CurrentServerIndex:    0,
		RequestsRouted:        0,
		RequestsFailed:        0,
		HealthChecksPerformed: 0,
	}
}

// Initialize sets up the load balancer with properties
func (lb *LoadBalancer) Initialize(properties map[string]interface{}) error {
	if err := lb.BaseComponent.Initialize(properties); err != nil {
		return err
	}
	
	// Set algorithm
	if algo, exists := properties["algorithm"]; exists {
		if algoStr, ok := algo.(string); ok {
			lb.Algorithm = LoadBalancingAlgorithm(algoStr)
		}
	}
	
	// Set health check interval
	if hci, exists := properties["health_check_interval"]; exists {
		if hciFloat, ok := hci.(float64); ok {
			lb.HealthCheckInterval = hciFloat
		}
	}
	
	// Set routing latency
	if rl, exists := properties["routing_latency"]; exists {
		if rlFloat, ok := rl.(float64); ok {
			lb.RoutingLatency = rlFloat
		}
	}
	
	// Set failure rate
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); ok {
			lb.FailureRate = frFloat
		}
	}
	
	// Initialize backend servers if provided
	if servers, exists := properties["backend_servers"]; exists {
		if serverList, ok := servers.([]interface{}); ok {
			for _, server := range serverList {
				if serverMap, ok := server.(map[string]interface{}); ok {
					backendServer := &BackendServer{
						ID:          serverMap["id"].(string),
						Weight:      int(serverMap["weight"].(float64)),
						IsHealthy:   true,
						Connections: 0,
						LastCheck:   0,
					}
					lb.BackendServers = append(lb.BackendServers, backendServer)
				}
			}
		}
	}
	
	return nil
}

// HandleEvent processes incoming events
func (lb *LoadBalancer) HandleEvent(ctx context.Context, event *model.Event) ([]*model.Event, error) {
	var resultEvents []*model.Event
	
	switch event.Type {
	case model.RequestArrival:
		resultEvents = lb.handleRequestRouting(event)
	default:
		// Unknown event type, ignore
		return nil, nil
	}
	
	// Update metrics
	lb.updateMetrics(event)
	
	return resultEvents, nil
}

// handleRequestRouting processes request routing
func (lb *LoadBalancer) handleRequestRouting(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if there are healthy backend servers
	healthyServers := lb.getHealthyServers()
	if len(healthyServers) == 0 {
		// No healthy servers, fail the request
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("route_fail_%s_%d", lb.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			lb.GetID(),
			map[string]interface{}{
				"reason":     "no_healthy_servers",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		lb.RequestsFailed++
		return resultEvents
	}
	
	// Simulate routing failure
	if rand.Float64() < lb.FailureRate {
		// Routing fails
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("route_fail_%s_%d", lb.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			lb.GetID(),
			map[string]interface{}{
				"reason":     "routing_error",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		lb.RequestsFailed++
		return resultEvents
	}
	
	// Select backend server based on algorithm
	selectedServer := lb.selectBackendServer(healthyServers)
	if selectedServer == nil {
		// No server selected, fail the request
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("route_fail_%s_%d", lb.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			lb.GetID(),
			map[string]interface{}{
				"reason":     "server_selection_failed",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		lb.RequestsFailed++
		return resultEvents
	}
	
	// Route the request
	selectedServer.Connections++
	lb.RequestsRouted++
	lb.SetState(model.StateProcessing)
	
	// Create routing success event
	requestID, _ := event.GetDataValue("request_id")
	routedEvent := model.NewEvent(
		fmt.Sprintf("routed_%s_%d", lb.GetID(), time.Now().UnixNano()),
		event.Timestamp + lb.RoutingLatency,
		model.RequestProcessed,
		selectedServer.ID, // Route to the selected server
		map[string]interface{}{
			"request_id":       requestID,
			"backend_server":   selectedServer.ID,
			"routing_latency":  lb.RoutingLatency,
			"algorithm":        string(lb.Algorithm),
		},
	)
	
	resultEvents = append(resultEvents, routedEvent)
	
	// Schedule connection cleanup after some time
	cleanupEvent := model.NewEvent(
		fmt.Sprintf("cleanup_%s_%d", lb.GetID(), time.Now().UnixNano()),
		event.Timestamp + lb.RoutingLatency + 1.0, // Cleanup after 1 time unit
		model.RequestCompleted,
		lb.GetID(),
		map[string]interface{}{
			"backend_server": selectedServer.ID,
			"cleanup":        true,
		},
	)
	
	resultEvents = append(resultEvents, cleanupEvent)
	
	return resultEvents
}

// getHealthyServers returns a list of healthy backend servers
func (lb *LoadBalancer) getHealthyServers() []*BackendServer {
	var healthyServers []*BackendServer
	for _, server := range lb.BackendServers {
		if server.IsHealthy {
			healthyServers = append(healthyServers, server)
		}
	}
	return healthyServers
}

// selectBackendServer selects a backend server based on the configured algorithm
func (lb *LoadBalancer) selectBackendServer(healthyServers []*BackendServer) *BackendServer {
	if len(healthyServers) == 0 {
		return nil
	}
	
	switch lb.Algorithm {
	case RoundRobin:
		return lb.selectRoundRobin(healthyServers)
	case LeastConnections:
		return lb.selectLeastConnections(healthyServers)
	case Weighted:
		return lb.selectWeighted(healthyServers)
	default:
		return lb.selectRoundRobin(healthyServers)
	}
}

// selectRoundRobin implements round-robin server selection
func (lb *LoadBalancer) selectRoundRobin(healthyServers []*BackendServer) *BackendServer {
	if len(healthyServers) == 0 {
		return nil
	}
	
	server := healthyServers[lb.CurrentServerIndex%len(healthyServers)]
	lb.CurrentServerIndex++
	return server
}

// selectLeastConnections implements least connections server selection
func (lb *LoadBalancer) selectLeastConnections(healthyServers []*BackendServer) *BackendServer {
	if len(healthyServers) == 0 {
		return nil
	}
	
	var selectedServer *BackendServer
	minConnections := int(^uint(0) >> 1) // Max int
	
	for _, server := range healthyServers {
		if server.Connections < minConnections {
			minConnections = server.Connections
			selectedServer = server
		}
	}
	
	return selectedServer
}

// selectWeighted implements weighted server selection
func (lb *LoadBalancer) selectWeighted(healthyServers []*BackendServer) *BackendServer {
	if len(healthyServers) == 0 {
		return nil
	}
	
	// Calculate total weight
	totalWeight := 0
	for _, server := range healthyServers {
		totalWeight += server.Weight
	}
	
	if totalWeight == 0 {
		// If no weights, fall back to round-robin
		return lb.selectRoundRobin(healthyServers)
	}
	
	// Select based on weight
	randomWeight := rand.Intn(totalWeight)
	currentWeight := 0
	
	for _, server := range healthyServers {
		currentWeight += server.Weight
		if randomWeight < currentWeight {
			return server
		}
	}
	
	// Fallback to first server
	return healthyServers[0]
}

// updateMetrics updates component metrics
func (lb *LoadBalancer) updateMetrics(event *model.Event) {
	lb.SetMetric("requests_routed", lb.RequestsRouted)
	lb.SetMetric("requests_failed", lb.RequestsFailed)
	lb.SetMetric("health_checks_performed", lb.HealthChecksPerformed)
	lb.SetMetric("routing_latency", lb.RoutingLatency)
	lb.SetMetric("failure_rate", lb.FailureRate)
	lb.SetMetric("algorithm", string(lb.Algorithm))
	lb.SetMetric("backend_servers_count", len(lb.BackendServers))
	
	// Count healthy servers
	healthyCount := 0
	totalConnections := 0
	for _, server := range lb.BackendServers {
		if server.IsHealthy {
			healthyCount++
		}
		totalConnections += server.Connections
	}
	lb.SetMetric("healthy_servers_count", healthyCount)
	lb.SetMetric("total_connections", totalConnections)
	
	// Calculate success rate
	total := lb.RequestsRouted + lb.RequestsFailed
	if total > 0 {
		successRate := float64(lb.RequestsRouted) / float64(total)
		lb.SetMetric("success_rate", successRate)
	}
}

// Start begins the load balancer operation
func (lb *LoadBalancer) Start(ctx context.Context) error {
	if err := lb.BaseComponent.Start(ctx); err != nil {
		return err
	}
	
	lb.RequestsRouted = 0
	lb.RequestsFailed = 0
	lb.HealthChecksPerformed = 0
	lb.CurrentServerIndex = 0
	lb.SetState(model.StateIdle)
	
	return nil
}

// Stop gracefully shuts down the load balancer
func (lb *LoadBalancer) Stop(ctx context.Context) error {
	lb.SetState(model.StateStopped)
	return lb.BaseComponent.Stop(ctx)
}

// Validate checks if the load balancer configuration is valid
func (lb *LoadBalancer) Validate() error {
	if err := lb.BaseComponent.Validate(); err != nil {
		return err
	}
	
	if lb.RoutingLatency <= 0 {
		return fmt.Errorf("routing latency must be positive")
	}
	
	if lb.FailureRate < 0 || lb.FailureRate > 1 {
		return fmt.Errorf("failure rate must be between 0 and 1")
	}
	
	if lb.HealthCheckInterval <= 0 {
		return fmt.Errorf("health check interval must be positive")
	}
	
	validAlgorithms := []LoadBalancingAlgorithm{RoundRobin, LeastConnections, Weighted}
	isValidAlgorithm := false
	for _, algo := range validAlgorithms {
		if lb.Algorithm == algo {
			isValidAlgorithm = true
			break
		}
	}
	if !isValidAlgorithm {
		return fmt.Errorf("invalid load balancing algorithm: %s", lb.Algorithm)
	}
	
	return nil
}

// AddBackendServer adds a backend server
func (lb *LoadBalancer) AddBackendServer(id string, weight int) {
	server := &BackendServer{
		ID:          id,
		Weight:      weight,
		IsHealthy:   true,
		Connections: 0,
		LastCheck:   0,
	}
	lb.BackendServers = append(lb.BackendServers, server)
}

// RemoveBackendServer removes a backend server
func (lb *LoadBalancer) RemoveBackendServer(id string) {
	for i, server := range lb.BackendServers {
		if server.ID == id {
			lb.BackendServers = append(lb.BackendServers[:i], lb.BackendServers[i+1:]...)
			break
		}
	}
}

// SetServerHealth sets the health status of a backend server
func (lb *LoadBalancer) SetServerHealth(id string, isHealthy bool) {
	for _, server := range lb.BackendServers {
		if server.ID == id {
			server.IsHealthy = isHealthy
			break
		}
	}
}

// GetSuccessRate returns the success rate
func (lb *LoadBalancer) GetSuccessRate() float64 {
	total := lb.RequestsRouted + lb.RequestsFailed
	if total == 0 {
		return 1.0 // No requests processed yet, assume 100% success
	}
	return float64(lb.RequestsRouted) / float64(total)
}

// GetHealthyServerCount returns the number of healthy servers
func (lb *LoadBalancer) GetHealthyServerCount() int {
	count := 0
	for _, server := range lb.BackendServers {
		if server.IsHealthy {
			count++
		}
	}
	return count
}

