package components

import (
	"fmt"
	
	"simulation-engine/pkg/model"
)

// DefaultComponentFactory is the default implementation of ComponentFactory
type DefaultComponentFactory struct{}

// NewDefaultComponentFactory creates a new default component factory
func NewDefaultComponentFactory() *DefaultComponentFactory {
	return &DefaultComponentFactory{}
}

// CreateComponent creates a component based on type
func (f *DefaultComponentFactory) CreateComponent(componentType model.ComponentType, id string, properties map[string]interface{}) (model.Component, error) {
	var component model.Component
	
	switch componentType {
	case model.TypeGenericService:
		component = NewGenericService(id)
	case model.TypeDatabase:
		component = NewDatabase(id)
	case model.TypeMessageQueue:
		component = NewMessageQueue(id)
	case model.TypeLoadBalancer:
		component = NewLoadBalancer(id)
	case model.TypeCache:
		component = NewCache(id)
	case model.TypeAPIGateway:
		component = NewAPIGateway(id)
	default:
		return nil, fmt.Errorf("unsupported component type: %s", componentType)
	}
	
	// Initialize the component with properties
	if properties != nil {
		if err := component.Initialize(properties); err != nil {
			return nil, fmt.Errorf("failed to initialize component: %w", err)
		}
	}
	
	// Validate the component
	if err := component.Validate(); err != nil {
		return nil, fmt.Errorf("component validation failed: %w", err)
	}
	
	return component, nil
}

// GetSupportedTypes returns the list of supported component types
func (f *DefaultComponentFactory) GetSupportedTypes() []model.ComponentType {
	return []model.ComponentType{
		model.TypeGenericService,
		model.TypeDatabase,
		model.TypeMessageQueue,
		model.TypeLoadBalancer,
		model.TypeCache,
		model.TypeAPIGateway,
	}
}

// CreateGenericService creates a generic service with specific properties
func (f *DefaultComponentFactory) CreateGenericService(id string, processingTime, failureRate float64, maxConcurrency int) (model.Component, error) {
	properties := map[string]interface{}{
		"processing_time": processingTime,
		"failure_rate":    failureRate,
		"max_concurrency": float64(maxConcurrency),
	}
	
	return f.CreateComponent(model.TypeGenericService, id, properties)
}

// CreateDatabase creates a database with specific properties
func (f *DefaultComponentFactory) CreateDatabase(id string, readLatency, writeLatency, queryLatency, failureRate float64, maxConnections int) (model.Component, error) {
	properties := map[string]interface{}{
		"read_latency":     readLatency,
		"write_latency":    writeLatency,
		"query_latency":    queryLatency,
		"failure_rate":     failureRate,
		"max_connections":  float64(maxConnections),
	}
	
	return f.CreateComponent(model.TypeDatabase, id, properties)
}

// CreateMessageQueue creates a message queue with specific properties
func (f *DefaultComponentFactory) CreateMessageQueue(id string, processingTime, failureRate float64, maxQueueSize int) (model.Component, error) {
	properties := map[string]interface{}{
		"processing_time": processingTime,
		"failure_rate":    failureRate,
		"max_queue_size":  float64(maxQueueSize),
	}
	
	return f.CreateComponent(model.TypeMessageQueue, id, properties)
}

// CreateLoadBalancer creates a load balancer with specific properties
func (f *DefaultComponentFactory) CreateLoadBalancer(id string, algorithm string, healthCheckInterval float64) (model.Component, error) {
	properties := map[string]interface{}{
		"algorithm":              algorithm,
		"health_check_interval":  healthCheckInterval,
	}
	
	return f.CreateComponent(model.TypeLoadBalancer, id, properties)
}

// CreateCache creates a cache with specific properties
func (f *DefaultComponentFactory) CreateCache(id string, hitRatio, accessTime, failureRate float64, maxSize int) (model.Component, error) {
	properties := map[string]interface{}{
		"hit_ratio":     hitRatio,
		"access_time":   accessTime,
		"failure_rate":  failureRate,
		"max_size":      float64(maxSize),
	}
	
	return f.CreateComponent(model.TypeCache, id, properties)
}

// CreateAPIGateway creates an API gateway with specific properties
func (f *DefaultComponentFactory) CreateAPIGateway(id string, routingLatency, failureRate float64, maxConcurrency int) (model.Component, error) {
	properties := map[string]interface{}{
		"routing_latency": routingLatency,
		"failure_rate":    failureRate,
		"max_concurrency": float64(maxConcurrency),
	}
	
	return f.CreateComponent(model.TypeAPIGateway, id, properties)
}

// ValidateComponentProperties validates properties for a specific component type
func (f *DefaultComponentFactory) ValidateComponentProperties(componentType model.ComponentType, properties map[string]interface{}) error {
	switch componentType {
	case model.TypeGenericService:
		return f.validateGenericServiceProperties(properties)
	case model.TypeDatabase:
		return f.validateDatabaseProperties(properties)
	case model.TypeMessageQueue:
		return f.validateMessageQueueProperties(properties)
	case model.TypeLoadBalancer:
		return f.validateLoadBalancerProperties(properties)
	case model.TypeCache:
		return f.validateCacheProperties(properties)
	case model.TypeAPIGateway:
		return f.validateAPIGatewayProperties(properties)
	default:
		return fmt.Errorf("unsupported component type: %s", componentType)
	}
}

