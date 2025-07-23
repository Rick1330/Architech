package components

import (
	"context"
	"fmt"
	"math/rand"
	"time"
	
	"simulation-engine/pkg/model"
)

// Route represents an API route
type Route struct {
	Path        string  `json:"path"`
	Method      string  `json:"method"`
	BackendURL  string  `json:"backend_url"`
	Timeout     float64 `json:"timeout"`
	RateLimit   int     `json:"rate_limit"`
	IsEnabled   bool    `json:"is_enabled"`
}

// APIGateway represents an API gateway component
type APIGateway struct {
	*model.BaseComponent
	RoutingLatency    float64            `json:"routing_latency"`
	FailureRate       float64            `json:"failure_rate"`
	MaxConcurrency    int                `json:"max_concurrency"`
	CurrentLoad       int                `json:"current_load"`
	Routes            map[string]*Route  `json:"routes"`
	RequestsRouted    int64              `json:"requests_routed"`
	RequestsFailed    int64              `json:"requests_failed"`
	RequestsBlocked   int64              `json:"requests_blocked"`
	AuthFailures      int64              `json:"auth_failures"`
	RateLimitHits     int64              `json:"rate_limit_hits"`
	RouteStats        map[string]int64   `json:"route_stats"`
}

// NewAPIGateway creates a new API gateway component
func NewAPIGateway(id string) *APIGateway {
	return &APIGateway{
		BaseComponent:     model.NewBaseComponent(id, model.TypeAPIGateway),
		RoutingLatency:    0.02, // Default 0.02 time units
		FailureRate:       0.001, // Default 0.1% failure rate
		MaxConcurrency:    1000,  // Default max 1000 concurrent requests
		CurrentLoad:       0,
		Routes:            make(map[string]*Route),
		RequestsRouted:    0,
		RequestsFailed:    0,
		RequestsBlocked:   0,
		AuthFailures:      0,
		RateLimitHits:     0,
		RouteStats:        make(map[string]int64),
	}
}

// Initialize sets up the API gateway with properties
func (ag *APIGateway) Initialize(properties map[string]interface{}) error {
	if err := ag.BaseComponent.Initialize(properties); err != nil {
		return err
	}
	
	// Set routing latency
	if rl, exists := properties["routing_latency"]; exists {
		if rlFloat, ok := rl.(float64); ok {
			ag.RoutingLatency = rlFloat
		}
	}
	
	// Set failure rate
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); ok {
			ag.FailureRate = frFloat
		}
	}
	
	// Set max concurrency
	if mc, exists := properties["max_concurrency"]; exists {
		if mcInt, ok := mc.(float64); ok {
			ag.MaxConcurrency = int(mcInt)
		}
	}
	
	// Initialize routes if provided
	if routes, exists := properties["routes"]; exists {
		if routeList, ok := routes.([]interface{}); ok {
			for _, route := range routeList {
				if routeMap, ok := route.(map[string]interface{}); ok {
					routeObj := &Route{
						Path:       routeMap["path"].(string),
						Method:     routeMap["method"].(string),
						BackendURL: routeMap["backend_url"].(string),
						Timeout:    routeMap["timeout"].(float64),
						RateLimit:  int(routeMap["rate_limit"].(float64)),
						IsEnabled:  routeMap["is_enabled"].(bool),
					}
					routeKey := fmt.Sprintf("%s:%s", routeObj.Method, routeObj.Path)
					ag.Routes[routeKey] = routeObj
				}
			}
		}
	}
	
	return nil
}

// HandleEvent processes incoming events
func (ag *APIGateway) HandleEvent(ctx context.Context, event *model.Event) ([]*model.Event, error) {
	var resultEvents []*model.Event
	
	switch event.Type {
	case model.RequestArrival:
		resultEvents = ag.handleAPIRequest(event)
	case model.RequestProcessed:
		resultEvents = ag.handleRequestCompletion(event)
	default:
		// Unknown event type, ignore
		return nil, nil
	}
	
	// Update metrics
	ag.updateMetrics(event)
	
	return resultEvents, nil
}

