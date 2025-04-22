package scalar

import (
	"fmt"
	"io"

	"github.com/99designs/gqlgen/graphql"
	"github.com/google/uuid"
)

func MarshalUUID(u uuid.UUID) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		io.WriteString(w, fmt.Sprintf("%q", u.String()))
	})
}

func UnmarshalUUID(v interface{}) (uuid.UUID, error) {
	switch value := v.(type) {
	case string:
		return uuid.Parse(value)
	case *string:
		if value == nil {
			return uuid.Nil, nil
		}
		return uuid.Parse(*value)
	default:
		return uuid.Nil, fmt.Errorf("invalid UUID type: %T", v)
	}
}