func (f *DefaultComponentFactory) validateGenericServiceProperties(properties map[string]interface{}) error {
	if pt, exists := properties["processing_time"]; exists {
		if ptFloat, ok := pt.(float64); !ok || ptFloat <= 0 {
			return fmt.Errorf("processing_time must be a positive number")
		}
	}
	
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); !ok || frFloat < 0 || frFloat > 1 {
			return fmt.Errorf("failure_rate must be a number between 0 and 1")
		}
	}
	
	if mc, exists := properties["max_concurrency"]; exists {
		if mcFloat, ok := mc.(float64); !ok || mcFloat <= 0 {
			return fmt.Errorf("max_concurrency must be a positive number")
		}
	}
	
	return nil
}

func (f *DefaultComponentFactory) validateDatabaseProperties(properties map[string]interface{}) error {
	latencyFields := []string{"read_latency", "write_latency", "query_latency"}
	for _, field := range latencyFields {
		if val, exists := properties[field]; exists {
			if valFloat, ok := val.(float64); !ok || valFloat <= 0 {
				return fmt.Errorf("%s must be a positive number", field)
			}
		}
	}
	
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); !ok || frFloat < 0 || frFloat > 1 {
			return fmt.Errorf("failure_rate must be a number between 0 and 1")
		}
	}
	
	if mc, exists := properties["max_connections"]; exists {
		if mcFloat, ok := mc.(float64); !ok || mcFloat <= 0 {
			return fmt.Errorf("max_connections must be a positive number")
		}
	}
	
	return nil
}

func (f *DefaultComponentFactory) validateMessageQueueProperties(properties map[string]interface{}) error {
	if pt, exists := properties["processing_time"]; exists {
		if ptFloat, ok := pt.(float64); !ok || ptFloat <= 0 {
			return fmt.Errorf("processing_time must be a positive number")
		}
	}
	
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); !ok || frFloat < 0 || frFloat > 1 {
			return fmt.Errorf("failure_rate must be a number between 0 and 1")
		}
	}
	
	if mqs, exists := properties["max_queue_size"]; exists {
		if mqsFloat, ok := mqs.(float64); !ok || mqsFloat <= 0 {
			return fmt.Errorf("max_queue_size must be a positive number")
		}
	}
	
	return nil
}

func (f *DefaultComponentFactory) validateLoadBalancerProperties(properties map[string]interface{}) error {
	if algo, exists := properties["algorithm"]; exists {
		if algoStr, ok := algo.(string); !ok || (algoStr != "round_robin" && algoStr != "least_connections" && algoStr != "weighted") {
			return fmt.Errorf("algorithm must be one of: round_robin, least_connections, weighted")
		}
	}
	
	if hci, exists := properties["health_check_interval"]; exists {
		if hciFloat, ok := hci.(float64); !ok || hciFloat <= 0 {
			return fmt.Errorf("health_check_interval must be a positive number")
		}
	}
	
	return nil
}

func (f *DefaultComponentFactory) validateCacheProperties(properties map[string]interface{}) error {
	if hr, exists := properties["hit_ratio"]; exists {
		if hrFloat, ok := hr.(float64); !ok || hrFloat < 0 || hrFloat > 1 {
			return fmt.Errorf("hit_ratio must be a number between 0 and 1")
		}
	}
	
	if at, exists := properties["access_time"]; exists {
		if atFloat, ok := at.(float64); !ok || atFloat <= 0 {
			return fmt.Errorf("access_time must be a positive number")
		}
	}
	
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); !ok || frFloat < 0 || frFloat > 1 {
			return fmt.Errorf("failure_rate must be a number between 0 and 1")
		}
	}
	
	if ms, exists := properties["max_size"]; exists {
		if msFloat, ok := ms.(float64); !ok || msFloat <= 0 {
			return fmt.Errorf("max_size must be a positive number")
		}
	}
	
	return nil
}

func (f *DefaultComponentFactory) validateAPIGatewayProperties(properties map[string]interface{}) error {
	if rl, exists := properties["routing_latency"]; exists {
		if rlFloat, ok := rl.(float64); !ok || rlFloat <= 0 {
			return fmt.Errorf("routing_latency must be a positive number")
		}
	}
	
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); !ok || frFloat < 0 || frFloat > 1 {
			return fmt.Errorf("failure_rate must be a number between 0 and 1")
		}
	}
	
	if mc, exists := properties["max_concurrency"]; exists {
		if mcFloat, ok := mc.(float64); !ok || mcFloat <= 0 {
			return fmt.Errorf("max_concurrency must be a positive number")
		}
	}
	
	return nil
}

