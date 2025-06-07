package utils

import (
	fakerPkg "github.com/jaswdr/faker/v2"
)

var Faker = fakerPkg.New()

func RandomDbSchema() string {
	totalChars := 20
	questionMarks := "schema_"
	for i := 0; i < totalChars; i++ {
		// Random between ? and #
		if Faker.Bool() {
			questionMarks += "?"
		} else {
			questionMarks += "#"
		}
	}
	return Faker.Bothify(questionMarks)
}