// handleAPIRequest processes incoming API requests
func (ag *APIGateway) handleAPIRequest(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if gateway can handle more requests
	if ag.CurrentLoad >= ag.MaxConcurrency {
		// Gateway is at capacity, reject request
		failEvent := model.NewEvent(
			fmt.Sprintf("gateway_overload_%s_%d", ag.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			ag.GetID(),
			map[string]interface{}{
				"reason":     "gateway_overloaded",
				"request_id": func() interface{} { v, _ := event.GetDataValue("request_id"); return v }(),
			},
		)
		resultEvents = append(resultEvents, failEvent)
		ag.RequestsBlocked++
		return resultEvents
	}
	
	// Extract request details
	path, _ := event.GetDataValue("path")
	method, _ := event.GetDataValue("method")
	pathStr := fmt.Sprintf("%v", path)
	methodStr := fmt.Sprintf("%v", method)
	
	// Find matching route
	routeKey := fmt.Sprintf("%s:%s", methodStr, pathStr)
	route, routeExists := ag.Routes[routeKey]
	
	if !routeExists || !route.IsEnabled {
		// Route not found or disabled
		failEvent := model.NewEvent(
			fmt.Sprintf("route_not_found_%s_%d", ag.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			ag.GetID(),
			map[string]interface{}{
				"reason":     "route_not_found",
				"path":       pathStr,
				"method":     methodStr,
				"request_id": func() interface{} { v, _ := event.GetDataValue("request_id"); return v }(),
			},
		)
		resultEvents = append(resultEvents, failEvent)
		ag.RequestsFailed++
		return resultEvents
	}
	
	// Simulate authentication check (10% chance of auth failure)
	if rand.Float64() < 0.1 {
		// Authentication failed
		authFailEvent := model.NewEvent(
			fmt.Sprintf("auth_fail_%s_%d", ag.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			ag.GetID(),
			map[string]interface{}{
				"reason":     "authentication_failed",
				"path":       pathStr,
				"method":     methodStr,
				"request_id": func() interface{} { v, _ := event.GetDataValue("request_id"); return v }(),
			},
		)
		resultEvents = append(resultEvents, authFailEvent)
		ag.AuthFailures++
		return resultEvents
	}
	
	// Simulate rate limiting (5% chance of hitting rate limit)
	if rand.Float64() < 0.05 {
		// Rate limit hit
		rateLimitEvent := model.NewEvent(
			fmt.Sprintf("rate_limit_%s_%d", ag.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			ag.GetID(),
			map[string]interface{}{
				"reason":     "rate_limit_exceeded",
				"path":       pathStr,
				"method":     methodStr,
				"rate_limit": route.RateLimit,
				"request_id": func() interface{} { v, _ := event.GetDataValue("request_id"); return v }(),
			},
		)
		resultEvents = append(resultEvents, rateLimitEvent)
		ag.RateLimitHits++
		return resultEvents
	}
	
	// Simulate gateway failure
	if rand.Float64() < ag.FailureRate {
		// Gateway fails
		failEvent := model.NewEvent(
			fmt.Sprintf("gateway_fail_%s_%d", ag.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			ag.GetID(),
			map[string]interface{}{
				"reason":     "gateway_error",
				"path":       pathStr,
				"method":     methodStr,
				"request_id": func() interface{} { v, _ := event.GetDataValue("request_id"); return v }(),
			},
		)
		resultEvents = append(resultEvents, failEvent)
		ag.RequestsFailed++
		return resultEvents
	}
	
	// Accept and route the request
	ag.CurrentLoad++
	ag.SetState(model.StateProcessing)
	
	// Create routing event
	routedEvent := model.NewEvent(
		fmt.Sprintf("routed_%s_%d", ag.GetID(), time.Now().UnixNano()),
		event.Timestamp + ag.RoutingLatency,
		model.RequestProcessed,
		route.BackendURL, // Route to backend service
		map[string]interface{}{
			"request_id":       func() interface{} { v, _ := event.GetDataValue("request_id"); return v }(),
			"path":             pathStr,
			"method":           methodStr,
			"backend_url":      route.BackendURL,
			"routing_latency":  ag.RoutingLatency,
			"timeout":          route.Timeout,
		},
	)
	
	resultEvents = append(resultEvents, routedEvent)
	ag.RequestsRouted++
	
	// Update route statistics
	ag.RouteStats[routeKey]++
	
	return resultEvents
}

// handleRequestCompletion processes request completion
func (ag *APIGateway) handleRequestCompletion(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Decrease current load
	ag.CurrentLoad--
	
	// Update state
	if ag.CurrentLoad == 0 {
		ag.SetState(model.StateIdle)
	}
	
	// Create completion event
	completedEvent := model.NewEvent(
		fmt.Sprintf("completed_%s_%d", ag.GetID(), time.Now().UnixNano()),
		event.Timestamp,
		model.RequestCompleted,
		ag.GetID(),
		map[string]interface{}{
			"request_id":      func() interface{} { v, _ := event.GetDataValue("request_id"); return v }(),
			"backend_url":     func() interface{} { v, _ := event.GetDataValue("backend_url"); return v }(),
			"routing_latency": func() interface{} { v, _ := event.GetDataValue("routing_latency"); return v }(),
		},
	)
	
	resultEvents = append(resultEvents, completedEvent)
	return resultEvents
}

// updateMetrics updates component metrics
func (ag *APIGateway) updateMetrics(event *model.Event) {
	ag.SetMetric("current_load", ag.CurrentLoad)
	ag.SetMetric("requests_routed", ag.RequestsRouted)
	ag.SetMetric("requests_failed", ag.RequestsFailed)
	ag.SetMetric("requests_blocked", ag.RequestsBlocked)
	ag.SetMetric("auth_failures", ag.AuthFailures)
	ag.SetMetric("rate_limit_hits", ag.RateLimitHits)
	ag.SetMetric("routing_latency", ag.RoutingLatency)
	ag.SetMetric("failure_rate", ag.FailureRate)
	ag.SetMetric("max_concurrency", ag.MaxConcurrency)
	ag.SetMetric("routes_count", len(ag.Routes))
	
	// Calculate success rate
	total := ag.RequestsRouted + ag.RequestsFailed + ag.RequestsBlocked + ag.AuthFailures + ag.RateLimitHits
	if total > 0 {
		successRate := float64(ag.RequestsRouted) / float64(total)
		ag.SetMetric("success_rate", successRate)
	}
	
	// Calculate utilization
	utilization := float64(ag.CurrentLoad) / float64(ag.MaxConcurrency)
	ag.SetMetric("utilization", utilization)
	
	// Set route statistics
	ag.SetMetric("route_stats", ag.RouteStats)
}

// Start begins the API gateway operation
func (ag *APIGateway) Start(ctx context.Context) error {
	if err := ag.BaseComponent.Start(ctx); err != nil {
		return err
	}
	
	ag.CurrentLoad = 0
	ag.RequestsRouted = 0
	ag.RequestsFailed = 0
	ag.RequestsBlocked = 0
	ag.AuthFailures = 0
	ag.RateLimitHits = 0
	ag.RouteStats = make(map[string]int64)
	ag.SetState(model.StateIdle)
	
	return nil
}

// Stop gracefully shuts down the API gateway
func (ag *APIGateway) Stop(ctx context.Context) error {
	ag.SetState(model.StateStopped)
	return ag.BaseComponent.Stop(ctx)
}

// Validate checks if the API gateway configuration is valid
func (ag *APIGateway) Validate() error {
	if err := ag.BaseComponent.Validate(); err != nil {
		return err
	}
	
	if ag.RoutingLatency <= 0 {
		return fmt.Errorf("routing latency must be positive")
	}
	
	if ag.FailureRate < 0 || ag.FailureRate > 1 {
		return fmt.Errorf("failure rate must be between 0 and 1")
	}
	
	if ag.MaxConcurrency <= 0 {
		return fmt.Errorf("max concurrency must be positive")
	}
	
	// Validate routes
	for routeKey, route := range ag.Routes {
		if route.Path == "" {
			return fmt.Errorf("route %s has empty path", routeKey)
		}
		if route.Method == "" {
			return fmt.Errorf("route %s has empty method", routeKey)
		}
		if route.BackendURL == "" {
			return fmt.Errorf("route %s has empty backend URL", routeKey)
		}
		if route.Timeout <= 0 {
			return fmt.Errorf("route %s has invalid timeout", routeKey)
		}
		if route.RateLimit <= 0 {
			return fmt.Errorf("route %s has invalid rate limit", routeKey)
		}
	}
	
	return nil
}

// AddRoute adds a new route to the gateway
func (ag *APIGateway) AddRoute(path, method, backendURL string, timeout float64, rateLimit int) {
	routeKey := fmt.Sprintf("%s:%s", method, path)
	route := &Route{
		Path:       path,
		Method:     method,
		BackendURL: backendURL,
		Timeout:    timeout,
		RateLimit:  rateLimit,
		IsEnabled:  true,
	}
	ag.Routes[routeKey] = route
}

// RemoveRoute removes a route from the gateway
func (ag *APIGateway) RemoveRoute(path, method string) {
	routeKey := fmt.Sprintf("%s:%s", method, path)
	delete(ag.Routes, routeKey)
}

// EnableRoute enables a route
func (ag *APIGateway) EnableRoute(path, method string) {
	routeKey := fmt.Sprintf("%s:%s", method, path)
	if route, exists := ag.Routes[routeKey]; exists {
		route.IsEnabled = true
	}
}

// DisableRoute disables a route
func (ag *APIGateway) DisableRoute(path, method string) {
	routeKey := fmt.Sprintf("%s:%s", method, path)
	if route, exists := ag.Routes[routeKey]; exists {
		route.IsEnabled = false
	}
}

// GetUtilization returns the current utilization percentage
func (ag *APIGateway) GetUtilization() float64 {
	return float64(ag.CurrentLoad) / float64(ag.MaxConcurrency)
}

// IsOverloaded returns true if the gateway is at capacity
func (ag *APIGateway) IsOverloaded() bool {
	return ag.CurrentLoad >= ag.MaxConcurrency
}

// GetSuccessRate returns the success rate
func (ag *APIGateway) GetSuccessRate() float64 {
	total := ag.RequestsRouted + ag.RequestsFailed + ag.RequestsBlocked + ag.AuthFailures + ag.RateLimitHits
	if total == 0 {
		return 1.0 // No requests processed yet, assume 100% success
	}
	return float64(ag.RequestsRouted) / float64(total)
}

// GetRouteStats returns statistics for all routes
func (ag *APIGateway) GetRouteStats() map[string]int64 {
	stats := make(map[string]int64)
	for k, v := range ag.RouteStats {
		stats[k] = v
	}
	return stats
}

