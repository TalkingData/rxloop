import {
  ADD_TODO,
} from './actionTypes'

export function addTodo(text) {
  return { type: ADD_TODO, text }
}
