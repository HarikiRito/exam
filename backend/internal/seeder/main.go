package seeder

import (
	"context"
)

func RunSeeder(ctx context.Context) error {
	err := SeedPermissions(ctx)
	if err != nil {
		return err
	}
	err = SeedRoles(ctx)
	if err != nil {
		return err
	}
	err = SeedUsers(ctx)
	if err != nil {
		return err
	}
	return nil
}
