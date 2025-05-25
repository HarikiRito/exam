package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/course_section"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// courseSectionBatchFunc is a wrapper that handles authentication for the dataloader
func courseSectionBatchFunc(ctx context.Context, sectionIDs []uuid.UUID) ([]*ent.CourseSection, error) {

	return course_section.GetCourseSectionsByIDs(ctx, sectionIDs)
}

func getCourseSections(ctx context.Context, sectionIDs []uuid.UUID) ([]*model.CourseSection, []error) {
	lu := NewLoaderByIds[ent.CourseSection, model.CourseSection](sectionIDs)

	lu.LoadItems(ctx, courseSectionBatchFunc, func(entSection *ent.CourseSection) string {
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
