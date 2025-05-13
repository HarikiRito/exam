import { useQuery, gql } from '@apollo/client/index.js';

const GET_TODOS = gql`
  query {
    todos {
      id
      text
    }
  }
`;

// Define the Todo type
interface Todo {
  id: string;
  text: string;
}

export default function TodoList() {
  // Execute the query using the useQuery hook
  const { loading, error, data } = useQuery(GET_TODOS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Todo List</h2>
      <ul>
        {data.todos.map((todo: Todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
} 