package components

import (
	"context"
	"fmt"
	"math/rand"
	"time"
	
	"simulation-engine/pkg/model"
)

// Database represents a database component
type Database struct {
	*model.BaseComponent
	ReadLatency       float64 `json:"read_latency"`
	WriteLatency      float64 `json:"write_latency"`
	QueryLatency      float64 `json:"query_latency"`
	FailureRate       float64 `json:"failure_rate"`
	MaxConnections    int     `json:"max_connections"`
	CurrentConnections int    `json:"current_connections"`
	ReadsProcessed    int64   `json:"reads_processed"`
	WritesProcessed   int64   `json:"writes_processed"`
	QueriesProcessed  int64   `json:"queries_processed"`
	OperationsFailed  int64   `json:"operations_failed"`
}

// NewDatabase creates a new database component
func NewDatabase(id string) *Database {
	return &Database{
		BaseComponent:      model.NewBaseComponent(id, model.TypeDatabase),
		ReadLatency:        0.1,  // Default 0.1 time units
		WriteLatency:       0.2,  // Default 0.2 time units
		QueryLatency:       0.5,  // Default 0.5 time units
		FailureRate:        0.001, // Default 0.1% failure rate
		MaxConnections:     100,   // Default max 100 connections
		CurrentConnections: 0,
		ReadsProcessed:     0,
		WritesProcessed:    0,
		QueriesProcessed:   0,
		OperationsFailed:   0,
	}
}

// Initialize sets up the database with properties
func (db *Database) Initialize(properties map[string]interface{}) error {
	if err := db.BaseComponent.Initialize(properties); err != nil {
		return err
	}
	
	// Set read latency
	if rl, exists := properties["read_latency"]; exists {
		if rlFloat, ok := rl.(float64); ok {
			db.ReadLatency = rlFloat
		}
	}
	
	// Set write latency
	if wl, exists := properties["write_latency"]; exists {
		if wlFloat, ok := wl.(float64); ok {
			db.WriteLatency = wlFloat
		}
	}
	
	// Set query latency
	if ql, exists := properties["query_latency"]; exists {
		if qlFloat, ok := ql.(float64); ok {
			db.QueryLatency = qlFloat
		}
	}
	
	// Set failure rate
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); ok {
			db.FailureRate = frFloat
		}
	}
	
	// Set max connections
	if mc, exists := properties["max_connections"]; exists {
		if mcInt, ok := mc.(float64); ok {
			db.MaxConnections = int(mcInt)
		}
	}
	
	return nil
}

// HandleEvent processes incoming events
func (db *Database) HandleEvent(ctx context.Context, event *model.Event) ([]*model.Event, error) {
	var resultEvents []*model.Event
	
	switch event.Type {
	case model.DatabaseRead:
		resultEvents = db.handleDatabaseRead(event)
	case model.DatabaseWrite:
		resultEvents = db.handleDatabaseWrite(event)
	case model.DatabaseQuery:
		resultEvents = db.handleDatabaseQuery(event)
	default:
		// Unknown event type, ignore
		return nil, nil
	}
	
	// Update metrics
	db.updateMetrics(event)
	
	return resultEvents, nil
}

