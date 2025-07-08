interface IsMoreThanOrEqualProps<T> {
  list: T[];
  condition: (item: T) => boolean;
  num: number;
}

/**
 * Checks if the number of items in the list that satisfy the condition is greater than or equal to the number. This will make sure that we don't have to iterate over the whole list to check if the condition is met.
 * @param list - The list of items to check.
 * @param condition - The condition to check.
 * @param num - The number of items that must satisfy the condition.
 * @returns True if the number of items that satisfy the condition is greater than or equal to the number, false otherwise.
 */
export function isMoreThanOrEqual<T>({ list, condition, num = 2 }: IsMoreThanOrEqualProps<T>) {
  let count = 0;
  for (const item of list) {
    if (condition(item)) {
      count++;
    }
    if (count >= num) {
      return true;
    }
  }
  return false;
}
