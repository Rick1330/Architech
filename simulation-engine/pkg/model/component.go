package model

import (
	"context"
	"fmt"
)

// ComponentState represents the current state of a component
type ComponentState string

const (
	StateIdle       ComponentState = "idle"
	StateProcessing ComponentState = "processing"
	StateFailed     ComponentState = "failed"
	StateStopped    ComponentState = "stopped"
)

// ComponentType represents the type of component
type ComponentType string

const (
	TypeGenericService ComponentType = "generic_service"
	TypeDatabase       ComponentType = "database"
	TypeMessageQueue   ComponentType = "message_queue"
	TypeLoadBalancer   ComponentType = "load_balancer"
	TypeCache          ComponentType = "cache"
	TypeAPIGateway     ComponentType = "api_gateway"
)

// Component represents a simulated component in the system
type Component interface {
	// GetID returns the unique identifier of the component
	GetID() string
	
	// GetType returns the type of the component
	GetType() ComponentType
	
	// GetState returns the current state of the component
	GetState() ComponentState
	
	// HandleEvent processes an incoming event and returns resulting events
	HandleEvent(ctx context.Context, event *Event) ([]*Event, error)
	
	// Initialize sets up the component with given properties
	Initialize(properties map[string]interface{}) error
	
	// Start begins the component's operation
	Start(ctx context.Context) error
	
	// Stop gracefully shuts down the component
	Stop(ctx context.Context) error
	
	// GetMetrics returns current metrics for the component
	GetMetrics() map[string]interface{}
	
	// GetProperties returns the component's configuration properties
	GetProperties() map[string]interface{}
	
	// SetProperty updates a component property
	SetProperty(key string, value interface{}) error
	
	// Validate checks if the component configuration is valid
	Validate() error
}

// BaseComponent provides common functionality for all components
type BaseComponent struct {
	ID         string                 `json:"id"`
	Type       ComponentType          `json:"type"`
	State      ComponentState         `json:"state"`
	Properties map[string]interface{} `json:"properties"`
	Metrics    map[string]interface{} `json:"metrics"`
}

// NewBaseComponent creates a new base component
func NewBaseComponent(id string, componentType ComponentType) *BaseComponent {
	return &BaseComponent{
		ID:         id,
		Type:       componentType,
		State:      StateIdle,
		Properties: make(map[string]interface{}),
		Metrics:    make(map[string]interface{}),
	}
}

// GetID returns the component ID
func (bc *BaseComponent) GetID() string {
	return bc.ID
}

// GetType returns the component type
func (bc *BaseComponent) GetType() ComponentType {
	return bc.Type
}

// GetState returns the current state
func (bc *BaseComponent) GetState() ComponentState {
	return bc.State
}

// SetState updates the component state
func (bc *BaseComponent) SetState(state ComponentState) {
	bc.State = state
}

// GetProperties returns the component properties
func (bc *BaseComponent) GetProperties() map[string]interface{} {
	return bc.Properties
}

// SetProperty sets a property value
func (bc *BaseComponent) SetProperty(key string, value interface{}) error {
	if bc.Properties == nil {
		bc.Properties = make(map[string]interface{})
	}
	bc.Properties[key] = value
	return nil
}

// GetProperty gets a property value
func (bc *BaseComponent) GetProperty(key string) (interface{}, bool) {
	value, exists := bc.Properties[key]
	return value, exists
}

// GetMetrics returns current metrics
func (bc *BaseComponent) GetMetrics() map[string]interface{} {
	return bc.Metrics
}

// SetMetric sets a metric value
func (bc *BaseComponent) SetMetric(key string, value interface{}) {
	if bc.Metrics == nil {
		bc.Metrics = make(map[string]interface{})
	}
	bc.Metrics[key] = value
}

// IncrementMetric increments a numeric metric
func (bc *BaseComponent) IncrementMetric(key string) {
	if bc.Metrics == nil {
		bc.Metrics = make(map[string]interface{})
	}
	
	if current, exists := bc.Metrics[key]; exists {
		if val, ok := current.(int); ok {
			bc.Metrics[key] = val + 1
		} else if val, ok := current.(float64); ok {
			bc.Metrics[key] = val + 1.0
		} else {
			bc.Metrics[key] = 1
		}
	} else {
		bc.Metrics[key] = 1
	}
}

// Initialize sets up the component with properties
func (bc *BaseComponent) Initialize(properties map[string]interface{}) error {
	if properties != nil {
		bc.Properties = properties
	}
	return nil
}

// Start begins component operation
func (bc *BaseComponent) Start(ctx context.Context) error {
	bc.State = StateIdle
	return nil
}

// Stop gracefully shuts down the component
func (bc *BaseComponent) Stop(ctx context.Context) error {
	bc.State = StateStopped
	return nil
}

// Validate checks if the component configuration is valid
func (bc *BaseComponent) Validate() error {
	if bc.ID == "" {
		return fmt.Errorf("component ID cannot be empty")
	}
	if bc.Type == "" {
		return fmt.Errorf("component type cannot be empty")
	}
	return nil
}

// ComponentFactory creates components based on type
type ComponentFactory interface {
	CreateComponent(componentType ComponentType, id string, properties map[string]interface{}) (Component, error)
	GetSupportedTypes() []ComponentType
}


// GetMetric returns the value of a metric by key
func (bc *BaseComponent) GetMetric(key string) interface{} {
	if bc.Metrics == nil {
		return nil
	}
	return bc.Metrics[key]
}

