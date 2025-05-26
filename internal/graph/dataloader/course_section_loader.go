package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/course_section"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

func getCourseSections(ctx context.Context, sectionIDs []uuid.UUID) ([]*model.CourseSection, []error) {
	lu := NewLoaderByIds[ent.CourseSection, model.CourseSection](sectionIDs)

	lu.LoadItems(ctx, course_section.GetCourseSectionsByIDs, func(entSection *ent.CourseSection) string {
		return entSection.ID.String()
	}, func(entSection *ent.CourseSection) (*model.CourseSection, error) {
		return model.ConvertCourseSectionToModel(entSection), nil
	})

	return lu.Items, lu.Errors
}

// GetCourseSection returns a single course section by ID using the dataloader.
func GetCourseSection(ctx context.Context, sectionID uuid.UUID) (*model.CourseSection, error) {
	loaders := For(ctx)
	return loaders.CourseSectionLoader.Load(ctx, sectionID)
}
