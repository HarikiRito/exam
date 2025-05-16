import { useTodoListQuery } from 'app/graphql/operations/todo.generated';

export default function TodoList() {
  // Execute the query using the useQuery hook
  const { loading, error, data } = useTodoListQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Todo List</h2>
      <ul>{data?.todos.map((todo) => <li key={todo.id}>{todo.text}</li>)}</ul>
    </div>
  );
}
