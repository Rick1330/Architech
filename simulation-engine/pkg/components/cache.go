package components

import (
	"context"
	"fmt"
	"math/rand"
	"time"
	
	"simulation-engine/pkg/model"
)

// CacheEntry represents a cached item
type CacheEntry struct {
	Key       string      `json:"key"`
	Value     interface{} `json:"value"`
	Size      int         `json:"size"`
	Timestamp float64     `json:"timestamp"`
	AccessCount int       `json:"access_count"`
}

// Cache represents a cache component
type Cache struct {
	*model.BaseComponent
	HitRatio        float64                `json:"hit_ratio"`
	AccessTime      float64                `json:"access_time"`
	FailureRate     float64                `json:"failure_rate"`
	MaxSize         int                    `json:"max_size"`
	CurrentSize     int                    `json:"current_size"`
	Entries         map[string]*CacheEntry `json:"entries"`
	CacheHits       int64                  `json:"cache_hits"`
	CacheMisses     int64                  `json:"cache_misses"`
	CacheWrites     int64                  `json:"cache_writes"`
	CacheEvictions  int64                  `json:"cache_evictions"`
	OperationsFailed int64                 `json:"operations_failed"`
}

// NewCache creates a new cache component
func NewCache(id string) *Cache {
	return &Cache{
		BaseComponent:    model.NewBaseComponent(id, model.TypeCache),
		HitRatio:         0.8,   // Default 80% hit ratio
		AccessTime:       0.01,  // Default 0.01 time units
		FailureRate:      0.001, // Default 0.1% failure rate
		MaxSize:          1000,  // Default max 1000 entries
		CurrentSize:      0,
		Entries:          make(map[string]*CacheEntry),
		CacheHits:        0,
		CacheMisses:      0,
		CacheWrites:      0,
		CacheEvictions:   0,
		OperationsFailed: 0,
	}
}

// Initialize sets up the cache with properties
func (c *Cache) Initialize(properties map[string]interface{}) error {
	if err := c.BaseComponent.Initialize(properties); err != nil {
		return err
	}
	
	// Set hit ratio
	if hr, exists := properties["hit_ratio"]; exists {
		if hrFloat, ok := hr.(float64); ok {
			c.HitRatio = hrFloat
		}
	}
	
	// Set access time
	if at, exists := properties["access_time"]; exists {
		if atFloat, ok := at.(float64); ok {
			c.AccessTime = atFloat
		}
	}
	
	// Set failure rate
	if fr, exists := properties["failure_rate"]; exists {
		if frFloat, ok := fr.(float64); ok {
			c.FailureRate = frFloat
		}
	}
	
	// Set max size
	if ms, exists := properties["max_size"]; exists {
		if msInt, ok := ms.(float64); ok {
			c.MaxSize = int(msInt)
		}
	}
	
	return nil
}

// HandleEvent processes incoming events
func (c *Cache) HandleEvent(ctx context.Context, event *model.Event) ([]*model.Event, error) {
	var resultEvents []*model.Event
	
	switch event.Type {
	case model.DatabaseRead:
		resultEvents = c.handleCacheRead(event)
	case model.DatabaseWrite:
		resultEvents = c.handleCacheWrite(event)
	default:
		// Unknown event type, ignore
		return nil, nil
	}
	
	// Update metrics
	c.updateMetrics(event)
	
	return resultEvents, nil
}

