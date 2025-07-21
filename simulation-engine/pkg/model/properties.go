package model

import (
	"fmt"
	"time"
)

// CommonProperties defines standard properties that most components support
type CommonProperties struct {
	// Performance properties
	ProcessingTime    float64 `json:"processing_time"`     // Base processing time in simulation time units
	ProcessingTimeVar float64 `json:"processing_time_var"` // Variance in processing time (for randomization)
	Capacity          int     `json:"capacity"`            // Maximum concurrent requests
	Throughput        float64 `json:"throughput"`          // Requests per time unit
	
	// Reliability properties
	FailureRate       float64 `json:"failure_rate"`        // Probability of failure (0.0 - 1.0)
	MTBF              float64 `json:"mtbf"`                // Mean Time Between Failures
	MTTR              float64 `json:"mttr"`                // Mean Time To Recovery
	
	// Network properties
	NetworkLatency    float64 `json:"network_latency"`     // Network latency in simulation time units
	NetworkLatencyVar float64 `json:"network_latency_var"` // Variance in network latency
	Bandwidth         float64 `json:"bandwidth"`           // Network bandwidth
	
	// Resource properties
	CPUUsage          float64 `json:"cpu_usage"`           // CPU utilization (0.0 - 1.0)
	MemoryUsage       float64 `json:"memory_usage"`        // Memory utilization (0.0 - 1.0)
	DiskUsage         float64 `json:"disk_usage"`          // Disk utilization (0.0 - 1.0)
	
	// Timeout properties
	RequestTimeout    float64 `json:"request_timeout"`     // Request timeout in simulation time units
	ConnectionTimeout float64 `json:"connection_timeout"`  // Connection timeout
	
	// Retry properties
	MaxRetries        int     `json:"max_retries"`         // Maximum retry attempts
	RetryDelay        float64 `json:"retry_delay"`         // Delay between retries
	BackoffMultiplier float64 `json:"backoff_multiplier"`  // Exponential backoff multiplier
	
	// Circuit breaker properties
	CircuitBreakerEnabled    bool    `json:"circuit_breaker_enabled"`
	CircuitBreakerThreshold  int     `json:"circuit_breaker_threshold"`  // Failure threshold
	CircuitBreakerTimeout    float64 `json:"circuit_breaker_timeout"`    // Time before retry
	CircuitBreakerHalfOpen   int     `json:"circuit_breaker_half_open"`   // Requests in half-open state
}

// DefaultCommonProperties returns default values for common properties
func DefaultCommonProperties() *CommonProperties {
	return &CommonProperties{
		ProcessingTime:           1.0,
		ProcessingTimeVar:        0.1,
		Capacity:                 100,
		Throughput:               10.0,
		FailureRate:              0.01,
		MTBF:                     1000.0,
		MTTR:                     10.0,
		NetworkLatency:           0.1,
		NetworkLatencyVar:        0.01,
		Bandwidth:                1000.0,
		CPUUsage:                 0.5,
		MemoryUsage:              0.3,
		DiskUsage:                0.2,
		RequestTimeout:           30.0,
		ConnectionTimeout:        5.0,
		MaxRetries:               3,
		RetryDelay:               1.0,
		BackoffMultiplier:        2.0,
		CircuitBreakerEnabled:    false,
		CircuitBreakerThreshold:  5,
		CircuitBreakerTimeout:    60.0,
		CircuitBreakerHalfOpen:   3,
	}
}

// DatabaseProperties defines properties specific to database components
type DatabaseProperties struct {
	*CommonProperties
	
	// Database-specific properties
	ReadLatency       float64 `json:"read_latency"`        // Read operation latency
	WriteLatency      float64 `json:"write_latency"`       // Write operation latency
	QueryLatency      float64 `json:"query_latency"`       // Complex query latency
	ConnectionPoolSize int    `json:"connection_pool_size"` // Database connection pool size
	MaxConnections    int     `json:"max_connections"`     // Maximum concurrent connections
	TransactionTimeout float64 `json:"transaction_timeout"` // Transaction timeout
	LockTimeout       float64 `json:"lock_timeout"`        // Lock timeout
	
	// Consistency properties
	ConsistencyLevel  string  `json:"consistency_level"`   // eventual, strong, etc.
	ReplicationFactor int     `json:"replication_factor"`  // Number of replicas
	
	// Performance properties
	CacheHitRatio     float64 `json:"cache_hit_ratio"`     // Cache hit ratio (0.0 - 1.0)
	IndexEfficiency   float64 `json:"index_efficiency"`    // Index efficiency (0.0 - 1.0)
}

