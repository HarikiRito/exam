package prepare

import (
	"template/integration_test/setup"
	"template/integration_test/utils"
	"testing"
)

func SetupTestDb(t *testing.T) string {
	dbSchema := utils.RandomDbSchema()
	setup.ResetTestSchema(t, dbSchema)
	t.Cleanup(func() {
		setup.DeleteTestSchema(t, dbSchema)
	})
	return dbSchema
}
