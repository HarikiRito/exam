import { createColumnHelper } from '@tanstack/react-table';
import { AppDataTable } from 'app/shared/components/table/AppDataTable';

// Define data type
interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  lastLogin: string;
}

// Status styles
const statusStyles: Record<Person['status'], string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

// Sample data
const data: Person[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    age: 32,
    status: 'active',
    role: 'Admin',
    lastLogin: '2023-08-15T10:30:00',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    age: 28,
    status: 'active',
    role: 'Editor',
    lastLogin: '2023-08-14T14:45:00',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    age: 41,
    status: 'inactive',
    role: 'Viewer',
    lastLogin: '2023-08-10T09:15:00',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    age: 36,
    status: 'active',
    role: 'Editor',
    lastLogin: '2023-08-13T16:20:00',
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    age: 45,
    status: 'inactive',
    role: 'Viewer',
    lastLogin: '2023-08-05T11:45:00',
  },
  {
    id: '6',
    firstName: 'Emily',
    lastName: 'Jones',
    email: 'emily.jones@example.com',
    age: 29,
    status: 'active',
    role: 'Admin',
    lastLogin: '2023-08-14T08:30:00',
  },
  {
    id: '7',
    firstName: 'Daniel',
    lastName: 'Miller',
    email: 'daniel.miller@example.com',
    age: 33,
    status: 'pending',
    role: 'Editor',
    lastLogin: '2023-08-12T13:15:00',
  },
  {
    id: '8',
    firstName: 'Olivia',
    lastName: 'Wilson',
    email: 'olivia.wilson@example.com',
    age: 27,
    status: 'active',
    role: 'Viewer',
    lastLogin: '2023-08-13T15:45:00',
  },
  {
    id: '9',
    firstName: 'James',
    lastName: 'Taylor',
    email: 'james.taylor@example.com',
    age: 38,
    status: 'pending',
    role: 'Admin',
    lastLogin: '2023-08-11T10:00:00',
  },
  {
    id: '10',
    firstName: 'Sophia',
    lastName: 'Anderson',
    email: 'sophia.anderson@example.com',
    age: 31,
    status: 'active',
    role: 'Editor',
    lastLogin: '2023-08-14T09:30:00',
  },
  {
    id: '11',
    firstName: 'Matthew',
    lastName: 'Thomas',
    email: 'matthew.thomas@example.com',
    age: 42,
    status: 'inactive',
    role: 'Viewer',
    lastLogin: '2023-08-07T14:20:00',
  },
  {
    id: '12',
    firstName: 'Emma',
    lastName: 'Jackson',
    email: 'emma.jackson@example.com',
    age: 26,
    status: 'active',
    role: 'Editor',
    lastLogin: '2023-08-13T11:15:00',
  },
  {
    id: '13',
    firstName: 'Christopher',
    lastName: 'White',
    email: 'christopher.white@example.com',
    age: 39,
    status: 'active',
    role: 'Admin',
    lastLogin: '2023-08-12T16:45:00',
  },
  {
    id: '14',
    firstName: 'Ava',
    lastName: 'Harris',
    email: 'ava.harris@example.com',
    age: 30,
    status: 'pending',
    role: 'Viewer',
    lastLogin: '2023-08-10T13:30:00',
  },
  {
    id: '15',
    firstName: 'Andrew',
    lastName: 'Martin',
    email: 'andrew.martin@example.com',
    age: 35,
    status: 'active',
    role: 'Editor',
    lastLogin: '2023-08-11T15:00:00',
  },
  {
    id: '16',
    firstName: 'Isabella',
    lastName: 'Thompson',
    email: 'isabella.thompson@example.com',
    age: 28,
    status: 'active',
    role: 'Viewer',
    lastLogin: '2023-08-13T10:45:00',
  },
  {
    id: '17',
    firstName: 'Joshua',
    lastName: 'Garcia',
    email: 'joshua.garcia@example.com',
    age: 37,
    status: 'inactive',
    role: 'Admin',
    lastLogin: '2023-08-09T09:00:00',
  },
  {
    id: '18',
    firstName: 'Mia',
    lastName: 'Martinez',
    email: 'mia.martinez@example.com',
    age: 29,
    status: 'active',
    role: 'Editor',
    lastLogin: '2023-08-14T11:30:00',
  },
  {
    id: '19',
    firstName: 'Ethan',
    lastName: 'Robinson',
    email: 'ethan.robinson@example.com',
    age: 34,
    status: 'pending',
    role: 'Viewer',
    lastLogin: '2023-08-12T10:15:00',
  },
  {
    id: '20',
    firstName: 'Charlotte',
    lastName: 'Clark',
    email: 'charlotte.clark@example.com',
    age: 31,
    status: 'active',
    role: 'Admin',
    lastLogin: '2023-08-13T14:00:00',
  },
];

export function DataTableExample() {
  // Create column helper for type-safe column definitions
  const columnHelper = createColumnHelper<Person>();

  // Define columns with proper typing
  const columns = [
    columnHelper.accessor('firstName', {
      header: 'First Name',
      cell: (info) => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('lastName', {
      header: 'Last Name',
      cell: (info) => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('age', {
      header: 'Age',
      cell: (info) => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const value = info.getValue();
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[value]}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('lastLogin', {
      header: 'Last Login',
      cell: (info) => new Date(info.getValue()).toLocaleString(),
      enableSorting: true,
      enableColumnFilter: true,
    }),
  ];

  return (
    <div className='container mx-auto py-6'>
      <h1 className='mb-6 text-2xl font-bold'>Data Table Example</h1>
      <AppDataTable columns={columns} data={data} searchPlaceholder='Search by name, email, role...' />
    </div>
  );
}
