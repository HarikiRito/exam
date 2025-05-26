package question_collection

import (
	"context"
	"template/internal/ent"
	"template/internal/ent/db"
	"template/internal/graph/model"

	"github.com/google/uuid"
)

// CreateQuestionCollection creates a new question collection for the authenticated user.
func CreateQuestionCollection(ctx context.Context, userId uuid.UUID, input model.CreateQuestionCollectionInput) (*ent.QuestionCollection, error) {
	tx, err := db.OpenTransaction(ctx)
	if err != nil {
		return nil, err
	}
	defer db.CloseTransaction(tx)

	collection, err := tx.QuestionCollection.Create().
		SetTitle(input.Title).
		SetNillableDescription(input.Description).
		SetCreatorID(userId).
		Save(ctx)
	if err != nil {
		return nil, db.Rollback(tx, err)
	}

	if err := tx.Commit(); err != nil {
		return nil, db.Rollback(tx, err)
	}

	return collection, nil
}
