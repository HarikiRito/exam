package dataloader

import (
	"context"
	"template/internal/ent"
	"template/internal/features/course_section"
	"template/internal/graph/model"
	"template/internal/shared/utilities/slice"

	"github.com/google/uuid"
)

func getCourseSections(ctx context.Context, sectionIDs []uuid.UUID) ([]*model.CourseSection, []error) {
	lu := NewLoaderByIds[ent.CourseSection, model.CourseSection](sectionIDs)

	lu.LoadItemsOneToOne(ctx, course_section.GetCourseSectionsByIDs, func(id uuid.UUID, items []*ent.CourseSection) *ent.CourseSection {
		return *slice.Find(items, func(item *ent.CourseSection) bool {
			return item.ID == id
		})
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
