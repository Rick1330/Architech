package engine

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"
	
	"simulation-engine/pkg/model"
)

// SimulationState represents the current state of the simulation
type SimulationState string

const (
	StateInitialized SimulationState = "initialized"
	StateRunning     SimulationState = "running"
	StatePaused      SimulationState = "paused"
	StateStopped     SimulationState = "stopped"
	StateCompleted   SimulationState = "completed"
	StateError       SimulationState = "error"
)

// SimulationConfig holds configuration for the simulation
type SimulationConfig struct {
	MaxSimulationTime float64 `json:"max_simulation_time"`
	TimeStep          float64 `json:"time_step"`
	RealTimeMode      bool    `json:"real_time_mode"`
	MaxEvents         int     `json:"max_events"`
	LogLevel          string  `json:"log_level"`
}

// DefaultSimulationConfig returns a default configuration
func DefaultSimulationConfig() *SimulationConfig {
	return &SimulationConfig{
		MaxSimulationTime: 1000.0, // 1000 time units
		TimeStep:          0.1,    // 0.1 time units per step
		RealTimeMode:      false,
		MaxEvents:         10000,
		LogLevel:          "INFO",
	}
}

// SimulationEngine is the core simulation engine
type SimulationEngine struct {
	config         *SimulationConfig
	state          SimulationState
	currentTime    float64
	eventQueue     *EventQueue
	components     map[string]model.Component
	eventHandlers  map[model.EventType][]EventHandler
	metrics        *SimulationMetrics
	mutex          sync.RWMutex
	ctx            context.Context
	cancel         context.CancelFunc
	eventListeners []EventListener
}

// EventHandler is a function that handles specific event types
type EventHandler func(ctx context.Context, event *model.Event, engine *SimulationEngine) error

// EventListener is notified of all events processed by the engine
type EventListener interface {
	OnEvent(event *model.Event, engine *SimulationEngine)
}

// SimulationMetrics tracks simulation statistics
type SimulationMetrics struct {
	EventsProcessed   int64                      `json:"events_processed"`
	ComponentsActive  int                        `json:"components_active"`
	CurrentTime       float64                    `json:"current_time"`
	StartTime         time.Time                  `json:"start_time"`
	EndTime           time.Time                  `json:"end_time"`
	EventTypeStats    map[model.EventType]int64  `json:"event_type_stats"`
	ComponentStats    map[string]int64           `json:"component_stats"`
	ErrorCount        int64                      `json:"error_count"`
	mutex             sync.RWMutex
}

// NewSimulationEngine creates a new simulation engine
func NewSimulationEngine(config *SimulationConfig) *SimulationEngine {
	if config == nil {
		config = DefaultSimulationConfig()
	}
	
	ctx, cancel := context.WithCancel(context.Background())
	
	return &SimulationEngine{
		config:         config,
		state:          StateInitialized,
		currentTime:    0.0,
		eventQueue:     NewEventQueue(),
		components:     make(map[string]model.Component),
		eventHandlers:  make(map[model.EventType][]EventHandler),
		metrics:        &SimulationMetrics{
			EventTypeStats: make(map[model.EventType]int64),
			ComponentStats: make(map[string]int64),
		},
		ctx:            ctx,
		cancel:         cancel,
		eventListeners: make([]EventListener, 0),
	}
}

// AddComponent adds a component to the simulation
func (se *SimulationEngine) AddComponent(component model.Component) error {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.state == StateRunning {
		return fmt.Errorf("cannot add components while simulation is running")
	}
	
	if err := component.Validate(); err != nil {
		return fmt.Errorf("component validation failed: %w", err)
	}
	
	se.components[component.GetID()] = component
	log.Printf("Added component: %s (type: %s)", component.GetID(), component.GetType())
	return nil
}

// RemoveComponent removes a component from the simulation
func (se *SimulationEngine) RemoveComponent(componentID string) error {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.state == StateRunning {
		return fmt.Errorf("cannot remove components while simulation is running")
	}
	
	if _, exists := se.components[componentID]; !exists {
		return fmt.Errorf("component %s not found", componentID)
	}
	
	// Remove all events for this component
	se.eventQueue.RemoveEventsForComponent(componentID)
	delete(se.components, componentID)
	
	log.Printf("Removed component: %s", componentID)
	return nil
}

// GetComponent retrieves a component by ID
func (se *SimulationEngine) GetComponent(componentID string) (model.Component, bool) {
	se.mutex.RLock()
	defer se.mutex.RUnlock()
	
	component, exists := se.components[componentID]
	return component, exists
}

