package internal

import (
	"context"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// jwtKey is the secret key for signing and validating JWTs.
// It must be the same key used in the loginHandler.
var jwtKey = []byte("my-super-secret-key")

func JWTInterceptor(secretKey []byte) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Error(codes.Unauthenticated, "no metadata provided")
		}

		authHeaders := md.Get("authorization")
		if len(authHeaders) == 0 {
			return nil, status.Error(codes.Unauthenticated, "authorization token not provided")
		}

		tokenString := authHeaders[0]
		if !strings.HasPrefix(tokenString, "Bearer ") {
			return nil, status.Error(codes.Unauthenticated, "authorization token must be Bearer token")
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})

		if err != nil {
			return nil, status.Error(codes.Unauthenticated, "invalid token: "+err.Error())
		}

		if !token.Valid {
			return nil, status.Error(codes.Unauthenticated, "invalid token")
		}

		// Token is valid, proceed with the original handler
		return handler(ctx, req)
	}
}

func JWTStreamInterceptor(secretKey []byte) grpc.StreamServerInterceptor {
	return func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		md, ok := metadata.FromIncomingContext(ss.Context())
		if !ok {
			return status.Error(codes.Unauthenticated, "no metadata provided")
		}

		authHeaders := md.Get("authorization")
		if len(authHeaders) == 0 {
			return status.Error(codes.Unauthenticated, "authorization token not provided")
		}

		tokenString := authHeaders[0]
		if !strings.HasPrefix(tokenString, "Bearer ") {
			return status.Error(codes.Unauthenticated, "authorization token must be Bearer token")
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
			return secretKey, nil
		})

		if err != nil {
			return status.Error(codes.Unauthenticated, "invalid token: "+err.Error())
		}

		if !token.Valid {
			return status.Error(codes.Unauthenticated, "invalid token")
		}

		// Token is valid, proceed with the original handler
		return handler(srv, ss)
	}
}
