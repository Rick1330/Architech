package components

import (
	"context"
	"fmt"
	"math/rand"
	"time"
	
	"simulation-engine/pkg/model"
)

// MessageQueue represents a message queue component
type MessageQueue struct {
	*model.BaseComponent
	ProcessingTime    float64 `json:"processing_time"`
	FailureRate       float64 `json:"failure_rate"`
	MaxQueueSize      int     `json:"max_queue_size"`
	CurrentQueueSize  int     `json:"current_queue_size"`
	MessagesEnqueued  int64   `json:"messages_enqueued"`
	MessagesDequeued  int64   `json:"messages_dequeued"`
	MessagesFailed    int64   `json:"messages_failed"`
	MessagesDropped   int64   `json:"messages_dropped"`
}

// NewMessageQueue creates a new message queue component
func NewMessageQueue(id string) *MessageQueue {
	return &MessageQueue{
		BaseComponent:    model.NewBaseComponent(id, model.TypeMessageQueue),
		ProcessingTime:   0.1,  // Default 0.1 time units
		FailureRate:      0.001, // Default 0.1% failure rate
		MaxQueueSize:     1000,  // Default max 1000 messages
		CurrentQueueSize: 0,
		MessagesEnqueued: 0,
		MessagesDequeued: 0,
		MessagesFailed:   0,
		MessagesDropped:  0,
	}
}

// Initialize sets up the message queue with properties
func (mq *MessageQueue) Initialize(properties map[string]interface{}) error {
	if err := mq.BaseComponent.Initialize(properties); err != nil {
		return err
	}
	
	// Set processing time
	if pt, exists := properties["processing_time"]; exists {
		if ptFloat, ok := pt.(float64); ok {
			mq.ProcessingTime = ptFloat
		}
	}
	
	// Set failure rate
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); ok {
			mq.FailureRate = frFloat
		}
	}
	
	// Set max queue size
	if mqs, exists := properties["max_queue_size"]; exists {
		if mqsInt, ok := mqs.(float64); ok {
			mq.MaxQueueSize = int(mqsInt)
		}
	}
	
	return nil
}

// HandleEvent processes incoming events
func (mq *MessageQueue) HandleEvent(ctx context.Context, event *model.Event) ([]*model.Event, error) {
	var resultEvents []*model.Event
	
	switch event.Type {
	case model.MessageEnqueued:
		resultEvents = mq.handleMessageEnqueue(event)
	case model.MessageDequeued:
		resultEvents = mq.handleMessageDequeue(event)
	default:
		// Unknown event type, ignore
		return nil, nil
	}
	
	// Update metrics
	mq.updateMetrics(event)
	
	return resultEvents, nil
}

