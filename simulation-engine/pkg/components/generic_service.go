package components

import (
	"context"
	"fmt"
	"math/rand"
	"time"
	
	"simulation-engine/pkg/model"
)

// GenericService represents a generic microservice component
type GenericService struct {
	*model.BaseComponent
	ProcessingTime    float64 `json:"processing_time"`
	FailureRate       float64 `json:"failure_rate"`
	MaxConcurrency    int     `json:"max_concurrency"`
	CurrentLoad       int     `json:"current_load"`
	RequestsProcessed int64   `json:"requests_processed"`
	RequestsFailed    int64   `json:"requests_failed"`
}

// NewGenericService creates a new generic service component
func NewGenericService(id string) *GenericService {
	return &GenericService{
		BaseComponent:     model.NewBaseComponent(id, model.TypeGenericService),
		ProcessingTime:    1.0,  // Default 1 time unit
		FailureRate:       0.01, // Default 1% failure rate
		MaxConcurrency:    10,   // Default max 10 concurrent requests
		CurrentLoad:       0,
		RequestsProcessed: 0,
		RequestsFailed:    0,
	}
}

// Initialize sets up the service with properties
func (gs *GenericService) Initialize(properties map[string]interface{}) error {
	if err := gs.BaseComponent.Initialize(properties); err != nil {
		return err
	}
	
	// Set processing time
	if pt, exists := properties["processing_time"]; exists {
		if ptFloat, ok := pt.(float64); ok {
			gs.ProcessingTime = ptFloat
		}
	}
	
	// Set failure rate
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); ok {
			gs.FailureRate = frFloat
		}
	}
	
	// Set max concurrency
	if mc, exists := properties["max_concurrency"]; exists {
		if mcInt, ok := mc.(float64); ok {
			gs.MaxConcurrency = int(mcInt)
		}
	}
	
	return nil
}

// HandleEvent processes incoming events
func (gs *GenericService) HandleEvent(ctx context.Context, event *model.Event) ([]*model.Event, error) {
	var resultEvents []*model.Event
	
	switch event.Type {
	case model.RequestArrival:
		resultEvents = gs.handleRequestArrival(event)
	case model.RequestProcessed:
		resultEvents = gs.handleRequestProcessed(event)
	default:
		// Unknown event type, ignore
		return nil, nil
	}
	
	// Update metrics
	gs.updateMetrics(event)
	
	return resultEvents, nil
}