// DefaultDatabaseProperties returns default values for database properties
func DefaultDatabaseProperties() *DatabaseProperties {
	return &DatabaseProperties{
		CommonProperties:   DefaultCommonProperties(),
		ReadLatency:        0.5,
		WriteLatency:       1.0,
		QueryLatency:       2.0,
		ConnectionPoolSize: 20,
		MaxConnections:     100,
		TransactionTimeout: 30.0,
		LockTimeout:        10.0,
		ConsistencyLevel:   "eventual",
		ReplicationFactor:  3,
		CacheHitRatio:      0.8,
		IndexEfficiency:    0.9,
	}
}

// MessageQueueProperties defines properties specific to message queue components
type MessageQueueProperties struct {
	*CommonProperties
	
	// Queue-specific properties
	QueueSize         int     `json:"queue_size"`          // Maximum queue size
	MessageSize       int     `json:"message_size"`        // Average message size in bytes
	DeliveryGuarantee string  `json:"delivery_guarantee"`  // at-most-once, at-least-once, exactly-once
	Persistence       bool    `json:"persistence"`         // Whether messages are persisted
	
	// Performance properties
	EnqueueLatency    float64 `json:"enqueue_latency"`     // Time to enqueue a message
	DequeueLatency    float64 `json:"dequeue_latency"`     // Time to dequeue a message
	
	// Partitioning properties
	PartitionCount    int     `json:"partition_count"`     // Number of partitions
	ReplicationFactor int     `json:"replication_factor"`  // Replication factor
	
	// Consumer properties
	ConsumerCount     int     `json:"consumer_count"`      // Number of consumers
	PrefetchCount     int     `json:"prefetch_count"`      // Messages prefetched per consumer
}

// DefaultMessageQueueProperties returns default values for message queue properties
func DefaultMessageQueueProperties() *MessageQueueProperties {
	return &MessageQueueProperties{
		CommonProperties:  DefaultCommonProperties(),
		QueueSize:         10000,
		MessageSize:       1024,
		DeliveryGuarantee: "at-least-once",
		Persistence:       true,
		EnqueueLatency:    0.1,
		DequeueLatency:    0.1,
		PartitionCount:    3,
		ReplicationFactor: 3,
		ConsumerCount:     1,
		PrefetchCount:     10,
	}
}

// LoadBalancerProperties defines properties specific to load balancer components
type LoadBalancerProperties struct {
	*CommonProperties
	
	// Load balancing properties
	Algorithm         string   `json:"algorithm"`           // round-robin, least-connections, weighted, etc.
	HealthCheckInterval float64 `json:"health_check_interval"` // Health check interval
	HealthCheckTimeout  float64 `json:"health_check_timeout"`  // Health check timeout
	
	// Backend properties
	BackendCount      int      `json:"backend_count"`       // Number of backend servers
	BackendWeights    []float64 `json:"backend_weights"`    // Weights for weighted algorithms
	
	// Session properties
	SessionAffinity   bool     `json:"session_affinity"`    // Enable session affinity
	SessionTimeout    float64  `json:"session_timeout"`     // Session timeout
}

// DefaultLoadBalancerProperties returns default values for load balancer properties
func DefaultLoadBalancerProperties() *LoadBalancerProperties {
	return &LoadBalancerProperties{
		CommonProperties:    DefaultCommonProperties(),
		Algorithm:           "round-robin",
		HealthCheckInterval: 30.0,
		HealthCheckTimeout:  5.0,
		BackendCount:        3,
		BackendWeights:      []float64{1.0, 1.0, 1.0},
		SessionAffinity:     false,
		SessionTimeout:      1800.0,
	}
}

