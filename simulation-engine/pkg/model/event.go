package model

import (
	"encoding/json"
	"time"
)

// EventType represents the type of simulation event
type EventType string

const (
	// Request events
	RequestArrival    EventType = "request_arrival"
	RequestProcessed  EventType = "request_processed"
	RequestCompleted  EventType = "request_completed"
	RequestFailed     EventType = "request_failed"
	
	// Component events
	ComponentStarted  EventType = "component_started"
	ComponentStopped  EventType = "component_stopped"
	ComponentFailed   EventType = "component_failed"
	
	// Network events
	NetworkLatency    EventType = "network_latency"
	NetworkPartition  EventType = "network_partition"
	NetworkRestore    EventType = "network_restore"
	
	// Database events
	DatabaseRead      EventType = "database_read"
	DatabaseWrite     EventType = "database_write"
	DatabaseQuery     EventType = "database_query"
	
	// Queue events
	MessageEnqueued   EventType = "message_enqueued"
	MessageDequeued   EventType = "message_dequeued"
	QueueFull         EventType = "queue_full"
	
	// Fault injection events
	FaultInjected     EventType = "fault_injected"
	FaultRecovered    EventType = "fault_recovered"
)

// Event represents a discrete event in the simulation
type Event struct {
	ID          string                 `json:"id"`
	Timestamp   float64               `json:"timestamp"`   // Simulation time
	Type        EventType             `json:"type"`
	ComponentID string                `json:"component_id"`
	Data        map[string]interface{} `json:"data"`
	Priority    int                   `json:"priority"`    // Lower values = higher priority
	CreatedAt   time.Time             `json:"created_at"`  // Real time when event was created
}

// NewEvent creates a new event with the given parameters
func NewEvent(id string, timestamp float64, eventType EventType, componentID string, data map[string]interface{}) *Event {
	if data == nil {
		data = make(map[string]interface{})
	}
	
	return &Event{
		ID:          id,
		Timestamp:   timestamp,
		Type:        eventType,
		ComponentID: componentID,
		Data:        data,
		Priority:    0, // Default priority
		CreatedAt:   time.Now(),
	}
}

// ToJSON converts the event to JSON string
func (e *Event) ToJSON() (string, error) {
	data, err := json.Marshal(e)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// FromJSON creates an event from JSON string
func FromJSON(jsonStr string) (*Event, error) {
	var event Event
	err := json.Unmarshal([]byte(jsonStr), &event)
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// Clone creates a deep copy of the event
func (e *Event) Clone() *Event {
	data := make(map[string]interface{})
	for k, v := range e.Data {
		data[k] = v
	}
	
	return &Event{
		ID:          e.ID,
		Timestamp:   e.Timestamp,
		Type:        e.Type,
		ComponentID: e.ComponentID,
		Data:        data,
		Priority:    e.Priority,
		CreatedAt:   e.CreatedAt,
	}
}

// SetPriority sets the priority of the event
func (e *Event) SetPriority(priority int) {
	e.Priority = priority
}

// GetDataValue safely retrieves a value from the event data
func (e *Event) GetDataValue(key string) (interface{}, bool) {
	value, exists := e.Data[key]
	return value, exists
}

// SetDataValue safely sets a value in the event data
func (e *Event) SetDataValue(key string, value interface{}) {
	if e.Data == nil {
		e.Data = make(map[string]interface{})
	}
	e.Data[key] = value
}