// GetAllComponents returns all components
func (se *SimulationEngine) GetAllComponents() map[string]model.Component {
	se.mutex.RLock()
	defer se.mutex.RUnlock()
	
	components := make(map[string]model.Component)
	for id, component := range se.components {
		components[id] = component
	}
	return components
}

// ScheduleEvent adds an event to the simulation queue
func (se *SimulationEngine) ScheduleEvent(event *model.Event) error {
	if event.Timestamp < se.currentTime {
		return fmt.Errorf("cannot schedule event in the past: event time %f < current time %f", 
			event.Timestamp, se.currentTime)
	}
	
	se.eventQueue.Enqueue(event)
	log.Printf("Scheduled event: %s at time %f", event.Type, event.Timestamp)
	return nil
}

// RegisterEventHandler registers a handler for a specific event type
func (se *SimulationEngine) RegisterEventHandler(eventType model.EventType, handler EventHandler) {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.eventHandlers[eventType] == nil {
		se.eventHandlers[eventType] = make([]EventHandler, 0)
	}
	se.eventHandlers[eventType] = append(se.eventHandlers[eventType], handler)
}

// AddEventListener adds an event listener
func (se *SimulationEngine) AddEventListener(listener EventListener) {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	se.eventListeners = append(se.eventListeners, listener)
}

// Start begins the simulation
func (se *SimulationEngine) Start() error {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.state == StateRunning {
		return fmt.Errorf("simulation is already running")
	}
	
	// Initialize all components
	for _, component := range se.components {
		if err := component.Start(se.ctx); err != nil {
			return fmt.Errorf("failed to start component %s: %w", component.GetID(), err)
		}
	}
	
	se.state = StateRunning
	se.metrics.StartTime = time.Now()
	se.metrics.ComponentsActive = len(se.components)
	
	log.Printf("Simulation started with %d components", len(se.components))
	
	// Start the main simulation loop in a goroutine
	go se.runSimulation()
	
	return nil
}

// Stop stops the simulation
func (se *SimulationEngine) Stop() error {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.state != StateRunning && se.state != StatePaused {
		return fmt.Errorf("simulation is not running")
	}
	
	se.cancel()
	se.state = StateStopped
	se.metrics.EndTime = time.Now()
	
	// Stop all components
	for _, component := range se.components {
		if err := component.Stop(se.ctx); err != nil {
			log.Printf("Error stopping component %s: %v", component.GetID(), err)
		}
	}
	
	log.Printf("Simulation stopped at time %f", se.currentTime)
	return nil
}

// Pause pauses the simulation
func (se *SimulationEngine) Pause() error {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.state != StateRunning {
		return fmt.Errorf("simulation is not running")
	}
	
	se.state = StatePaused
	log.Printf("Simulation paused at time %f", se.currentTime)
	return nil
}

// Resume resumes the simulation
func (se *SimulationEngine) Resume() error {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.state != StatePaused {
		return fmt.Errorf("simulation is not paused")
	}
	
	se.state = StateRunning
	log.Printf("Simulation resumed at time %f", se.currentTime)
	return nil
}

// GetState returns the current simulation state
func (se *SimulationEngine) GetState() SimulationState {
	se.mutex.RLock()
	defer se.mutex.RUnlock()
	return se.state
}

// GetCurrentTime returns the current simulation time
func (se *SimulationEngine) GetCurrentTime() float64 {
	se.mutex.RLock()
	defer se.mutex.RUnlock()
	return se.currentTime
}

// GetMetrics returns current simulation metrics
func (se *SimulationEngine) GetMetrics() *SimulationMetrics {
	se.metrics.mutex.RLock()
	defer se.metrics.mutex.RUnlock()
	
	// Create a copy to avoid race conditions
	metrics := &SimulationMetrics{
		EventsProcessed:  se.metrics.EventsProcessed,
		ComponentsActive: se.metrics.ComponentsActive,
		CurrentTime:      se.currentTime,
		StartTime:        se.metrics.StartTime,
		EndTime:          se.metrics.EndTime,
		ErrorCount:       se.metrics.ErrorCount,
		EventTypeStats:   make(map[model.EventType]int64),
		ComponentStats:   make(map[string]int64),
	}
	
	for k, v := range se.metrics.EventTypeStats {
		metrics.EventTypeStats[k] = v
	}
	for k, v := range se.metrics.ComponentStats {
		metrics.ComponentStats[k] = v
	}
	
	return metrics
}