// PropertyValidator provides validation for component properties
type PropertyValidator struct{}

// ValidateCommonProperties validates common properties
func (pv *PropertyValidator) ValidateCommonProperties(props *CommonProperties) error {
	if props.ProcessingTime < 0 {
		return fmt.Errorf("processing_time must be non-negative")
	}
	if props.ProcessingTimeVar < 0 {
		return fmt.Errorf("processing_time_var must be non-negative")
	}
	if props.Capacity <= 0 {
		return fmt.Errorf("capacity must be positive")
	}
	if props.Throughput <= 0 {
		return fmt.Errorf("throughput must be positive")
	}
	if props.FailureRate < 0 || props.FailureRate > 1 {
		return fmt.Errorf("failure_rate must be between 0 and 1")
	}
	if props.MTBF <= 0 {
		return fmt.Errorf("mtbf must be positive")
	}
	if props.MTTR <= 0 {
		return fmt.Errorf("mttr must be positive")
	}
	return nil
}

// ValidateDatabaseProperties validates database-specific properties
func (pv *PropertyValidator) ValidateDatabaseProperties(props *DatabaseProperties) error {
	if err := pv.ValidateCommonProperties(props.CommonProperties); err != nil {
		return err
	}
	
	if props.ReadLatency < 0 {
		return fmt.Errorf("read_latency must be non-negative")
	}
	if props.WriteLatency < 0 {
		return fmt.Errorf("write_latency must be non-negative")
	}
	if props.QueryLatency < 0 {
		return fmt.Errorf("query_latency must be non-negative")
	}
	if props.ConnectionPoolSize <= 0 {
		return fmt.Errorf("connection_pool_size must be positive")
	}
	if props.MaxConnections <= 0 {
		return fmt.Errorf("max_connections must be positive")
	}
	if props.CacheHitRatio < 0 || props.CacheHitRatio > 1 {
		return fmt.Errorf("cache_hit_ratio must be between 0 and 1")
	}
	if props.IndexEfficiency < 0 || props.IndexEfficiency > 1 {
		return fmt.Errorf("index_efficiency must be between 0 and 1")
	}
	
	return nil
}

// PropertyExtractor helps extract properties from generic maps
type PropertyExtractor struct{}

// ExtractFloat64 safely extracts a float64 value from a property map
func (pe *PropertyExtractor) ExtractFloat64(props map[string]interface{}, key string, defaultValue float64) float64 {
	if value, exists := props[key]; exists {
		switch v := value.(type) {
		case float64:
			return v
		case float32:
			return float64(v)
		case int:
			return float64(v)
		case int64:
			return float64(v)
		}
	}
	return defaultValue
}

// ExtractInt safely extracts an int value from a property map
func (pe *PropertyExtractor) ExtractInt(props map[string]interface{}, key string, defaultValue int) int {
	if value, exists := props[key]; exists {
		switch v := value.(type) {
		case int:
			return v
		case int64:
			return int(v)
		case float64:
			return int(v)
		case float32:
			return int(v)
		}
	}
	return defaultValue
}

// ExtractString safely extracts a string value from a property map
func (pe *PropertyExtractor) ExtractString(props map[string]interface{}, key string, defaultValue string) string {
	if value, exists := props[key]; exists {
		if str, ok := value.(string); ok {
			return str
		}
	}
	return defaultValue
}

// ExtractBool safely extracts a bool value from a property map
func (pe *PropertyExtractor) ExtractBool(props map[string]interface{}, key string, defaultValue bool) bool {
	if value, exists := props[key]; exists {
		if b, ok := value.(bool); ok {
			return b
		}
	}
	return defaultValue
}

// ExtractDuration safely extracts a duration from a property map
func (pe *PropertyExtractor) ExtractDuration(props map[string]interface{}, key string, defaultValue time.Duration) time.Duration {
	if value, exists := props[key]; exists {
		switch v := value.(type) {
		case string:
			if duration, err := time.ParseDuration(v); err == nil {
				return duration
			}
		case float64:
			return time.Duration(v * float64(time.Second))
		case int:
			return time.Duration(v) * time.Second
		}
	}
	return defaultValue
}

