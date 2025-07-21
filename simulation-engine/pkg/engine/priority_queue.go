package engine

import (
	"container/heap"
	"sync"
	
	"../model"
)

// EventQueue represents a priority queue for simulation events
type EventQueue struct {
	items []*model.Event
	mutex sync.RWMutex
}

// NewEventQueue creates a new event queue
func NewEventQueue() *EventQueue {
	eq := &EventQueue{
		items: make([]*model.Event, 0),
	}
	heap.Init(eq)
	return eq
}

// Len returns the number of items in the queue
func (eq *EventQueue) Len() int {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	return len(eq.items)
}

// Less compares two events for priority ordering
// Events are ordered by timestamp first, then by priority
func (eq *EventQueue) Less(i, j int) bool {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	// Primary sort by timestamp (earlier events first)
	if eq.items[i].Timestamp != eq.items[j].Timestamp {
		return eq.items[i].Timestamp < eq.items[j].Timestamp
	}
	
	// Secondary sort by priority (lower priority values first)
	return eq.items[i].Priority < eq.items[j].Priority
}

// Swap swaps two events in the queue
func (eq *EventQueue) Swap(i, j int) {
	eq.mutex.Lock()
	defer eq.mutex.Unlock()
	eq.items[i], eq.items[j] = eq.items[j], eq.items[i]
}

// Push adds an event to the queue (used by heap.Push)
func (eq *EventQueue) Push(x interface{}) {
	eq.mutex.Lock()
	defer eq.mutex.Unlock()
	eq.items = append(eq.items, x.(*model.Event))
}

// Pop removes and returns the highest priority event (used by heap.Pop)
func (eq *EventQueue) Pop() interface{} {
	eq.mutex.Lock()
	defer eq.mutex.Unlock()
	
	old := eq.items
	n := len(old)
	if n == 0 {
		return nil
	}
	
	item := old[n-1]
	old[n-1] = nil // avoid memory leak
	eq.items = old[0 : n-1]
	return item
}

// Enqueue adds an event to the queue
func (eq *EventQueue) Enqueue(event *model.Event) {
	heap.Push(eq, event)
}

// Dequeue removes and returns the next event to process
func (eq *EventQueue) Dequeue() *model.Event {
	if eq.Len() == 0 {
		return nil
	}
	return heap.Pop(eq).(*model.Event)
}

// Peek returns the next event without removing it
func (eq *EventQueue) Peek() *model.Event {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	if len(eq.items) == 0 {
		return nil
	}
	return eq.items[0]
}

// IsEmpty returns true if the queue is empty
func (eq *EventQueue) IsEmpty() bool {
	return eq.Len() == 0
}

// Clear removes all events from the queue
func (eq *EventQueue) Clear() {
	eq.mutex.Lock()
	defer eq.mutex.Unlock()
	eq.items = eq.items[:0]
}

// GetEvents returns a copy of all events in the queue (for debugging)
func (eq *EventQueue) GetEvents() []*model.Event {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	events := make([]*model.Event, len(eq.items))
	copy(events, eq.items)
	return events
}

// RemoveEventsForComponent removes all events for a specific component
func (eq *EventQueue) RemoveEventsForComponent(componentID string) int {
	eq.mutex.Lock()
	defer eq.mutex.Unlock()
	
	removed := 0
	newItems := make([]*model.Event, 0, len(eq.items))
	
	for _, event := range eq.items {
		if event.ComponentID != componentID {
			newItems = append(newItems, event)
		} else {
			removed++
		}
	}
	
	eq.items = newItems
	heap.Init(eq) // Re-heapify after removing items
	return removed
}

// GetEventsForComponent returns all events for a specific component
func (eq *EventQueue) GetEventsForComponent(componentID string) []*model.Event {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	var events []*model.Event
	for _, event := range eq.items {
		if event.ComponentID == componentID {
			events = append(events, event)
		}
	}
	return events
}

// GetEventsByType returns all events of a specific type
func (eq *EventQueue) GetEventsByType(eventType model.EventType) []*model.Event {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	var events []*model.Event
	for _, event := range eq.items {
		if event.Type == eventType {
			events = append(events, event)
		}
	}
	return events
}

// GetEventsInTimeRange returns all events within a time range
func (eq *EventQueue) GetEventsInTimeRange(startTime, endTime float64) []*model.Event {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	var events []*model.Event
	for _, event := range eq.items {
		if event.Timestamp >= startTime && event.Timestamp <= endTime {
			events = append(events, event)
		}
	}
	return events
}

// GetNextEventTime returns the timestamp of the next event to be processed
func (eq *EventQueue) GetNextEventTime() float64 {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	if len(eq.items) == 0 {
		return -1 // No events
	}
	return eq.items[0].Timestamp
}

// Size returns the current size of the queue
func (eq *EventQueue) Size() int {
	return eq.Len()
}

// Stats returns statistics about the queue
func (eq *EventQueue) Stats() map[string]interface{} {
	eq.mutex.RLock()
	defer eq.mutex.RUnlock()
	
	stats := map[string]interface{}{
		"size": len(eq.items),
	}
	
	if len(eq.items) > 0 {
		stats["next_event_time"] = eq.items[0].Timestamp
		
		// Count events by type
		eventTypeCounts := make(map[model.EventType]int)
		for _, event := range eq.items {
			eventTypeCounts[event.Type]++
		}
		stats["event_type_counts"] = eventTypeCounts
		
		// Count events by component
		componentCounts := make(map[string]int)
		for _, event := range eq.items {
			componentCounts[event.ComponentID]++
		}
		stats["component_counts"] = componentCounts
	}
	
	return stats
}