// handleMessageEnqueue processes message enqueue operations
func (mq *MessageQueue) handleMessageEnqueue(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if queue is full
	if mq.CurrentQueueSize >= mq.MaxQueueSize {
		// Queue is full, drop message
		messageID, _ := event.GetDataValue("message_id")
		dropEvent := model.NewEvent(
			fmt.Sprintf("drop_%s_%d", mq.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			mq.GetID(),
			map[string]interface{}{
				"reason":     "queue_full",
				"operation":  "enqueue",
				"message_id": messageID,
			},
		)
		resultEvents = append(resultEvents, dropEvent)
		mq.MessagesDropped++
		return resultEvents
	}
	
	// Simulate enqueue failure
	if rand.Float64() < mq.FailureRate {
		// Enqueue fails
		messageID, _ := event.GetDataValue("message_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("enqueue_fail_%s_%d", mq.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			mq.GetID(),
			map[string]interface{}{
				"reason":     "enqueue_error",
				"operation":  "enqueue",
				"message_id": messageID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		mq.MessagesFailed++
		return resultEvents
	}
	
	// Successfully enqueue message
	mq.CurrentQueueSize++
	mq.MessagesEnqueued++
	mq.SetState(model.StateProcessing)
	
	// Create enqueue success event
	messageID, _ := event.GetDataValue("message_id")
	successEvent := model.NewEvent(
		fmt.Sprintf("enqueue_success_%s_%d", mq.GetID(), time.Now().UnixNano()),
		event.Timestamp + mq.ProcessingTime,
		model.RequestCompleted,
		mq.GetID(),
		map[string]interface{}{
			"operation":       "enqueue",
			"message_id":      messageID,
			"queue_size":      mq.CurrentQueueSize,
			"processing_time": mq.ProcessingTime,
		},
	)
	
	resultEvents = append(resultEvents, successEvent)
	
	// If queue was empty, it's now ready for dequeue
	if mq.CurrentQueueSize == 1 {
		// Schedule automatic dequeue after a short delay
		messageID, _ := event.GetDataValue("message_id")
		dequeueEvent := model.NewEvent(
			fmt.Sprintf("auto_dequeue_%s_%d", mq.GetID(), time.Now().UnixNano()),
			event.Timestamp + mq.ProcessingTime + 0.01,
			model.MessageDequeued,
			mq.GetID(),
			map[string]interface{}{
				"message_id": messageID,
				"auto":       true,
			},
		)
		resultEvents = append(resultEvents, dequeueEvent)
	}
	
	return resultEvents
}

// handleMessageDequeue processes message dequeue operations
func (mq *MessageQueue) handleMessageDequeue(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	
	// Check if queue is empty
	if mq.CurrentQueueSize <= 0 {
		// Queue is empty, cannot dequeue
		messageID, _ := event.GetDataValue("message_id")
		emptyEvent := model.NewEvent(
			fmt.Sprintf("empty_%s_%d", mq.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			mq.GetID(),
			map[string]interface{}{
				"reason":     "queue_empty",
				"operation":  "dequeue",
				"message_id": messageID,
			},
		)
		resultEvents = append(resultEvents, emptyEvent)
		return resultEvents
	}
	
	// Simulate dequeue failure
	if rand.Float64() < mq.FailureRate {
		// Dequeue fails
		messageID, _ := event.GetDataValue("message_id")
		failEvent := model.NewEvent(
			fmt.Sprintf("dequeue_fail_%s_%d", mq.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			mq.GetID(),
			map[string]interface{}{
				"reason":     "dequeue_error",
				"operation":  "dequeue",
				"message_id": messageID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		mq.MessagesFailed++
		return resultEvents
	}
	
	// Successfully dequeue message
	mq.CurrentQueueSize--
	mq.MessagesDequeued++
	
	// Update state
	if mq.CurrentQueueSize == 0 {
		mq.SetState(model.StateIdle)
	}
	
	// Create dequeue success event
	messageID, _ := event.GetDataValue("message_id")
	successEvent := model.NewEvent(
		fmt.Sprintf("dequeue_success_%s_%d", mq.GetID(), time.Now().UnixNano()),
		event.Timestamp + mq.ProcessingTime,
		model.RequestCompleted,
		mq.GetID(),
		map[string]interface{}{
			"operation":       "dequeue",
			"message_id":      messageID,
			"queue_size":      mq.CurrentQueueSize,
			"processing_time": mq.ProcessingTime,
		},
	)
	
	resultEvents = append(resultEvents, successEvent)
	
	return resultEvents
}

// updateMetrics updates component metrics
func (mq *MessageQueue) updateMetrics(event *model.Event) {
	mq.SetMetric("current_queue_size", mq.CurrentQueueSize)
	mq.SetMetric("messages_enqueued", mq.MessagesEnqueued)
	mq.SetMetric("messages_dequeued", mq.MessagesDequeued)
	mq.SetMetric("messages_failed", mq.MessagesFailed)
	mq.SetMetric("messages_dropped", mq.MessagesDropped)
	mq.SetMetric("processing_time", mq.ProcessingTime)
	mq.SetMetric("failure_rate", mq.FailureRate)
	mq.SetMetric("max_queue_size", mq.MaxQueueSize)
	
	// Calculate success rate
	total := mq.MessagesEnqueued + mq.MessagesDequeued + mq.MessagesFailed + mq.MessagesDropped
	if total > 0 {
		successful := mq.MessagesEnqueued + mq.MessagesDequeued
		successRate := float64(successful) / float64(total)
		mq.SetMetric("success_rate", successRate)
	}
	
	// Calculate queue utilization
	utilization := float64(mq.CurrentQueueSize) / float64(mq.MaxQueueSize)
	mq.SetMetric("queue_utilization", utilization)
	
	// Calculate throughput (messages per time unit)
	if mq.ProcessingTime > 0 {
		throughput := 1.0 / mq.ProcessingTime
		mq.SetMetric("throughput", throughput)
	}
}

// Start begins the message queue operation
func (mq *MessageQueue) Start(ctx context.Context) error {
	if err := mq.BaseComponent.Start(ctx); err != nil {
		return err
	}
	
	mq.CurrentQueueSize = 0
	mq.MessagesEnqueued = 0
	mq.MessagesDequeued = 0
	mq.MessagesFailed = 0
	mq.MessagesDropped = 0
	mq.SetState(model.StateIdle)
	
	return nil
}

// Stop gracefully shuts down the message queue
func (mq *MessageQueue) Stop(ctx context.Context) error {
	mq.SetState(model.StateStopped)
	return mq.BaseComponent.Stop(ctx)
}

// Validate checks if the message queue configuration is valid
func (mq *MessageQueue) Validate() error {
	if err := mq.BaseComponent.Validate(); err != nil {
		return err
	}
	
	if mq.ProcessingTime <= 0 {
		return fmt.Errorf("processing time must be positive")
	}
	
	if mq.FailureRate < 0 || mq.FailureRate > 1 {
		return fmt.Errorf("failure rate must be between 0 and 1")
	}
	
	if mq.MaxQueueSize <= 0 {
		return fmt.Errorf("max queue size must be positive")
	}
	
	return nil
}

// GetQueueUtilization returns the current queue utilization percentage
func (mq *MessageQueue) GetQueueUtilization() float64 {
	return float64(mq.CurrentQueueSize) / float64(mq.MaxQueueSize)
}

// IsFull returns true if the queue is at capacity
func (mq *MessageQueue) IsFull() bool {
	return mq.CurrentQueueSize >= mq.MaxQueueSize
}

// IsEmpty returns true if the queue is empty
func (mq *MessageQueue) IsEmpty() bool {
	return mq.CurrentQueueSize == 0
}

// GetSuccessRate returns the success rate
func (mq *MessageQueue) GetSuccessRate() float64 {
	total := mq.MessagesEnqueued + mq.MessagesDequeued + mq.MessagesFailed + mq.MessagesDropped
	if total == 0 {
		return 1.0 // No operations processed yet, assume 100% success
	}
	successful := mq.MessagesEnqueued + mq.MessagesDequeued
	return float64(successful) / float64(total)
}

// GetThroughput returns the theoretical throughput
func (mq *MessageQueue) GetThroughput() float64 {
	if mq.ProcessingTime <= 0 {
		return 0
	}
	return 1.0 / mq.ProcessingTime
}

// EnqueueMessage manually enqueues a message (for testing)
func (mq *MessageQueue) EnqueueMessage(messageID string, timestamp float64) *model.Event {
	return model.NewEvent(
		fmt.Sprintf("enqueue_%s_%s", mq.GetID(), messageID),
		timestamp,
		model.MessageEnqueued,
		mq.GetID(),
		map[string]interface{}{
			"message_id": messageID,
		},
	)
}

// DequeueMessage manually dequeues a message (for testing)
func (mq *MessageQueue) DequeueMessage(messageID string, timestamp float64) *model.Event {
	return model.NewEvent(
		fmt.Sprintf("dequeue_%s_%s", mq.GetID(), messageID),
		timestamp,
		model.MessageDequeued,
		mq.GetID(),
		map[string]interface{}{
			"message_id": messageID,
		},
	)
}

