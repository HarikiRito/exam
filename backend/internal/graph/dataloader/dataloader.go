package dataloader

import (
	"context"
	"time"

	"template/internal/features/permission"
	"template/internal/graph/model"

	"github.com/google/uuid"
	"github.com/vikstrous/dataloadgen"
)

type ctxKey string

const loadersKey = ctxKey("dataloaders")

// Loaders wraps the dataloader instances.
type Loaders struct {
	UserLoader                      *dataloadgen.Loader[uuid.UUID, *model.User]
	QuestionLoader                  *dataloadgen.Loader[uuid.UUID, *model.Question]
	RolesByUserLoader               *dataloadgen.Loader[uuid.UUID, []*model.Role]
	PermissionsByUserLoader         *dataloadgen.Loader[uuid.UUID, []permission.Permission]
	CourseSectionLoader             *dataloadgen.Loader[uuid.UUID, *model.CourseSection]
	QuestionOptionLoader            *dataloadgen.Loader[uuid.UUID, []*model.QuestionOption]
	CorrectOptionCountLoader        *dataloadgen.Loader[uuid.UUID, int]
	QuestionCollectionLoader        *dataloadgen.Loader[uuid.UUID, *model.QuestionCollection]
	QuestionsByCollectionLoader     *dataloadgen.Loader[uuid.UUID, []*model.Question]
	QuestionsBySessionLoader        *dataloadgen.Loader[uuid.UUID, []*model.Question]
	OrderedQuestionsBySessionLoader *dataloadgen.Loader[uuid.UUID, []*model.QuestionOrder]
	QuestionCollectionsByTestLoader *dataloadgen.Loader[uuid.UUID, []*model.QuestionCollection]
	TestQuestionCountsByTestLoader  *dataloadgen.Loader[uuid.UUID, []*model.TestQuestionCount]
	TestIgnoreQuestionsByTestLoader *dataloadgen.Loader[uuid.UUID, []*model.TestIgnoreQuestion]
	TestLoader                      *dataloadgen.Loader[uuid.UUID, *model.Test]
}

// NewLoaders instantiates and returns a new Loaders struct with a UserLoader.
func NewLoaders() *Loaders {
	return &Loaders{
		UserLoader:                      dataloadgen.NewLoader(getUsers, dataloadgen.WithWait(time.Millisecond)),
		QuestionLoader:                  dataloadgen.NewLoader(getQuestions, dataloadgen.WithWait(time.Millisecond)),
		RolesByUserLoader:               dataloadgen.NewLoader(getRolesByUserIDs, dataloadgen.WithWait(time.Millisecond)),
		PermissionsByUserLoader:         dataloadgen.NewLoader(getPermissionsByUserIDs, dataloadgen.WithWait(time.Millisecond)),
		CourseSectionLoader:             dataloadgen.NewLoader(getCourseSections, dataloadgen.WithWait(time.Millisecond)),
		QuestionOptionLoader:            dataloadgen.NewLoader(getQuestionOptionsByQuestionIDs, dataloadgen.WithWait(time.Millisecond)),
		CorrectOptionCountLoader:        dataloadgen.NewLoader(GetCorrectOptionCountByQuestionIds, dataloadgen.WithWait(time.Millisecond)),
		QuestionCollectionLoader:        dataloadgen.NewLoader(getQuestionCollectionsByQuestionIDs, dataloadgen.WithWait(time.Millisecond)),
		QuestionsByCollectionLoader:     dataloadgen.NewLoader(getQuestionsByCollectionIDs, dataloadgen.WithWait(time.Millisecond)),
		QuestionsBySessionLoader:        dataloadgen.NewLoader(getQuestionsBySessionIDs, dataloadgen.WithWait(time.Millisecond)),
		OrderedQuestionsBySessionLoader: dataloadgen.NewLoader(getOrderedQuestionsBySessionIDs, dataloadgen.WithWait(time.Millisecond)),
		QuestionCollectionsByTestLoader: dataloadgen.NewLoader(getQuestionCollectionsByTestIDs, dataloadgen.WithWait(time.Millisecond)),
		TestQuestionCountsByTestLoader:  dataloadgen.NewLoader(getTestQuestionCountsByTestIDs, dataloadgen.WithWait(time.Millisecond)),
		TestIgnoreQuestionsByTestLoader: dataloadgen.NewLoader(getTestIgnoreQuestionsByTestIDs, dataloadgen.WithWait(time.Millisecond)),
		TestLoader:                      dataloadgen.NewLoader(getTests, dataloadgen.WithWait(time.Millisecond)),
	}
}

// For retrieves the Loaders instance from the context.
func For(ctx context.Context) *Loaders {
	return ctx.Value(loadersKey).(*Loaders)
}

// AddToContext injects a new Loaders instance into the provided context and returns the new context.
func AddToContext(ctx context.Context) context.Context {
	return context.WithValue(ctx, loadersKey, NewLoaders())
}