// handleDatabaseRead processes database read operations
func (db *Database) handleDatabaseRead(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if database can handle more connections
	if db.CurrentConnections >= db.MaxConnections {
		// Database is at capacity, reject operation
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("read_fail_%s_%d", db.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			db.GetID(),
			map[string]interface{}{
				"reason":     "connection_limit_exceeded",
				"operation":  "read",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		db.OperationsFailed++
		return resultEvents
	}
	
	// Accept the read operation
	db.CurrentConnections++
	db.SetState(model.StateProcessing)
	
	// Simulate operation failure
	if rand.Float64() < db.FailureRate {
		// Operation fails
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("read_fail_%s_%d", db.GetID(), time.Now().UnixNano()),
			event.Timestamp + 0.01, // Fail quickly
			model.RequestFailed,
			db.GetID(),
			map[string]interface{}{
				"reason":     "database_error",
				"operation":  "read",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		db.OperationsFailed++
		db.CurrentConnections--
		
		if db.CurrentConnections == 0 {
			db.SetState(model.StateIdle)
		}
		
		return resultEvents
	}
	
	// Schedule read completion
	completionTime := event.Timestamp + db.ReadLatency
	requestID, _ := event.GetDataValue("request_id")
	dataSize, _ := event.GetDataValue("data_size")
	completionEvent := model.NewEvent(
		fmt.Sprintf("read_complete_%s_%d", db.GetID(), time.Now().UnixNano()),
		completionTime,
		model.RequestCompleted,
		db.GetID(),
		map[string]interface{}{
			"operation":    "read",
			"request_id":   requestID,
			"latency":      db.ReadLatency,
			"data_size":    dataSize,
		},
	)
	
	resultEvents = append(resultEvents, completionEvent)
	db.ReadsProcessed++
	db.CurrentConnections--
	
	if db.CurrentConnections == 0 {
		db.SetState(model.StateIdle)
	}
	
	return resultEvents
}

// handleDatabaseWrite processes database write operations
func (db *Database) handleDatabaseWrite(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if database can handle more connections
	if db.CurrentConnections >= db.MaxConnections {
		// Database is at capacity, reject operation
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("write_fail_%s_%d", db.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			db.GetID(),
			map[string]interface{}{
				"reason":     "connection_limit_exceeded",
				"operation":  "write",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		db.OperationsFailed++
		return resultEvents
	}
	
	// Accept the write operation
	db.CurrentConnections++
	db.SetState(model.StateProcessing)
	
	// Simulate operation failure
	if rand.Float64() < db.FailureRate {
		// Operation fails
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("write_fail_%s_%d", db.GetID(), time.Now().UnixNano()),
			event.Timestamp + 0.01, // Fail quickly
			model.RequestFailed,
			db.GetID(),
			map[string]interface{}{
				"reason":     "database_error",
				"operation":  "write",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		db.OperationsFailed++
		db.CurrentConnections--
		
		if db.CurrentConnections == 0 {
			db.SetState(model.StateIdle)
		}
		
		return resultEvents
	}
	
	// Schedule write completion
	completionTime := event.Timestamp + db.WriteLatency
	requestID, _ := event.GetDataValue("request_id")
	dataSize, _ := event.GetDataValue("data_size")
	completionEvent := model.NewEvent(
		fmt.Sprintf("write_complete_%s_%d", db.GetID(), time.Now().UnixNano()),
		completionTime,
		model.RequestCompleted,
		db.GetID(),
		map[string]interface{}{
			"operation":    "write",
			"request_id":   requestID,
			"latency":      db.WriteLatency,
			"data_size":    dataSize,
		},
	)
	
	resultEvents = append(resultEvents, completionEvent)
	db.WritesProcessed++
	db.CurrentConnections--
	
	if db.CurrentConnections == 0 {
		db.SetState(model.StateIdle)
	}
	
	return resultEvents
}

// handleDatabaseQuery processes database query operations
func (db *Database) handleDatabaseQuery(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if database can handle more connections
	if db.CurrentConnections >= db.MaxConnections {
		// Database is at capacity, reject operation
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("query_fail_%s_%d", db.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			db.GetID(),
			map[string]interface{}{
				"reason":     "connection_limit_exceeded",
				"operation":  "query",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		db.OperationsFailed++
		return resultEvents
	}
	
	// Accept the query operation
	db.CurrentConnections++
	db.SetState(model.StateProcessing)
	
	// Simulate operation failure
	if rand.Float64() < db.FailureRate {
		// Operation fails
		requestID, _ := event.GetDataValue("request_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("query_fail_%s_%d", db.GetID(), time.Now().UnixNano()),
			event.Timestamp + 0.01, // Fail quickly
			model.RequestFailed,
			db.GetID(),
			map[string]interface{}{
				"reason":     "database_error",
				"operation":  "query",
				"request_id": requestID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		db.OperationsFailed++
		db.CurrentConnections--
		
		if db.CurrentConnections == 0 {
			db.SetState(model.StateIdle)
		}
		
		return resultEvents
	}
	
	// Schedule query completion
	completionTime := event.Timestamp + db.QueryLatency
	requestID, _ := event.GetDataValue("request_id")
	queryType, _ := event.GetDataValue("query_type")
	resultSize, _ := event.GetDataValue("result_size")
	completionEvent := model.NewEvent(
		fmt.Sprintf("query_complete_%s_%d", db.GetID(), time.Now().UnixNano()),
		completionTime,
		model.RequestCompleted,
		db.GetID(),
		map[string]interface{}{
			"operation":    "query",
			"request_id":   requestID,
			"latency":      db.QueryLatency,
			"query_type":   queryType,
			"result_size":  resultSize,
		},
	)
	
	resultEvents = append(resultEvents, completionEvent)
	db.QueriesProcessed++
	db.CurrentConnections--
	
	if db.CurrentConnections == 0 {
		db.SetState(model.StateIdle)
	}
	
	return resultEvents
}

// updateMetrics updates component metrics
func (db *Database) updateMetrics(event *model.Event) {
	db.SetMetric("current_connections", db.CurrentConnections)
	db.SetMetric("reads_processed", db.ReadsProcessed)
	db.SetMetric("writes_processed", db.WritesProcessed)
	db.SetMetric("queries_processed", db.QueriesProcessed)
	db.SetMetric("operations_failed", db.OperationsFailed)
	db.SetMetric("read_latency", db.ReadLatency)
	db.SetMetric("write_latency", db.WriteLatency)
	db.SetMetric("query_latency", db.QueryLatency)
	db.SetMetric("failure_rate", db.FailureRate)
	db.SetMetric("max_connections", db.MaxConnections)
	
	// Calculate success rate
	total := db.ReadsProcessed + db.WritesProcessed + db.QueriesProcessed + db.OperationsFailed
	if total > 0 {
		successRate := float64(db.ReadsProcessed + db.WritesProcessed + db.QueriesProcessed) / float64(total)
		db.SetMetric("success_rate", successRate)
	}
	
	// Calculate connection utilization
	utilization := float64(db.CurrentConnections) / float64(db.MaxConnections)
	db.SetMetric("connection_utilization", utilization)
}

// Start begins the database operation
func (db *Database) Start(ctx context.Context) error {
	if err := db.BaseComponent.Start(ctx); err != nil {
		return err
	}
	
	db.CurrentConnections = 0
	db.ReadsProcessed = 0
	db.WritesProcessed = 0
	db.QueriesProcessed = 0
	db.OperationsFailed = 0
	db.SetState(model.StateIdle)
	
	return nil
}

// Stop gracefully shuts down the database
func (db *Database) Stop(ctx context.Context) error {
	db.SetState(model.StateStopped)
	return db.BaseComponent.Stop(ctx)
}

// Validate checks if the database configuration is valid
func (db *Database) Validate() error {
	if err := db.BaseComponent.Validate(); err != nil {
		return err
	}
	
	if db.ReadLatency <= 0 {
		return fmt.Errorf("read latency must be positive")
	}
	
	if db.WriteLatency <= 0 {
		return fmt.Errorf("write latency must be positive")
	}
	
	if db.QueryLatency <= 0 {
		return fmt.Errorf("query latency must be positive")
	}
	
	if db.FailureRate < 0 || db.FailureRate > 1 {
		return fmt.Errorf("failure rate must be between 0 and 1")
	}
	
	if db.MaxConnections <= 0 {
		return fmt.Errorf("max connections must be positive")
	}
	
	return nil
}

// GetConnectionUtilization returns the current connection utilization percentage
func (db *Database) GetConnectionUtilization() float64 {
	return float64(db.CurrentConnections) / float64(db.MaxConnections)
}

// IsOverloaded returns true if the database is at capacity
func (db *Database) IsOverloaded() bool {
	return db.CurrentConnections >= db.MaxConnections
}

// GetSuccessRate returns the success rate
func (db *Database) GetSuccessRate() float64 {
	total := db.ReadsProcessed + db.WritesProcessed + db.QueriesProcessed + db.OperationsFailed
	if total == 0 {
		return 1.0 // No operations processed yet, assume 100% success
	}
	successful := db.ReadsProcessed + db.WritesProcessed + db.QueriesProcessed
	return float64(successful) / float64(total)
}

