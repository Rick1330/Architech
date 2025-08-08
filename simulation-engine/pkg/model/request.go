package model

import (
	"time"
)

// RequestStatus represents the current status of a request
type RequestStatus string

const (
	RequestPending    RequestStatus = "pending"
	RequestProcessing RequestStatus = "processing"
	RequestComplete   RequestStatus = "completed"
	RequestFail       RequestStatus = "failed"
	RequestTimeout    RequestStatus = "timeout"
)

// RequestType represents the type of request
type RequestType string

const (
	HTTPRequest     RequestType = "http_request"
	DBQuery         RequestType = "database_query"
	MessageSend     RequestType = "message_send"
	CacheOperation  RequestType = "cache_operation"
	FileOperation   RequestType = "file_operation"
)

// Request represents a request flowing through the system
type Request struct {
	ID            string                 `json:"id"`
	Type          RequestType            `json:"type"`
	Status        RequestStatus          `json:"status"`
	SourceID      string                 `json:"source_id"`      // Component that initiated the request
	TargetID      string                 `json:"target_id"`      // Component that should handle the request
	Payload       map[string]interface{} `json:"payload"`        // Request data
	Headers       map[string]string      `json:"headers"`        // Request headers/metadata
	CreatedAt     float64               `json:"created_at"`     // Simulation time when request was created
	StartedAt     float64               `json:"started_at"`     // Simulation time when processing started
	CompletedAt   float64               `json:"completed_at"`   // Simulation time when request completed
	Timeout       float64               `json:"timeout"`        // Maximum processing time allowed
	Priority      int                   `json:"priority"`       // Request priority (lower = higher priority)
	RetryCount    int                   `json:"retry_count"`    // Number of retry attempts
	MaxRetries    int                   `json:"max_retries"`    // Maximum retry attempts allowed
	TraceID       string                `json:"trace_id"`       // Distributed tracing ID
	SpanID        string                `json:"span_id"`        // Span ID for tracing
	ParentSpanID  string                `json:"parent_span_id"` // Parent span ID
	RealCreatedAt time.Time             `json:"real_created_at"` // Real time when request was created
}

// NewRequest creates a new request
func NewRequest(id string, requestType RequestType, sourceID, targetID string) *Request {
	return &Request{
		ID:            id,
		Type:          requestType,
		Status:        RequestPending,
		SourceID:      sourceID,
		TargetID:      targetID,
		Payload:       make(map[string]interface{}),
		Headers:       make(map[string]string),
		CreatedAt:     0, // Will be set by the simulation engine
		Priority:      0,
		RetryCount:    0,
		MaxRetries:    3,
		RealCreatedAt: time.Now(),
	}
}

// SetPayload sets the request payload
func (r *Request) SetPayload(payload map[string]interface{}) {
	r.Payload = payload
}

// GetPayloadValue safely retrieves a value from the request payload
func (r *Request) GetPayloadValue(key string) (interface{}, bool) {
	value, exists := r.Payload[key]
	return value, exists
}

// SetPayloadValue safely sets a value in the request payload
func (r *Request) SetPayloadValue(key string, value interface{}) {
	if r.Payload == nil {
		r.Payload = make(map[string]interface{})
	}
	r.Payload[key] = value
}

// SetHeader sets a request header
func (r *Request) SetHeader(key, value string) {
	if r.Headers == nil {
		r.Headers = make(map[string]string)
	}
	r.Headers[key] = value
}

// GetHeader gets a request header
func (r *Request) GetHeader(key string) (string, bool) {
	value, exists := r.Headers[key]
	return value, exists
}

// SetStatus updates the request status
func (r *Request) SetStatus(status RequestStatus) {
	r.Status = status
}

// IsCompleted returns true if the request is in a terminal state
func (r *Request) IsCompleted() bool {
	return r.Status == RequestComplete || r.Status == RequestFail || r.Status == RequestTimeout
}

// CanRetry returns true if the request can be retried
func (r *Request) CanRetry() bool {
	return r.Status == RequestFail && r.RetryCount < r.MaxRetries
}

// IncrementRetry increments the retry count
func (r *Request) IncrementRetry() {
	r.RetryCount++
}

// SetTimeout sets the request timeout
func (r *Request) SetTimeout(timeout float64) {
	r.Timeout = timeout
}

// IsTimedOut checks if the request has timed out
func (r *Request) IsTimedOut(currentTime float64) bool {
	return r.Timeout > 0 && currentTime-r.CreatedAt > r.Timeout
}

// GetProcessingTime returns the time taken to process the request
func (r *Request) GetProcessingTime() float64 {
	if r.StartedAt > 0 && r.CompletedAt > 0 {
		return r.CompletedAt - r.StartedAt
	}
	return 0
}

// GetTotalTime returns the total time from creation to completion
func (r *Request) GetTotalTime() float64 {
	if r.CreatedAt > 0 && r.CompletedAt > 0 {
		return r.CompletedAt - r.CreatedAt
	}
	return 0
}

// Clone creates a deep copy of the request
func (r *Request) Clone() *Request {
	payload := make(map[string]interface{})
	for k, v := range r.Payload {
		payload[k] = v
	}
	
	headers := make(map[string]string)
	for k, v := range r.Headers {
		headers[k] = v
	}
	
	return &Request{
		ID:            r.ID,
		Type:          r.Type,
		Status:        r.Status,
		SourceID:      r.SourceID,
		TargetID:      r.TargetID,
		Payload:       payload,
		Headers:       headers,
		CreatedAt:     r.CreatedAt,
		StartedAt:     r.StartedAt,
		CompletedAt:   r.CompletedAt,
		Timeout:       r.Timeout,
		Priority:      r.Priority,
		RetryCount:    r.RetryCount,
		MaxRetries:    r.MaxRetries,
		TraceID:       r.TraceID,
		SpanID:        r.SpanID,
		ParentSpanID:  r.ParentSpanID,
		RealCreatedAt: r.RealCreatedAt,
	}
}

