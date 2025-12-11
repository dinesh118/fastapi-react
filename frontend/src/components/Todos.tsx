import { useEffect, useState, useContext, createContext } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Stack,
  Text,
  DialogActionTrigger,
} from "@chakra-ui/react";

// Use Nginx proxy in production
const API_URL = "/api";

// Strong types for todos and context
interface Todo {
  id: string;      // keep id as string for consistency
  item: string;
}

interface TodosContextValue {
  todos: Todo[];
  fetchTodos: () => Promise<void> | void;
}

const TodosContext = createContext<TodosContextValue>({
  todos: [],
  fetchTodos: () => {},
});

function AddTodo() {
  const [item, setItem] = useState("");
  const { todos, fetchTodos } = useContext(TodosContext);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Create a new id as string
    const newTodo: Todo = {
      id: String(todos.length + 1),
      item,
    };

    await fetch(`${API_URL}/todo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });

    await fetchTodos();
    setItem("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        pr="4.5rem"
        type="text"
        placeholder="Add a todo item"
        aria-label="Add a todo item"
        value={item}
        onChange={handleInput}
      />
    </form>
  );
}

interface UpdateTodoProps {
  item: string;
  id: string;
  fetchTodos: () => Promise<void> | void;
}

const UpdateTodo = ({ item, id, fetchTodos }: UpdateTodoProps) => {
  const [todo, setTodo] = useState(item);

  const updateTodo = async () => {
    await fetch(`${API_URL}/todo/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: todo }),
    });
    await fetchTodos();
  };

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button h="1.5rem" size="sm">
          Update Todo
        </Button>
      </DialogTrigger>
      <DialogContent
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="white"
        p={6}
        rounded="md"
        shadow="xl"
        maxW="md"
        w="90%"
        zIndex={1000}
      >
        <DialogHeader>
          <DialogTitle>Update Todo</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Input
            pr="4.5rem"
            type="text"
            placeholder="Edit todo item"
            aria-label="Edit todo item"
            value={todo}
            onChange={(event) => setTodo(event.target.value)}
          />
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button size="sm" onClick={updateTodo}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

interface DeleteTodoProps {
  id: string;
  fetchTodos: () => Promise<void> | void;
}

const DeleteTodo = ({ id, fetchTodos }: DeleteTodoProps) => {
  const deleteTodo = async () => {
    await fetch(`${API_URL}/todo/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchTodos();
  };

  return (
    <Button h="1.5rem" size="sm" marginLeft={2} onClick={deleteTodo}>
      Delete Todo
    </Button>
  );
};

interface TodoHelperProps {
  item: string;
  id: string;
  fetchTodos: () => Promise<void> | void;
}

function TodoHelper({ item, id, fetchTodos }: TodoHelperProps) {
  return (
    <Box p={1} shadow="sm">
      <Flex justify="space-between">
        <Text mt={4} as="div">
          {item}
          <Flex align="end">
            <UpdateTodo item={item} id={id} fetchTodos={fetchTodos} />
            <DeleteTodo id={id} fetchTodos={fetchTodos} />
          </Flex>
        </Text>
      </Flex>
    </Box>
  );
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const fetchTodos = async () => {
    const response = await fetch(`${API_URL}/todo`);
    const data = await response.json();
    // Expecting { data: Todo[] } from backend
    const list: Todo[] = Array.isArray(data?.data) ? data.data : [];
    setTodos(list);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <TodosContext.Provider value={{ todos, fetchTodos }}>
      <Container maxW="container.xl" pt="100px">
        <AddTodo />
        <Stack gap={5}>
          {todos.map((todo) => (
            <TodoHelper
              key={todo.id}
              item={todo.item}
              id={todo.id}
              fetchTodos={fetchTodos}
            />
          ))}
        </Stack>
      </Container>
    </TodosContext.Provider>
  );
}
