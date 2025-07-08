package scalar

import (
	"fmt"
	"io"
	"time"

	"github.com/99designs/gqlgen/graphql"
)

const dateTimeFormat = "2006-01-02T15:04:05.000"

func MarshalDateTime(t time.Time) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		// Convert to UTC before formatting
		// Add the Z to the end of the string so that the client can parse it correctly
		io.WriteString(w, fmt.Sprintf("%q", t.UTC().Format(dateTimeFormat)+"Z"))
	})
}

func UnmarshalDateTime(v interface{}) (time.Time, error) {
	switch value := v.(type) {
	case string:
		return time.Parse(dateTimeFormat, value)
	case *string:
		if value == nil {
			return time.Time{}, nil
		}
		return time.Parse(dateTimeFormat, *value)
	default:
		return time.Time{}, fmt.Errorf("invalid DateTime type: %T", v)
	}
}