// handleRequestArrival processes incoming requests
func (gs *GenericService) handleRequestArrival(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if service can handle more requests
	if gs.CurrentLoad >= gs.MaxConcurrency {
		// Service is at capacity, reject request
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("fail_%s_%d", gs.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			gs.GetID(),
			map[string]interface{}{
				"reason":     "service_overloaded",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		gs.RequestsFailed++
		return resultEvents
	}
	
	// Accept the request
	gs.CurrentLoad++
	gs.SetState(model.StateProcessing)
	
	// Simulate processing failure
	if rand.Float64() < gs.FailureRate {
		// Request fails
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("fail_%s_%d", gs.GetID(), time.Now().UnixNano()),
			event.Timestamp + 0.1, // Fail quickly
			model.RequestFailed,
			gs.GetID(),
			map[string]interface{}{
				"reason":     "processing_error",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		gs.RequestsFailed++
		gs.CurrentLoad--
		
		if gs.CurrentLoad == 0 {
			gs.SetState(model.StateIdle)
		}
		
		return resultEvents
	}
	
	// Schedule request completion
	completionTime := event.Timestamp + gs.ProcessingTime
	requestID, _ := event.GetDataValue("request_id")
	completionEvent := model.NewEvent(
		fmt.Sprintf("complete_%s_%d", gs.GetID(), time.Now().UnixNano()),
		completionTime,
		model.RequestProcessed,
		gs.GetID(),
		map[string]interface{}{
			"request_id":      requestID,
			"processing_time": gs.ProcessingTime,
		},
	)
	
	resultEvents = append(resultEvents, completionEvent)
	return resultEvents
}

// handleRequestProcessed processes request completion
func (gs *GenericService) handleRequestProcessed(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Decrease current load
	gs.CurrentLoad--
	gs.RequestsProcessed++
	
	// Update state
	if gs.CurrentLoad == 0 {
		gs.SetState(model.StateIdle)
	}
	
	// Create completion event
	requestID, _ := event.GetDataValue("request_id")
	processingTime, _ := event.GetDataValue("processing_time")
	completedEvent := model.NewEvent(
		fmt.Sprintf("completed_%s_%d", gs.GetID(), time.Now().UnixNano()),
		event.Timestamp,
		model.RequestCompleted,
		gs.GetID(),
		map[string]interface{}{
			"request_id":      requestID,
			"processing_time": processingTime,
		},
	)
	
	resultEvents = append(resultEvents, completedEvent)
	return resultEvents
}

// updateMetrics updates component metrics
func (gs *GenericService) updateMetrics(event *model.Event) {
	gs.SetMetric("current_load", gs.CurrentLoad)
	gs.SetMetric("requests_processed", gs.RequestsProcessed)
	gs.SetMetric("requests_failed", gs.RequestsFailed)
	gs.SetMetric("processing_time", gs.ProcessingTime)
	gs.SetMetric("failure_rate", gs.FailureRate)
	gs.SetMetric("max_concurrency", gs.MaxConcurrency)
	
	// Calculate success rate
	total := gs.RequestsProcessed + gs.RequestsFailed
	if total > 0 {
		successRate := float64(gs.RequestsProcessed) / float64(total)
		gs.SetMetric("success_rate", successRate)
	}
	
	// Calculate utilization
	utilization := float64(gs.CurrentLoad) / float64(gs.MaxConcurrency)
	gs.SetMetric("utilization", utilization)
}

// Start begins the service operation
func (gs *GenericService) Start(ctx context.Context) error {
	if err := gs.BaseComponent.Start(ctx); err != nil {
		return err
	}
	
	gs.CurrentLoad = 0
	gs.RequestsProcessed = 0
	gs.RequestsFailed = 0
	gs.SetState(model.StateIdle)
	
	return nil
}

// Stop gracefully shuts down the service
func (gs *GenericService) Stop(ctx context.Context) error {
	gs.SetState(model.StateStopped)
	return gs.BaseComponent.Stop(ctx)
}

// Validate checks if the service configuration is valid
func (gs *GenericService) Validate() error {
	if err := gs.BaseComponent.Validate(); err != nil {
		return err
	}
	
	if gs.ProcessingTime <= 0 {
		return fmt.Errorf("processing time must be positive")
	}
	
	if gs.FailureRate < 0 || gs.FailureRate > 1 {
		return fmt.Errorf("failure rate must be between 0 and 1")
	}
	
	if gs.MaxConcurrency <= 0 {
		return fmt.Errorf("max concurrency must be positive")
	}
	
	return nil
}

// GetCurrentLoad returns the current load
func (gs *GenericService) GetCurrentLoad() int {
	return gs.CurrentLoad
}

// GetUtilization returns the current utilization percentage
func (gs *GenericService) GetUtilization() float64 {
	return float64(gs.CurrentLoad) / float64(gs.MaxConcurrency)
}

// IsOverloaded returns true if the service is at capacity
func (gs *GenericService) IsOverloaded() bool {
	return gs.CurrentLoad >= gs.MaxConcurrency
}

// GetSuccessRate returns the success rate
func (gs *GenericService) GetSuccessRate() float64 {
	total := gs.RequestsProcessed + gs.RequestsFailed
	if total == 0 {
		return 1.0 // No requests processed yet, assume 100% success
	}
	return float64(gs.RequestsProcessed) / float64(total)
}

// SetProcessingTime updates the processing time
func (gs *GenericService) SetProcessingTime(processingTime float64) error {
	if processingTime <= 0 {
		return fmt.Errorf("processing time must be positive")
	}
	gs.ProcessingTime = processingTime
	return nil
}

// SetFailureRate updates the failure rate
func (gs *GenericService) SetFailureRate(failureRate float64) error {
	if failureRate < 0 || failureRate > 1 {
		return fmt.Errorf("failure rate must be between 0 and 1")
	}
	gs.FailureRate = failureRate
	return nil
}

// SetMaxConcurrency updates the maximum concurrency
func (gs *GenericService) SetMaxConcurrency(maxConcurrency int) error {
	if maxConcurrency <= 0 {
		return fmt.Errorf("max concurrency must be positive")
	}
	gs.MaxConcurrency = maxConcurrency
	return nil
}



// GetMetric returns the value of a metric by key
func (gs *GenericService) GetMetric(key string) interface{} {
    if gs.BaseComponent == nil {
        return nil
    }
    return gs.BaseComponent.GetMetric(key)
}

// SetMetric stores a metric value by key
func (gs *GenericService) SetMetric(key string, value interface{}) {
    if gs.BaseComponent != nil {
        gs.BaseComponent.SetMetric(key, value)
    }
}


