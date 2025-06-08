package course_section

import (
	"context"
	"errors"
	"template/internal/ent"
	"template/internal/ent/course"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// UpdateCourseSection updates a course section, only if the user is the course creator.
func UpdateCourseSection(ctx context.Context, userId uuid.UUID, sectionId uuid.UUID, input model.UpdateCourseSectionInput) (*ent.CourseSection, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}

	section, err := tx.CourseSection.Query().Where(coursesection.ID(sectionId), coursesection.HasCourseWith(course.CreatorID(userId))).First(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	// Validate sectionId if provided
	if input.SectionID != nil {
		// Check if sectionId references itself
		if *input.SectionID == sectionId {
			return nil, db.Rollback(tx, errors.New("the section cannot be the child of itself"))
		}

		// Check if sectionId belongs to the same course
		parentSection, err := tx.CourseSection.Query().
			Where(coursesection.ID(*input.SectionID)).
			Select(coursesection.FieldCourseID).
			First(ctx)
		if err != nil {
			return nil, db.Rollback(tx, errors.New("invalid sectionId: section not found"))
		}
		if parentSection.CourseID != section.CourseID {
			return nil, db.Rollback(tx, errors.New("sectionId must belong to the same course"))
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

	section, err = section.Update().
		SetNillableTitle(input.Title).
		SetNillableDescription(input.Description).
		SetNillableSectionID(input.SectionID).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, db.Rollback(tx, err)
	}

	return section, nil
}
