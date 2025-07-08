package log

import "fmt"

// Debug prints a debug message to the console for easy recognition of debug logs.
func Debug(v ...any) {
	fmt.Println("--- DEBUG --- ", v)
}

func Debugf(format string, v ...any) {
	fmt.Printf("--- DEBUG --- %s\n", fmt.Sprintf(format, v...))
}
