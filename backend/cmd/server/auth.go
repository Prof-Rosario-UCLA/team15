package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// jwtKey should be a long, random string in a real application.
var jwtKey = []byte("my-super-secret-key")

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var creds Credentials
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// In a real application, you would check credentials against a database.
	// Here, we are using hardcoded credentials as per the project plan.
	if creds.Username != "admin" || creds.Password != "secret" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Create JWT with 1h expiry
	expirationTime := time.Now().Add(1 * time.Hour)
	claims := &jwt.RegisteredClaims{
		Subject:   creds.Username,
		ExpiresAt: jwt.NewNumericDate(expirationTime),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	cookie := &http.Cookie{
		Name:     "access_token",
		Value:    tokenString,
		Expires:  expirationTime,
		HttpOnly: true, // Important for security
		Path:     "/",  // Cookie is valid for all paths
		SameSite: http.SameSiteLaxMode,
		Secure:   false, // Should be true in production (HTTPS)
	}
	http.SetCookie(w, cookie)
	w.WriteHeader(http.StatusOK)
}
