package course_section

import (
	"context"
	"errors"
	"template/internal/ent/course"
	"template/internal/ent/coursesection"
	"template/internal/ent/db"
	"template/internal/ent/schema/mixin"

	"github.com/google/uuid"
)

// RemoveCourseSection deletes a course section and all its children, only if the user is the course creator.
func RemoveCourseSection(ctx context.Context, userId uuid.UUID, sectionId uuid.UUID) (bool, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return false, err
	}

	// Validate root section ownership
	exists, err := tx.CourseSection.Query().
		Where(coursesection.ID(sectionId), coursesection.HasCourseWith(course.CreatorID(userId))).
		Exist(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}
	if !exists {
		return false, db.Rollback(tx, errors.New("course section not found or unauthorized"))
	}

	// Fetch children sections
	children, err := tx.CourseSection.Query().
		Where(coursesection.SectionID(sectionId)).
		IDs(ctx)
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	// Batch delete children sections
	if len(children) > 0 {
		_, err = tx.CourseSection.Delete().
			Where(coursesection.IDIn(children...)).
			Exec(mixin.SkipSoftDelete(ctx))
		if err != nil {
			return false, db.Rollback(tx, err)
		}
	}

	// Delete root section
	err = tx.CourseSection.DeleteOneID(sectionId).Exec(mixin.SkipSoftDelete(ctx))
	if err != nil {
		return false, db.Rollback(tx, err)
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		return false, err
	}

	return true, nil
}