// runSimulation is the main simulation loop
func (se *SimulationEngine) runSimulation() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Simulation panic: %v", r)
			se.mutex.Lock()
			se.state = StateError
			se.mutex.Unlock()
		}
	}()
	
	for {
		select {
		case <-se.ctx.Done():
			return
		default:
			if se.state != StateRunning {
				time.Sleep(100 * time.Millisecond)
				continue
			}
			
			// Check if simulation should end
			if se.currentTime >= se.config.MaxSimulationTime {
				se.mutex.Lock()
				se.state = StateCompleted
				se.metrics.EndTime = time.Now()
				se.mutex.Unlock()
				log.Printf("Simulation completed at time %f", se.currentTime)
				return
			}
			
			// Process next event
			event := se.eventQueue.Dequeue()
			if event == nil {
				// No more events, advance time
				se.currentTime += se.config.TimeStep
				if se.config.RealTimeMode {
					time.Sleep(time.Duration(se.config.TimeStep * float64(time.Second)))
				}
				continue
			}
			
			// Update current time to event time
			se.currentTime = event.Timestamp
			
			// Process the event
			if err := se.processEvent(event); err != nil {
				log.Printf("Error processing event %s: %v", event.ID, err)
				se.metrics.mutex.Lock()
				se.metrics.ErrorCount++
				se.metrics.mutex.Unlock()
			}
			
			// Update metrics
			se.updateMetrics(event)
			
			// Notify listeners
			for _, listener := range se.eventListeners {
				listener.OnEvent(event, se)
			}
			
			// Check if we've processed too many events
			if se.metrics.EventsProcessed >= int64(se.config.MaxEvents) {
				se.mutex.Lock()
				se.state = StateCompleted
				se.metrics.EndTime = time.Now()
				se.mutex.Unlock()
				log.Printf("Simulation completed after processing %d events", se.metrics.EventsProcessed)
				return
			}
		}
	}
}

// processEvent processes a single event
func (se *SimulationEngine) processEvent(event *model.Event) error {
	// First, let the target component handle the event
	if component, exists := se.components[event.ComponentID]; exists {
		resultEvents, err := component.HandleEvent(se.ctx, event)
		if err != nil {
			return fmt.Errorf("component %s failed to handle event: %w", event.ComponentID, err)
		}
		
		// Schedule any resulting events
		for _, resultEvent := range resultEvents {
			if err := se.ScheduleEvent(resultEvent); err != nil {
				log.Printf("Failed to schedule result event: %v", err)
			}
		}
	}
	
	// Then, call any registered event handlers
	if handlers, exists := se.eventHandlers[event.Type]; exists {
		for _, handler := range handlers {
			if err := handler(se.ctx, event, se); err != nil {
				log.Printf("Event handler failed for event type %s: %v", event.Type, err)
			}
		}
	}
	
	return nil
}

// updateMetrics updates simulation metrics
func (se *SimulationEngine) updateMetrics(event *model.Event) {
	se.metrics.mutex.Lock()
	defer se.metrics.mutex.Unlock()
	
	se.metrics.EventsProcessed++
	se.metrics.CurrentTime = se.currentTime
	se.metrics.EventTypeStats[event.Type]++
	se.metrics.ComponentStats[event.ComponentID]++
}

// Reset resets the simulation to initial state
func (se *SimulationEngine) Reset() error {
	se.mutex.Lock()
	defer se.mutex.Unlock()
	
	if se.state == StateRunning {
		return fmt.Errorf("cannot reset while simulation is running")
	}
	
	se.currentTime = 0.0
	se.state = StateInitialized
	se.eventQueue.Clear()
	
	// Reset metrics
	se.metrics.mutex.Lock()
	se.metrics.EventsProcessed = 0
	se.metrics.CurrentTime = 0.0
	se.metrics.ErrorCount = 0
	se.metrics.EventTypeStats = make(map[model.EventType]int64)
	se.metrics.ComponentStats = make(map[string]int64)
	se.metrics.mutex.Unlock()
	
	// Reset all components
	for _, component := range se.components {
		if err := component.Stop(se.ctx); err != nil {
			log.Printf("Error stopping component during reset: %v", err)
		}
	}
	
	log.Printf("Simulation reset")
	return nil
}

// GetQueueStats returns statistics about the event queue
func (se *SimulationEngine) GetQueueStats() map[string]interface{} {
	return se.eventQueue.Stats()
}


