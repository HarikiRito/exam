package scalar

import (
	"fmt"
	"io"
	"time"

	"github.com/99designs/gqlgen/graphql"
)

const DateTimeFormat = "2006-01-02T15:04:05.000"

func MarshalDateTime(t time.Time) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		// ISO 8601 format without timezone
		io.WriteString(w, fmt.Sprintf("%q", t.Format(DateTimeFormat)))
	})
}

func UnmarshalDateTime(v interface{}) (time.Time, error) {
	switch value := v.(type) {
	case string:
		return time.Parse(DateTimeFormat, value)
	case *string:
		if value == nil {
			return time.Time{}, nil
		}
		return time.Parse(DateTimeFormat, *value)
	default:
		return time.Time{}, fmt.Errorf("invalid DateTime type: %T", v)
	}
}
