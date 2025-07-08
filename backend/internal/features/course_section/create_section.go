package course_section

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// CreateCourseSection creates a new course section for a course, only if the user is the course creator.
func CreateCourseSection(ctx context.Context, userId uuid.UUID, courseId uuid.UUID, input model.CreateCourseSectionInput) (*ent.CourseSection, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	// Check if the user is the course creator
	crs, err := tx.Course.Get(ctx, courseId)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}
	if crs.CreatorID != userId {
		return nil, db.Rollback(tx, errors.New("unauthorized: only the course creator can add sections to this course"))
	}

	// Validate sectionId if provided
	if input.SectionID != nil {
		// Check if sectionId belongs to the same course
		parentSection, err := tx.CourseSection.Query().
			Where(coursesection.ID(*input.SectionID)).
			Select(coursesection.FieldCourseID).
			First(ctx)
		if err != nil {
			return nil, db.Rollback(tx, errors.New("invalid sectionId: section not found"))
		}
		if parentSection.CourseID != courseId {
			return nil, db.Rollback(tx, errors.New("section must belong to the same course"))
		}

		// Check if the section is a root section (do not have a parent section)
		isRootSection, err := tx.CourseSection.Query().
			Where(coursesection.ID(*input.SectionID)).
			Where(coursesection.SectionIDIsNil()).
			Exist(ctx)
		if err != nil {
			return nil, db.Rollback(tx, err)
		}
		if !isRootSection {
			return nil, db.Rollback(tx, errors.New("the section cannot be the child of a non-root section"))
		}
	}

	// Aggregate the max order of the section
	var order = -1
	var v []struct {
		Max int
	}

	if input.SectionID != nil {
		err = tx.CourseSection.Query().
			Where(coursesection.SectionID(*input.SectionID)).
			Aggregate(ent.Max(coursesection.FieldOrder)).
			Scan(ctx, &v)
		if err != nil {
			return nil, db.Rollback(tx, err)
		}
	} else {
		err = tx.CourseSection.Query().
			Where(coursesection.CourseID(courseId), coursesection.SectionIDIsNil()).
			Aggregate(ent.Max(coursesection.FieldOrder)).
			Scan(ctx, &v)
		if err != nil {
			return nil, db.Rollback(tx, err)
		}
	}

	// Ensure the order is always the max order + 1
	if len(v) > 0 {
		order = v[0].Max + 1
	}

	section, err := tx.CourseSection.Create().
		SetCourseID(courseId).
		SetTitle(input.Title).
		SetDescription(input.Description).
		SetNillableSectionID(input.SectionID).
		SetOrder(order).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, db.Rollback(tx, err)
	}

	return section, nil
}
