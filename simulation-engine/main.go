package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/segmentio/kafka-go"
	"github.com/go-redis/redis/v8"
	"context"
)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	kafkaWriter *kafka.Writer
	redisClient *redis.Client
)

func initKafka() {
	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	if kafkaBrokers == "" {
		kafkaBrokers = "localhost:9092"
	}

	kafkaWriter = &kafka.Writer{
		Addr:     kafka.TCP(kafkaBrokers),
		Topic:    "simulation_events",
		Balancer: &kafka.LeastBytes{},
	}
	log.Printf("Kafka writer initialized for brokers: %s", kafkaBrokers)
}

func initRedis() {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}

	redisClient = redis.NewClient(&redis.Options{
		Addr: redisURL,
		Password: "", // no password set
		DB:       0,  // use default DB
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	log.Printf("Redis client initialized for URL: %s", redisURL)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	log.Println("Client connected via WebSocket")

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket read error:", err)
			return
		}
		log.Printf("Received message: %s", p)

		// Echo message back to client
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println("WebSocket write error:", err)
			return
		}
	}
}

func main() {
	initKafka()
	initRedis()

	http.HandleFunc("/ws", handleWebSocket)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simulation Engine is healthy!")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Simulation Engine starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}