// handleCacheRead processes cache read operations
func (c *Cache) handleCacheRead(event *model.Event) []*model.Event {
	var resultEvents []*model.Event
	var resultEvent *model.Event // Declare resultEvent here

	key, _ := event.GetDataValue("key")
	reqID, _ := event.GetDataValue("request_id")
	
	// Simulate operation failure
	if rand.Float64() < c.FailureRate {
		// Operation fails
		failEvent := model.NewEvent(
			fmt.Sprintf("cache_fail_%s_%d", c.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			c.GetID(),
			map[string]interface{}{
				"reason":     "cache_error",
				"operation":  "read",
				"key":        key,
				"request_id": reqID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		c.OperationsFailed++
		return resultEvents
	}
	
	keyStr := fmt.Sprintf("%v", key)
	
	c.SetState(model.StateProcessing)
	
	// Check if key exists in cache and simulate hit/miss based on hit ratio
	var isHit bool
	if entry, exists := c.Entries[keyStr]; exists {
		// Key exists, but still check against hit ratio for simulation
		isHit = rand.Float64() < c.HitRatio
		if isHit {
			entry.AccessCount++
			entry.Timestamp = event.Timestamp
		}
	} else {
		// Key doesn\'t exist, definitely a miss
		isHit = false
	}
	
	if isHit {
		// Cache hit
		c.CacheHits++
		resultEvent = model.NewEvent(
			fmt.Sprintf("cache_hit_%s_%d", c.GetID(), time.Now().UnixNano()),
			event.Timestamp + c.AccessTime,
			model.RequestCompleted,
			c.GetID(),
			map[string]interface{}{
				"operation":    "read",
				"result":       "hit",
				"key":          keyStr,
				"access_time":  c.AccessTime,
				"request_id":   reqID,
			},
		)
	} else {
		// Cache miss
		c.CacheMisses++
		resultEvent = model.NewEvent(
			fmt.Sprintf("cache_miss_%s_%d", c.GetID(), time.Now().UnixNano()),
			event.Timestamp + c.AccessTime,
			model.RequestFailed,
			c.GetID(),
			map[string]interface{}{
				"operation":    "read",
				"result":       "miss",
				"key":          keyStr,
				"access_time":  c.AccessTime,
				"request_id":   reqID,
			},
		)
	}
	
	resultEvents = append(resultEvents, resultEvent)
	
	c.SetState(model.StateIdle)
	return resultEvents
}

// handleCacheWrite processes cache write operations
func (c *Cache) handleCacheWrite(event *model.Event) []*model.Event {
	var resultEvents []*model.Event

	key, _ := event.GetDataValue("key")
	value, _ := event.GetDataValue("value")
	reqID, _ := event.GetDataValue("request_id")
	
	// Simulate operation failure
	if rand.Float64() < c.FailureRate {
		// Operation fails
		failEvent := model.NewEvent(
			fmt.Sprintf("cache_fail_%s_%d", c.GetID(), time.Now().UnixNano()),
			event.Timestamp,
			model.RequestFailed,
			c.GetID(),
			map[string]interface{}{
				"reason":     "cache_error",
				"operation":  "write",
				"key":        key,
				"request_id": reqID,
			},
		)
		resultEvents = append(resultEvents, failEvent)
		c.OperationsFailed++
		return resultEvents
	}
	
	keyStr := fmt.Sprintf("%v", key)
	size := 1 // Default size
	if s, exists := event.GetDataValue("size"); exists {
		if sInt, ok := s.(int); ok {
			size = sInt
		}
	}
	
	c.SetState(model.StateProcessing)
	
	// Check if we need to evict entries
	if c.CurrentSize + size > c.MaxSize {
		c.evictEntries(size)
	}
	
	// Add/update entry
	if existingEntry, exists := c.Entries[keyStr]; exists {
		// Update existing entry
		c.CurrentSize -= existingEntry.Size
		existingEntry.Value = value
		existingEntry.Size = size
		existingEntry.Timestamp = event.Timestamp
		existingEntry.AccessCount++
		c.CurrentSize += size
	} else {
		// Add new entry
		entry := &CacheEntry{
			Key:         keyStr,
			Value:       value,
			Size:        size,
			Timestamp:   event.Timestamp,
			AccessCount: 1,
		}
		c.Entries[keyStr] = entry
		c.CurrentSize += size
	}
	
	c.CacheWrites++
	
	// Create write success event
	resultEvent := model.NewEvent(
		fmt.Sprintf("cache_write_%s_%d", c.GetID(), time.Now().UnixNano()),
		event.Timestamp + c.AccessTime,
		model.RequestCompleted,
		c.GetID(),
		map[string]interface{}{
			"operation":    "write",
			"key":          keyStr,
			"size":         size,
			"access_time":  c.AccessTime,
			"request_id":   reqID,
		},
	)
	
	resultEvents = append(resultEvents, resultEvent)
	
	c.SetState(model.StateIdle)
	return resultEvents
}

// evictEntries evicts entries to make space for new data
func (c *Cache) evictEntries(requiredSpace int) {
	// Simple LRU eviction strategy
	for c.CurrentSize + requiredSpace > c.MaxSize && len(c.Entries) > 0 {
		// Find the least recently used entry
		var oldestKey string
		var oldestTimestamp float64 = -1
		
		for key, entry := range c.Entries {
			if oldestTimestamp < 0 || entry.Timestamp < oldestTimestamp {
				oldestTimestamp = entry.Timestamp
				oldestKey = key
			}
		}
		
		// Remove the oldest entry
		if oldestKey != "" {
			if entry, exists := c.Entries[oldestKey]; exists {
				c.CurrentSize -= entry.Size
				delete(c.Entries, oldestKey)
				c.CacheEvictions++
			}
		}
	}
}

// updateMetrics updates component metrics
func (c *Cache) updateMetrics(event *model.Event) {
	c.SetMetric("current_size", c.CurrentSize)
	c.SetMetric("cache_hits", c.CacheHits)
	c.SetMetric("cache_misses", c.CacheMisses)
	c.SetMetric("cache_writes", c.CacheWrites)
	c.SetMetric("cache_evictions", c.CacheEvictions)
	c.SetMetric("operations_failed", c.OperationsFailed)
	c.SetMetric("access_time", c.AccessTime)
	c.SetMetric("failure_rate", c.FailureRate)
	c.SetMetric("max_size", c.MaxSize)
	c.SetMetric("entry_count", len(c.Entries))
	
	// Calculate hit ratio
	totalReads := c.CacheHits + c.CacheMisses
	if totalReads > 0 {
		actualHitRatio := float64(c.CacheHits) / float64(totalReads)
		c.SetMetric("actual_hit_ratio", actualHitRatio)
	}
	
	// Calculate utilization
	utilization := float64(c.CurrentSize) / float64(c.MaxSize)
	c.SetMetric("utilization", utilization)
	
	// Calculate success rate
	total := c.CacheHits + c.CacheMisses + c.CacheWrites + c.OperationsFailed
	if total > 0 {
		successful := c.CacheHits + c.CacheWrites
		successRate := float64(successful) / float64(total)
		c.SetMetric("success_rate", successRate)
	}
}

// Start begins the cache operation
func (c *Cache) Start(ctx context.Context) error {
	if err := c.BaseComponent.Start(ctx); err != nil {
		return err
	}
	
	c.CurrentSize = 0
	c.CacheHits = 0
	c.CacheMisses = 0
	c.CacheWrites = 0
	c.CacheEvictions = 0
	c.OperationsFailed = 0
	c.Entries = make(map[string]*CacheEntry)
	c.SetState(model.StateIdle)
	
	return nil
}

// Stop gracefully shuts down the cache
func (c *Cache) Stop(ctx context.Context) error {
	c.SetState(model.StateStopped)
	return c.BaseComponent.Stop(ctx)
}

// Validate checks if the cache configuration is valid
func (c *Cache) Validate() error {
	if err := c.BaseComponent.Validate(); err != nil {
		return err
	}
	
	if c.HitRatio < 0 || c.HitRatio > 1 {
		return fmt.Errorf("hit ratio must be between 0 and 1")
	}
	
	if c.AccessTime <= 0 {
		return fmt.Errorf("access time must be positive")
	}
	
	if c.FailureRate < 0 || c.FailureRate > 1 {
		return fmt.Errorf("failure rate must be between 0 and 1")
	}
	
	if c.MaxSize <= 0 {
		return fmt.Errorf("max size must be positive")
	}
	
	return nil
}

// GetUtilization returns the current cache utilization percentage
func (c *Cache) GetUtilization() float64 {
	return float64(c.CurrentSize) / float64(c.MaxSize)
}

// GetActualHitRatio returns the actual hit ratio based on operations
func (c *Cache) GetActualHitRatio() float64 {
	totalReads := c.CacheHits + c.CacheMisses
	if totalReads == 0 {
		return 0.0
	}
	return float64(c.CacheHits) / float64(totalReads)
}

// GetSuccessRate returns the success rate
func (c *Cache) GetSuccessRate() float64 {
	total := c.CacheHits + c.CacheMisses + c.CacheWrites + c.OperationsFailed
	if total == 0 {
		return 1.0 // No operations processed yet, assume 100% success
	}
	successful := c.CacheHits + c.CacheWrites
	return float64(successful) / float64(total)
}

// IsFull returns true if the cache is at capacity
func (c *Cache) IsFull() bool {
	return c.CurrentSize >= c.MaxSize
}

// GetEntryCount returns the number of entries in the cache
func (c *Cache) GetEntryCount() int {
	return len(c.Entries)
}

// ClearCache clears all entries from the cache
func (c *Cache) ClearCache() {
	c.Entries = make(map[string]*CacheEntry)
	c.CurrentSize = 0
}

// GetEntry retrieves a cache entry by key
func (c *Cache) GetEntry(key string) (*CacheEntry, bool) {
	entry, exists := c.Entries[key]
	return entry, exists
}





